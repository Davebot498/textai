/**
 * Text-to-Speech API Route for Texti AI
 * 
 * This serverless function proxies requests to ElevenLabs TTS API
 * while keeping the API key secure on the server side.
 */

import { getVoiceId, getVoiceConfig } from '../../lib/voiceMap';
import ttsCache from '../../utils/cache';
import usageLogger from '../../utils/usageLogger';

// Configuration
const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';
const MAX_TEXT_LENGTH = 3000;
const SUPPORTED_LANGUAGES = ['en', 'pidgin', 'yo'];
const SUPPORTED_VOICES = ['Dave', 'Chisom', 'Alex', 'Sarah', 'Michael', 'Emma'];

/**
 * Get client IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         '127.0.0.1';
}

/**
 * Sanitize text input to prevent injection attacks
 */
function sanitizeText(text) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }
  
  // Remove potentially dangerous characters and normalize
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[<>]/g, '') // Remove HTML brackets
    .trim();
}

/**
 * Validate request parameters
 */
function validateRequest(body) {
  const { text, voiceName, language, atmosphere } = body;
  const errors = [];

  // Validate text
  if (!text || typeof text !== 'string') {
    errors.push('Text is required and must be a string');
  } else if (text.length > MAX_TEXT_LENGTH) {
    errors.push(`Text must be less than ${MAX_TEXT_LENGTH} characters`);
  }

  // Validate voice
  if (!voiceName || typeof voiceName !== 'string') {
    errors.push('Voice name is required');
  } else if (!SUPPORTED_VOICES.includes(voiceName)) {
    errors.push(`Unsupported voice: ${voiceName}`);
  }

  // Validate language
  if (!language || typeof language !== 'string') {
    errors.push('Language is required');
  } else if (!SUPPORTED_LANGUAGES.includes(language)) {
    errors.push(`Unsupported language: ${language}`);
  }

  // Validate atmosphere (optional)
  if (atmosphere && !['none', 'rain', 'cafe', 'pad'].includes(atmosphere)) {
    errors.push(`Unsupported atmosphere: ${atmosphere}`);
  }

  return errors;
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST.' 
    });
  }

  const clientIP = getClientIP(req);
  const startTime = Date.now();

  try {
    // Check rate limiting
    const rateLimitCheck = usageLogger.checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      const limits = rateLimitCheck.limits;
      const exceeded = Object.entries(limits).find(([_, limit]) => limit.exceeded);
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limits: rateLimitCheck.limits,
        message: exceeded ? 
          `Too many requests. Try again in ${exceeded[1].resetIn} seconds.` :
          'Rate limit exceeded',
      });
    }

    // Validate request body
    const validationErrors = validateRequest(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    const { text, voiceName, language, atmosphere = 'none' } = req.body;

    // Sanitize input text
    const sanitizedText = sanitizeText(text);
    if (!sanitizedText) {
      return res.status(400).json({
        error: 'Text cannot be empty after sanitization',
      });
    }

    // Get ElevenLabs voice ID
    const voiceId = getVoiceId(voiceName);
    if (!voiceId) {
      return res.status(400).json({
        error: `Voice not configured: ${voiceName}`,
        message: 'Please check your voice configuration in lib/voiceMap.js',
      });
    }

    // Check API key
    const apiKey = process.env.ELEVEN_KEY;
    if (!apiKey) {
      console.error('ELEVEN_KEY environment variable not set');
      return res.status(500).json({
        error: 'TTS service not configured',
        message: 'Please set ELEVEN_KEY environment variable',
      });
    }

    // Generate cache key
    const cacheKey = ttsCache.generateKey(sanitizedText, voiceId, language, { atmosphere });
    
    // Check cache first
    const cachedAudio = ttsCache.get(cacheKey);
    if (cachedAudio) {
      console.log(`Cache hit for key: ${cacheKey}`);
      
      // Log usage
      usageLogger.logRequest({
        ip: clientIP,
        text: sanitizedText,
        voiceName,
        language,
        characters: sanitizedText.length,
        success: true,
        duration: Date.now() - startTime,
      });

      // Return cached audio
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="texti-${voiceName}-${Date.now()}.mp3"`);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
      return res.send(cachedAudio);
    }

    // Prepare ElevenLabs request
    const elevenLabsUrl = `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}`;
    const elevenLabsBody = {
      text: sanitizedText,
      model_id: "eleven_multilingual_v2", // Use multilingual model for better language support
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    console.log(`Making TTS request: ${sanitizedText.length} chars, voice: ${voiceName}`);

    // Make request to ElevenLabs
    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(elevenLabsBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      
      // Log failed request
      usageLogger.logRequest({
        ip: clientIP,
        text: sanitizedText,
        voiceName,
        language,
        characters: sanitizedText.length,
        success: false,
        duration: Date.now() - startTime,
      });

      return res.status(502).json({
        error: 'TTS service error',
        message: 'Failed to generate speech. Please try again.',
        statusCode: response.status,
      });
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer);

    // Cache the result
    ttsCache.set(cacheKey, audioData);
    console.log(`Cached audio with key: ${cacheKey}`);

    // Log successful request
    usageLogger.logRequest({
      ip: clientIP,
      text: sanitizedText,
      voiceName,
      language,
      characters: sanitizedText.length,
      success: true,
      duration: Date.now() - startTime,
    });

    // Return audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="texti-${voiceName}-${Date.now()}.mp3"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(audioData);

  } catch (error) {
    console.error('TTS API error:', error);

    // Log error
    usageLogger.logRequest({
      ip: clientIP,
      text: req.body.text || '',
      voiceName: req.body.voiceName || 'unknown',
      language: req.body.language || 'unknown',
      characters: (req.body.text || '').length,
      success: false,
      duration: Date.now() - startTime,
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
}

// Configure API route settings
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '50mb', // Allow large audio files
  },
}

/**
 * Example usage:
 * 
 * POST /api/tts
 * Content-Type: application/json
 * 
 * {
 *   "text": "Hello, this is a test message.",
 *   "voiceName": "Dave",
 *   "language": "en",
 *   "atmosphere": "none"
 * }
 * 
 * Response: audio/mpeg binary data
 */