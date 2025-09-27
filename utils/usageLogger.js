/**
 * Usage tracking and logging utilities for Texti AI
 * 
 * This module provides simple usage tracking for monitoring costs and usage patterns.
 * For production, integrate with analytics services like Google Analytics, Mixpanel, etc.
 */

class UsageLogger {
  constructor() {
    this.usage = {
      daily: new Map(),
      monthly: new Map(),
      total: {
        requests: 0,
        characters: 0,
        estimatedCost: 0,
        errors: 0,
      }
    };
    
    this.rateLimits = {
      perMinute: 10,
      perHour: 100,
      perDay: 1000,
    };
    
    this.requestHistory = new Map(); // IP -> timestamps
  }

  /**
   * Log a TTS request
   * @param {object} params - Request parameters
   * @param {string} params.ip - Client IP address
   * @param {string} params.text - Text converted
   * @param {string} params.voiceName - Voice used
   * @param {string} params.language - Language used
   * @param {number} params.characters - Character count
   * @param {boolean} params.success - Whether request succeeded
   * @param {number} params.duration - Request duration in ms
   */
  logRequest({
    ip,
    text,
    voiceName,
    language,
    characters,
    success = true,
    duration = 0,
  }) {
    const now = new Date();
    const dateKey = this.getDateKey(now);
    const monthKey = this.getMonthKey(now);

    // Estimate cost (approximate: $0.30 per 1K characters for ElevenLabs)
    const estimatedCost = (characters / 1000) * 0.30;

    // Update daily stats
    if (!this.usage.daily.has(dateKey)) {
      this.usage.daily.set(dateKey, {
        requests: 0,
        characters: 0,
        estimatedCost: 0,
        errors: 0,
        voices: new Set(),
        languages: new Set(),
      });
    }

    const dailyStats = this.usage.daily.get(dateKey);
    dailyStats.requests++;
    dailyStats.characters += characters;
    dailyStats.estimatedCost += estimatedCost;
    dailyStats.voices.add(voiceName);
    dailyStats.languages.add(language);
    
    if (!success) {
      dailyStats.errors++;
    }

    // Update monthly stats
    if (!this.usage.monthly.has(monthKey)) {
      this.usage.monthly.set(monthKey, {
        requests: 0,
        characters: 0,
        estimatedCost: 0,
        errors: 0,
      });
    }

    const monthlyStats = this.usage.monthly.get(monthKey);
    monthlyStats.requests++;
    monthlyStats.characters += characters;
    monthlyStats.estimatedCost += estimatedCost;
    
    if (!success) {
      monthlyStats.errors++;
    }

    // Update total stats
    this.usage.total.requests++;
    this.usage.total.characters += characters;
    this.usage.total.estimatedCost += estimatedCost;
    
    if (!success) {
      this.usage.total.errors++;
    }

    // Log for debugging (in production, send to analytics service)
    console.log(`TTS Request: ${characters} chars, ${voiceName}, ${language}, ${success ? 'SUCCESS' : 'ERROR'}, ${duration}ms`);
  }

  /**
   * Check if IP is rate limited
   * @param {string} ip - Client IP address
   * @returns {object} - Rate limit status
   */
  checkRateLimit(ip) {
    const now = Date.now();
    
    if (!this.requestHistory.has(ip)) {
      this.requestHistory.set(ip, []);
    }

    const history = this.requestHistory.get(ip);
    
    // Clean old requests (older than 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentRequests = history.filter(timestamp => timestamp > oneHourAgo);
    this.requestHistory.set(ip, recentRequests);

    // Check limits
    const oneMinuteAgo = now - (60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const requestsLastMinute = recentRequests.filter(t => t > oneMinuteAgo).length;
    const requestsLastHour = recentRequests.length;
    const requestsToday = recentRequests.filter(t => t > oneDayAgo).length;

    const limits = {
      perMinute: {
        count: requestsLastMinute,
        limit: this.rateLimits.perMinute,
        exceeded: requestsLastMinute >= this.rateLimits.perMinute,
        resetIn: 60 - Math.floor((now % (60 * 1000)) / 1000),
      },
      perHour: {
        count: requestsLastHour,
        limit: this.rateLimits.perHour,
        exceeded: requestsLastHour >= this.rateLimits.perHour,
        resetIn: 3600 - Math.floor((now % (60 * 60 * 1000)) / 1000),
      },
      perDay: {
        count: requestsToday,
        limit: this.rateLimits.perDay,
        exceeded: requestsToday >= this.rateLimits.perDay,
        resetIn: 86400 - Math.floor((now % (24 * 60 * 60 * 1000)) / 1000),
      },
    };

    const isLimited = limits.perMinute.exceeded || limits.perHour.exceeded || limits.perDay.exceeded;
    
    if (!isLimited) {
      // Record this request
      recentRequests.push(now);
    }

    return {
      allowed: !isLimited,
      limits,
    };
  }

  /**
   * Get usage statistics
   * @param {string} period - 'today', 'month', 'total'
   * @returns {object} - Usage statistics
   */
  getUsage(period = 'total') {
    switch (period) {
      case 'today': {
        const today = this.getDateKey(new Date());
        return this.usage.daily.get(today) || {
          requests: 0,
          characters: 0,
          estimatedCost: 0,
          errors: 0,
          voices: new Set(),
          languages: new Set(),
        };
      }
      
      case 'month': {
        const thisMonth = this.getMonthKey(new Date());
        return this.usage.monthly.get(thisMonth) || {
          requests: 0,
          characters: 0,
          estimatedCost: 0,
          errors: 0,
        };
      }
      
      default:
        return this.usage.total;
    }
  }

  /**
   * Get detailed usage breakdown
   * @returns {object} - Detailed usage data
   */
  getDetailedUsage() {
    const today = this.getUsage('today');
    const month = this.getUsage('month');
    const total = this.getUsage('total');

    return {
      today: {
        ...today,
        voices: Array.from(today.voices || []),
        languages: Array.from(today.languages || []),
      },
      thisMonth: month,
      allTime: total,
      dailyBreakdown: Array.from(this.usage.daily.entries()).map(([date, stats]) => ({
        date,
        ...stats,
        voices: Array.from(stats.voices),
        languages: Array.from(stats.languages),
      })),
      monthlyBreakdown: Array.from(this.usage.monthly.entries()).map(([month, stats]) => ({
        month,
        ...stats,
      })),
    };
  }

  /**
   * Check if monthly usage exceeds threshold
   * @param {number} threshold - Cost threshold in USD
   * @returns {object} - Threshold check result
   */
  checkMonthlyThreshold(threshold = 50) {
    const monthlyUsage = this.getUsage('month');
    const exceeded = monthlyUsage.estimatedCost > threshold;
    
    return {
      exceeded,
      current: monthlyUsage.estimatedCost,
      threshold,
      percentage: (monthlyUsage.estimatedCost / threshold) * 100,
    };
  }

  /**
   * Clean old usage data (keep last 30 days for daily, 12 months for monthly)
   */
  cleanup() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);

    // Clean daily data
    for (const [dateKey] of this.usage.daily.entries()) {
      const date = new Date(dateKey);
      if (date < thirtyDaysAgo) {
        this.usage.daily.delete(dateKey);
      }
    }

    // Clean monthly data
    for (const [monthKey] of this.usage.monthly.entries()) {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      if (date < twelveMonthsAgo) {
        this.usage.monthly.delete(monthKey);
      }
    }

    // Clean request history (keep last 24 hours)
    const oneDayAgo = now.getTime() - (24 * 60 * 60 * 1000);
    for (const [ip, history] of this.requestHistory.entries()) {
      const recentRequests = history.filter(timestamp => timestamp > oneDayAgo);
      if (recentRequests.length === 0) {
        this.requestHistory.delete(ip);
      } else {
        this.requestHistory.set(ip, recentRequests);
      }
    }
  }

  /**
   * Get date key for daily stats
   * @param {Date} date - Date object
   * @returns {string} - Date key (YYYY-MM-DD)
   */
  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get month key for monthly stats
   * @param {Date} date - Date object
   * @returns {string} - Month key (YYYY-MM)
   */
  getMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

// Singleton instance
const usageLogger = new UsageLogger();

// Clean up old data daily
setInterval(() => {
  usageLogger.cleanup();
  console.log('Usage data cleanup completed');
}, 24 * 60 * 60 * 1000);

export default usageLogger;

/**
 * Integration examples for production analytics:
 * 
 * 1. Google Analytics 4:
 * ```javascript
 * import { gtag } from 'ga-gtag';
 * 
 * gtag('event', 'tts_request', {
 *   voice_name: voiceName,
 *   language: language,
 *   character_count: characters,
 *   estimated_cost: estimatedCost,
 * });
 * ```
 * 
 * 2. Mixpanel:
 * ```javascript
 * import mixpanel from 'mixpanel-browser';
 * 
 * mixpanel.track('TTS Request', {
 *   voice: voiceName,
 *   language: language,
 *   characters: characters,
 *   cost: estimatedCost,
 * });
 * ```
 * 
 * 3. Custom webhook:
 * ```javascript
 * await fetch(process.env.ANALYTICS_WEBHOOK, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     event: 'tts_request',
 *     data: { voiceName, language, characters, estimatedCost }
 *   })
 * });
 * ```
 */