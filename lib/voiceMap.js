/**
 * Voice mapping configuration for Texti AI
 * 
 * This file maps friendly voice names to ElevenLabs voice IDs.
 * Replace the placeholder IDs with actual voice IDs from your ElevenLabs account.
 * 
 * To get voice IDs:
 * 1. Go to https://elevenlabs.io/voices
 * 2. Copy the voice ID from the URL or API
 * 3. Replace the placeholder values below
 */

export const voiceMap = {
  // English voices
  'Dave': 'lXyLz3Gu0YqdG8RfvIyZ',
  'Chisom': '8Es4wFxsDlHBmFWAOWRS', 
  'Alex': 'goT3UYdM9bhm0n2lmKQx',
  
  // Additional voices (add more as needed)
  'Sarah': 'ZF6FPAbjXT4488VcRRnw',
  'Michael': 'LEvd0YiWkwZ6hTZOmdVE',
  'Emma': 'U7wWSnxIJwCjioxt86mk',
};

/**
 * Voice configuration with metadata
 * This provides detailed information about each voice for the UI
 */
export const voiceConfig = [
  {
    id: 'dave',
    name: 'Dave',
    description: 'cold and professional male voice',
    gender: 'male',
    accent: 'american',
    language: 'en',
    languages: ['en'],
    premium: false,
    tags: ['professional', 'warm', 'narrator'],
    sampleText: 'Hello, this is Dave. I have a warm and professional voice perfect for storytelling.',
    sampleUrl: null, // Can be populated with pre-recorded samples
  },
  {
    id: 'chisom',
    name: 'Chisom',
    description: 'Expressive female voice with Nigerian accent',
    gender: 'female',
    accent: 'nigerian',
    language: 'en',
    languages: ['en', 'pidgin'],
    premium: false,
    tags: ['expressive', 'african', 'storyteller'],
    sampleText: 'Hello, I am Chisom. My voice brings stories to life with authentic African expression.',
    sampleUrl: null,
  },
  {
    id: 'alex',
    name: 'Alex',
    description: 'Clear and articulate unisex voice',
    gender: 'unisex',
    accent: 'british',
    language: 'en',
    languages: ['en'],
    premium: false,
    tags: ['clear', 'articulate', 'neutral'],
    sampleText: 'Greetings, I am Alex. I speak with clarity and precision for all your content needs.',
    sampleUrl: null,
  },
  {
    id: 'sarah',
    name: 'Sarah',
    description: 'Friendly and energetic female voice',
    gender: 'female',
    accent: 'american',
    language: 'en',
    languages: ['en'],
    premium: true,
    tags: ['friendly', 'energetic', 'commercial'],
    sampleText: 'Hi there! I am Sarah, bringing energy and friendliness to your content.',
    sampleUrl: null,
  },
  {
    id: 'michael',
    name: 'Michael',
    description: 'Deep and authoritative male voice',
    gender: 'male',
    accent: 'british',
    language: 'en',
    languages: ['en'],
    premium: true,
    tags: ['deep', 'authoritative', 'documentary'],
    sampleText: 'Good day, I am Michael. My voice commands attention and respect.',
    sampleUrl: null,
  },
  {
    id: 'emma',
    name: 'Emma',
    description: 'Gentle and soothing female voice',
    gender: 'female',
    accent: 'australian',
    language: 'en',
    languages: ['en'],
    premium: false,
    tags: ['gentle', 'soothing', 'meditation'],
    sampleText: 'Hello, I am Emma. Let my gentle voice guide you through your content.',
    sampleUrl: null,
  },
];

/**
 * Get ElevenLabs voice ID from friendly name
 * @param {string} voiceName - The friendly voice name
 * @returns {string|null} - The ElevenLabs voice ID or null if not found
 */
export const getVoiceId = (voiceName) => {
  const voiceId = voiceMap[voiceName];
  
  if (!voiceId || voiceId.startsWith('REPLACE_WITH_')) {
    console.warn(`Voice ID not configured for: ${voiceName}`);
    return null;
  }
  
  return voiceId;
};

/**
 * Get voice configuration by name
 * @param {string} voiceName - The friendly voice name
 * @returns {object|null} - The voice configuration object or null if not found
 */
export const getVoiceConfig = (voiceName) => {
  return voiceConfig.find(voice => 
    voice.name.toLowerCase() === voiceName.toLowerCase()
  ) || null;
};

/**
 * Get voices by language
 * @param {string} language - Language code (e.g., 'en', 'pidgin', 'yo')
 * @returns {array} - Array of voice configurations for the language
 */
export const getVoicesByLanguage = (language) => {
  return voiceConfig.filter(voice => 
    voice.language === language || voice.languages.includes(language)
  );
};

/**
 * Validate voice configuration
 * @returns {object} - Validation results
 */
export const validateVoiceConfig = () => {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Check for missing voice IDs
  Object.entries(voiceMap).forEach(([name, id]) => {
    if (id.startsWith('REPLACE_WITH_')) {
      results.warnings.push(`Voice ID not configured for: ${name}`);
    }
  });

  // Check for voices in config but not in map
  voiceConfig.forEach(voice => {
    if (!voiceMap[voice.name]) {
      results.errors.push(`Voice ${voice.name} in config but not in voice map`);
      results.valid = false;
    }
  });

  // Check for voices in map but not in config
  Object.keys(voiceMap).forEach(name => {
    if (!voiceConfig.find(v => v.name === name)) {
      results.warnings.push(`Voice ${name} in map but not in config`);
    }
  });

  return results;
};

export default {
  voiceMap,
  voiceConfig,
  getVoiceId,
  getVoiceConfig,
  getVoicesByLanguage,
  validateVoiceConfig,
};
