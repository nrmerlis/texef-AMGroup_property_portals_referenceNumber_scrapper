import { strategyFactory } from './strategy-factory.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * Main scraper orchestrator
 * Uses the Strategy pattern to select the appropriate scraper based on URL
 */

/**
 * Scrape a property listing and extract reference code
 * @param {Object} options
 * @param {string} options.url - Property listing URL
 * @returns {Promise<Object>}
 */
export async function scrapeProperty(options = {}) {
  const { url } = options;

  try {
    logger.info('Starting property scrape', { url });

    // Validate required parameters
    if (!url) {
      return {
        success: false,
        error: 'URL is required',
      };
    }

    // Get appropriate strategy
    const strategy = strategyFactory.getStrategy(url);

    if (!strategy) {
      return {
        success: false,
        error: `No scraping strategy available for this URL. Supported domains: ${strategyFactory.getSupportedDomains().join(', ')}`,
        url,
      };
    }

    // Apply rate limiting delay
    if (config.scraper.rateLimitDelay > 0) {
      logger.debug(`Rate limiting: waiting ${config.scraper.rateLimitDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, config.scraper.rateLimitDelay));
    }

    // Execute scraping
    const result = await strategy.scrape(url);

    logger.info('Property scrape completed', { 
      success: result.success, 
      url 
    });

    return result;
  } catch (error) {
    logger.error('Scraping orchestration failed', { 
      url, 
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      url,
    };
  }
}

/**
 * Get list of supported portals
 * @returns {Object}
 */
export function getSupportedPortals() {
  const domains = strategyFactory.getSupportedDomains();
  
  return {
    total: domains.length,
    portals: domains.map(domain => ({
      domain,
      exampleUrl: `https://www.${domain}`,
    })),
  };
}

