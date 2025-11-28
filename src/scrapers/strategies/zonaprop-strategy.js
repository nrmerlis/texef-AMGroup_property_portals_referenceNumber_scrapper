import { BaseStrategy } from './base-strategy.js';
import { logger } from '../../utils/logger.js';

/**
 * ZonaProp scraping strategy
 * Handles www.zonaprop.com.ar listings
 */
export class ZonaPropStrategy extends BaseStrategy {
  constructor() {
    super('zonaprop.com.ar');
  }

  /**
   * Extract reference code from ZonaProp listing
   * Based on the structure: Cód. del anunciante: XXX | Cód. Zonaprop: XXXXXXX
   * Located in element with class "publiserCodes-module__publisher-codes-item___1MPT4"
   * @returns {Promise<string|null>}
   */
  async extractReferenceCode() {
    logger.debug('Extracting reference code from ZonaProp');

    try {
      // Strategy 1: Look for the specific publisher codes section
      // This is the most reliable method based on the HTML structure shown
      const codeFromPublisherSection = await this.page.evaluate(() => {
        // Look for elements with class containing "publisher-codes"
        const publisherElements = document.querySelectorAll('[class*="publisher-codes-item"]');
        
        for (const element of publisherElements) {
          const text = element.textContent;
          
          // Look for "Cód. del anunciante:" pattern
          if (text.includes('Cód. del anunciante')) {
            const match = text.match(/Cód\.\s+del\s+anunciante[:\s]*([\w_-]+)/i);
            if (match) {
              return match[1].trim();
            }
          }
          
          // Alternative: look for "Cód. Zonaprop:" pattern
          if (text.includes('Cód. Zonaprop') || text.includes('Código Zonaprop')) {
            const match = text.match(/Cód\.\s+Zonaprop[:\s]*(\d+)/i);
            if (match) {
              return match[1].trim();
            }
          }
        }
        return null;
      });

      if (codeFromPublisherSection) {
        logger.debug('Found reference code in publisher section', { code: codeFromPublisherSection });
        return codeFromPublisherSection;
      }

      // Strategy 2: Search in all text nodes for the pattern
      const codeFromText = await this.page.evaluate(() => {
        const bodyText = document.body.innerText;
        
        // Try to find "Cód. del anunciante: XXX"
        const anuncianteMatch = bodyText.match(/Cód\.\s+del\s+anunciante[:\s]*([\w_-]+)/i);
        if (anuncianteMatch) {
          return anuncianteMatch[1].trim();
        }
        
        // Try to find "Cód. Zonaprop: XXXXXXX"
        const zonapropMatch = bodyText.match(/Cód\.\s+Zonaprop[:\s]*(\d+)/i);
        if (zonapropMatch) {
          return zonapropMatch[1].trim();
        }
        
        return null;
      });

      if (codeFromText) {
        logger.debug('Found reference code in text', { code: codeFromText });
        return codeFromText;
      }

      // Strategy 3: Look for meta tags with property ID
      const metaCode = await this.page.evaluate(() => {
        const metaProperty = document.querySelector('meta[property="product:retailer_item_id"]');
        if (metaProperty) {
          return metaProperty.getAttribute('content');
        }
        return null;
      });

      if (metaCode) {
        logger.debug('Found reference code in meta tags', { code: metaCode });
        return metaCode;
      }

      // Strategy 4: Extract from URL (last resort)
      const urlMatch = this.page.url().match(/[/-](\d{7,})/);
      if (urlMatch) {
        const code = urlMatch[1];
        logger.debug('Extracted reference code from URL', { code });
        return code;
      }

      logger.warn('Could not find reference code in ZonaProp listing');
      return null;
    } catch (error) {
      logger.error('Error extracting reference code', { error: error.message });
      return null;
    }
  }
}

