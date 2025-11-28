import 'dotenv/config';

export const config = {
  // OpenAI for Smart Selector (optional)
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  // Scraper settings
  scraper: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO, 10) || 0,
    timeout: parseInt(process.env.BROWSER_TIMEOUT, 10) || 30000,
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY, 10) || 1000,
  },
};

