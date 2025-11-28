import { logger } from './logger.js';

/**
 * Parse and validate URLs, extract domain
 */
export class UrlParser {
  /**
   * Extract domain from URL
   * @param {string} url - Full URL
   * @returns {string|null} - Domain (e.g., 'zonaprop.com.ar')
   */
  static extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      logger.error('Invalid URL format', { url, error: error.message });
      return null;
    }
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean}
   */
  static isValid(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL (add protocol if missing, remove trailing slash)
   * @param {string} url - URL to normalize
   * @returns {string}
   */
  static normalize(url) {
    let normalized = url.trim();
    
    // Add https:// if no protocol
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    return normalized;
  }

  /**
   * Get URL path segments
   * @param {string} url - URL to parse
   * @returns {string[]}
   */
  static getPathSegments(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').filter(segment => segment.length > 0);
    } catch {
      return [];
    }
  }
}

