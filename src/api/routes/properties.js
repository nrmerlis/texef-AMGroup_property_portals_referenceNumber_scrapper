import { Router } from 'express';
import { scrapeProperty, getSupportedPortals } from '../../scrapers/index.js';
import { logger } from '../../utils/logger.js';

const router = Router();

/**
 * POST /api/properties/extract
 * Extract reference code from a property listing
 *
 * Body:
 * {
 *   "url": "https://www.zonaprop.com.ar/..."  // Required: Property listing URL
 * }
 */
router.post('/extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    logger.info('Received extraction request', { url });

    // Scrape the property
    const result = await scrapeProperty({ url });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    logger.error('Error in /api/properties/extract', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/properties/portals
 * Get list of supported property portals
 */
router.get('/portals', (req, res) => {
  const portals = getSupportedPortals();
  res.json({
    success: true,
    data: portals,
  });
});

/**
 * GET /api/properties/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;

