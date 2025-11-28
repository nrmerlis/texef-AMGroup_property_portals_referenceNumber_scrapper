import { ZonaPropStrategy } from './strategies/zonaprop-strategy.js';
import { ArgenPropStrategy } from './strategies/argenprop-strategy.js';
import { UrlParser } from '../utils/url-parser.js';
import { logger } from '../utils/logger.js';

/**
 * Strategy Factory - Returns the appropriate scraping strategy based on domain
 * 
 * To add a new portal:
 * 1. Create a new strategy file in strategies/ (e.g., mercadolibre-strategy.js)
 * 2. Import it here
 * 3. Add it to the strategies map
 */
export class StrategyFactory {
  constructor() {
    // Map of domain -> Strategy class
    this.strategies = new Map([
      ['zonaprop.com.ar', ZonaPropStrategy],
      ['argenprop.com', ArgenPropStrategy],
      // Add new strategies here:
      // ['mercadolibre.com.ar', MercadoLibreStrategy],
    ]);
  }

  /**
   * Get the appropriate strategy for a given URL
   * @param {string} url - Property listing URL
   * @returns {BaseStrategy|null}
   */
  getStrategy(url) {
    // Normalize and validate URL
    const normalizedUrl = UrlParser.normalize(url);
    
    if (!UrlParser.isValid(normalizedUrl)) {
      logger.error('Invalid URL provided', { url });
      return null;
    }

    // Extract domain
    const domain = UrlParser.extractDomain(normalizedUrl);
    
    if (!domain) {
      logger.error('Could not extract domain from URL', { url });
      return null;
    }

    // Get strategy class
    const StrategyClass = this.strategies.get(domain);
    
    if (!StrategyClass) {
      logger.error('No strategy found for domain', { 
        domain, 
        supportedDomains: Array.from(this.strategies.keys()) 
      });
      return null;
    }

    // Instantiate and return strategy
    logger.info('Strategy selected', { domain, strategyName: StrategyClass.name });
    return new StrategyClass();
  }

  /**
   * Get list of supported domains
   * @returns {string[]}
   */
  getSupportedDomains() {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if a domain is supported
   * @param {string} domain - Domain to check
   * @returns {boolean}
   */
  isSupported(domain) {
    return this.strategies.has(domain);
  }

  /**
   * Register a new strategy
   * @param {string} domain - Domain to handle
   * @param {Class} StrategyClass - Strategy class
   */
  registerStrategy(domain, StrategyClass) {
    this.strategies.set(domain, StrategyClass);
    logger.info('New strategy registered', { domain, strategyName: StrategyClass.name });
  }
}

// Singleton instance
export const strategyFactory = new StrategyFactory();

