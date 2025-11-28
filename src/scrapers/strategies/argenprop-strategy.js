import { BaseStrategy } from './base-strategy.js';
import { logger } from '../../utils/logger.js';

/**
 * ArgenProp scraping strategy
 * Handles www.argenprop.com listings
 */
export class ArgenPropStrategy extends BaseStrategy {
  constructor() {
    super('argenprop.com');
  }

  /**
   * Extract reference code from ArgenProp listing
   * Based on the structure: "Código de aviso: 6KX2_1"
   * Located in element with class "property-code"
   * @returns {Promise<string|null>}
   */
  async extractReferenceCode() {
    logger.debug('Extracting reference code from ArgenProp');

    try {
      // Strategy 1: Look for the specific "property-code" class or similar
      // This is the most reliable method based on the HTML structure shown
      const codeFromPropertyCode = await this.page.evaluate(() => {
        // Look for elements with class containing "property-code"
        const propertyCodeElements = document.querySelectorAll('[class*="property-code"]');
        
        for (const element of propertyCodeElements) {
          const text = element.textContent;
          
          // Look for "Código de aviso:" pattern
          if (text.includes('Código de aviso')) {
            const match = text.match(/Código\s+de\s+aviso[:\s]*([\w_-]+)/i);
            if (match) {
              return match[1].trim();
            }
          }
        }
        return null;
      });

      if (codeFromPropertyCode) {
        logger.debug('Found reference code in property-code element', { code: codeFromPropertyCode });
        return codeFromPropertyCode;
      }

      // Strategy 2: Search for "Código de aviso" in all text
      const codeFromText = await this.page.evaluate(() => {
        const bodyText = document.body.innerText;
        
        // Try to find "Código de aviso: XXX"
        const avisoMatch = bodyText.match(/Código\s+de\s+aviso[:\s]*([\w_-]+)/i);
        if (avisoMatch) {
          return avisoMatch[1].trim();
        }
        
        return null;
      });

      if (codeFromText) {
        logger.debug('Found reference code in text', { code: codeFromText });
        return codeFromText;
      }

      // Strategy 3: Look for property ID in data attributes
      const dataCode = await this.page.evaluate(() => {
        const propertyElement = document.querySelector('[data-item-id], [data-property-id]');
        if (propertyElement) {
          const id = propertyElement.getAttribute('data-item-id') || 
                      propertyElement.getAttribute('data-property-id');
          if (id) return id;
        }
        return null;
      });

      if (dataCode) {
        logger.debug('Found reference code in data attributes', { code: dataCode });
        return dataCode;
      }

      // Strategy 4: Extract from URL (last resort)
      const urlMatch = this.page.url().match(/[/-](\d{7,})/);
      if (urlMatch) {
        const code = urlMatch[1];
        logger.debug('Extracted reference code from URL', { code });
        return code;
      }

      logger.warn('Could not find reference code in ArgenProp listing');
      return null;
    } catch (error) {
      logger.error('Error extracting reference code', { error: error.message });
      return null;
    }
  }
}

