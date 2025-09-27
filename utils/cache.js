/**
 * Simple in-memory cache for TTS requests
 * 
 * This provides basic caching functionality for generated audio.
 * For production, consider using Redis or S3 for persistent caching.
 */

import crypto from 'crypto';

class TTSCache {
  constructor(maxSize = 100, ttl = 3600000) { // 1 hour TTL by default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Generate cache key from request parameters
   * @param {string} text - The text to convert
   * @param {string} voiceId - ElevenLabs voice ID
   * @param {string} language - Language code
   * @param {object} options - Additional options
   * @returns {string} - Cache key
   */
  generateKey(text, voiceId, language, options = {}) {
    const data = {
      text: text.trim().toLowerCase(),
      voiceId,
      language,
      ...options,
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16); // Use first 16 chars for shorter keys
  }

  /**
   * Get cached audio data
   * @param {string} key - Cache key
   * @returns {Buffer|null} - Cached audio buffer or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    item.accessedAt = Date.now();
    
    return item.data;
  }

  /**
   * Store audio data in cache
   * @param {string} key - Cache key
   * @param {Buffer} data - Audio buffer
   * @param {number} customTTL - Custom TTL in milliseconds
   */
  set(key, data, customTTL = null) {
    const ttl = customTTL || this.ttl;
    const now = Date.now();

    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      createdAt: now,
      accessedAt: now,
      expiresAt: now + ttl,
      size: data.length,
    });
  }

  /**
   * Remove expired items from cache
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    return keysToDelete.length;
  }

  /**
   * Evict oldest accessed item (LRU)
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.accessedAt < oldestTime) {
        oldestTime = item.accessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    const now = Date.now();
    let totalSize = 0;
    let expiredCount = 0;

    for (const item of this.cache.values()) {
      totalSize += item.size;
      if (now > item.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalBytes: totalSize,
      expiredItems: expiredCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }

  /**
   * Clear all cached items
   */
  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Check if cache has a key (without updating access time)
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists and not expired
   */
  has(key) {
    const item = this.cache.get(key);
    return item && Date.now() <= item.expiresAt;
  }
}

// Singleton instance for the application
const ttsCache = new TTSCache();

// Cleanup expired items every 10 minutes
setInterval(() => {
  const cleaned = ttsCache.cleanup();
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired cache items`);
  }
}, 10 * 60 * 1000);

export default ttsCache;

/**
 * Production caching alternatives:
 * 
 * 1. Redis Cache:
 * ```javascript
 * import Redis from 'ioredis';
 * const redis = new Redis(process.env.REDIS_URL);
 * 
 * export const redisCache = {
 *   async get(key) {
 *     const data = await redis.getBuffer(key);
 *     return data;
 *   },
 *   
 *   async set(key, data, ttl = 3600) {
 *     await redis.setex(key, ttl, data);
 *   }
 * };
 * ```
 * 
 * 2. S3 + CloudFront Cache:
 * ```javascript
 * import AWS from 'aws-sdk';
 * const s3 = new AWS.S3();
 * 
 * export const s3Cache = {
 *   async get(key) {
 *     try {
 *       const result = await s3.getObject({
 *         Bucket: process.env.S3_CACHE_BUCKET,
 *         Key: `tts-cache/${key}.mp3`
 *       }).promise();
 *       return result.Body;
 *     } catch (error) {
 *       return null;
 *     }
 *   },
 *   
 *   async set(key, data) {
 *     await s3.putObject({
 *       Bucket: process.env.S3_CACHE_BUCKET,
 *       Key: `tts-cache/${key}.mp3`,
 *       Body: data,
 *       ContentType: 'audio/mpeg',
 *       CacheControl: 'max-age=86400' // 24 hours
 *     }).promise();
 *   }
 * };
 * ```
 */