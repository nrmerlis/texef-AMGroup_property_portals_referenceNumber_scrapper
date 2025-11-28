import { chromium } from 'playwright';
import { config } from '../config/index.js';
import { logger } from './logger.js';

/**
 * Simple browser pool to reuse browser instances
 * Helps reduce memory and startup time
 */
class BrowserPool {
  constructor() {
    this.browser = null;
    this.contexts = [];
    this.maxContexts = 5;
  }

  /**
   * Get or create browser instance
   * @returns {Promise<Browser>}
   */
  async getBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      logger.info('Creating new browser instance', { 
        headless: config.scraper.headless 
      });
      
      this.browser = await chromium.launch({
        headless: config.scraper.headless,
        slowMo: config.scraper.slowMo,
      });
    }
    
    return this.browser;
  }

  /**
   * Create a new browser context (isolated session)
   * @returns {Promise<{context: BrowserContext, page: Page}>}
   */
  async createContext() {
    const browser = await this.getBrowser();
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    
    // Set default timeout
    page.setDefaultTimeout(config.scraper.timeout);
    
    this.contexts.push(context);
    
    // Clean up old contexts if we have too many
    if (this.contexts.length > this.maxContexts) {
      const oldContext = this.contexts.shift();
      await oldContext.close().catch(() => {});
    }
    
    logger.debug('Created new browser context', { 
      activeContexts: this.contexts.length 
    });
    
    return { context, page };
  }

  /**
   * Close a specific context
   * @param {BrowserContext} context
   */
  async closeContext(context) {
    try {
      await context.close();
      this.contexts = this.contexts.filter(ctx => ctx !== context);
      logger.debug('Closed browser context', { 
        remainingContexts: this.contexts.length 
      });
    } catch (error) {
      logger.error('Error closing context', { error: error.message });
    }
  }

  /**
   * Close all contexts and browser
   */
  async closeAll() {
    logger.info('Closing all browser contexts and browser');
    
    for (const context of this.contexts) {
      await context.close().catch(() => {});
    }
    this.contexts = [];
    
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}

// Singleton instance
export const browserPool = new BrowserPool();

// Cleanup on process exit
process.on('SIGTERM', async () => {
  await browserPool.closeAll();
});

process.on('SIGINT', async () => {
  await browserPool.closeAll();
});

