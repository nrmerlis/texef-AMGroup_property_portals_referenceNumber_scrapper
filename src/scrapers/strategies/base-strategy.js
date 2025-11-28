import { logger } from '../../utils/logger.js';
import { browserPool } from '../../utils/browser-pool.js';
import { config } from '../../config/index.js';

/**
 * Base abstract class for scraping strategies
 * Each portal should extend this and implement abstract methods
 */
export class BaseStrategy {
  constructor(domain) {
    this.domain = domain;
    this.context = null;
    this.page = null;
  }

  /**
   * Get the domain this strategy handles
   * @returns {string}
   */
  getDomain() {
    return this.domain;
  }

  /**
   * Initialize browser context and page
   * @returns {Promise<void>}
   */
  async initialize() {
    logger.info(`Initializing browser for ${this.domain}`);
    const { context, page } = await browserPool.createContext();
    this.context = context;
    this.page = page;
  }

  /**
   * Clean up browser resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.context) {
      await browserPool.closeContext(this.context);
      this.context = null;
      this.page = null;
    }
  }

  /**
   * Navigate to the property URL
   * @param {string} url - Property listing URL
   * @returns {Promise<void>}
   */
  async navigateToListing(url) {
    logger.info(`Navigating to ${url}`);
    
    try {
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: config.scraper.timeout,
      });

      // Wait a bit for dynamic content
      await this.page.waitForTimeout(1500);
      
      logger.debug('Page loaded successfully');
    } catch (error) {
      logger.error('Navigation failed', { url, error: error.message });
      throw new Error(`Failed to navigate to ${url}: ${error.message}`);
    }
  }

  /**
   * Validate if the URL belongs to this strategy's domain
   * @param {string} url - URL to validate
   * @returns {boolean}
   */
  validateUrl(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      return hostname === this.domain;
    } catch {
      return false;
    }
  }

  /**
   * Extract reference code from the page
   * ABSTRACT METHOD - Must be implemented by each strategy
   * @returns {Promise<string|null>}
   */
  async extractReferenceCode() {
    throw new Error('extractReferenceCode() must be implemented by subclass');
  }

  /**
   * Main scraping method - orchestrates the entire process
   * @param {string} url - Property listing URL
   * @returns {Promise<Object>}
   */
  async scrape(url) {
    
    try {
      // Initialize browser
      await this.initialize();

      // Validate URL
      if (!this.validateUrl(url)) {
        throw new Error(`URL does not match domain ${this.domain}`);
      }

      // Navigate to listing
      await this.navigateToListing(url);

      // Extract reference code (required)
      const referenceCode = await this.extractReferenceCode();

      if (!referenceCode) {
        throw new Error('Could not extract reference code');
      }

      // Build result object
      const result = {
        success: true,
        data: {
          referenceCode,
          source: this.domain,
          url,
          scrapedAt: new Date().toISOString(),
        },
      };

      logger.info('Scraping completed successfully', {
        domain: this.domain,
        referenceCode,
      });

      return result;
    } catch (error) {
      logger.error('Scraping failed', {
        domain: this.domain,
        url,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        source: this.domain,
        url,
      };
    } finally {
      // Always clean up
      await this.cleanup();
    }
  }

  /**
   * Helper: Extract text content from element
   * @param {string} selector - CSS selector
   * @returns {Promise<string|null>}
   */
  async getTextContent(selector) {
    try {
      const element = await this.page.$(selector);
      if (!element) return null;
      return await element.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Helper: Check if element exists
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>}
   */
  async elementExists(selector) {
    try {
      const element = await this.page.$(selector);
      return element !== null;
    } catch {
      return false;
    }
  }
}

