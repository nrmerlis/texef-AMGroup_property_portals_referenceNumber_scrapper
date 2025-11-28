import express from 'express';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import propertiesRouter from './routes/properties.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
  });
  next();
});

// CORS middleware (optional - enable if needed for browser clients)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/api/properties', propertiesRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Property Portals Reference Scraper',
    version: '1.0.0',
    endpoints: {
      'POST /api/properties/extract': 'Extract reference code from a property URL',
      'GET /api/properties/portals': 'Get list of supported portals',
      'GET /api/properties/health': 'Health check',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

/**
 * Start the server
 */
export function startServer() {
  const port = config.server.port;

  app.listen(port, () => {
    logger.info(`🚀 Property Portals Scraper API running on port ${port}`);
    logger.info(`   Environment: ${config.server.env}`);
    logger.info(`   Health check: http://localhost:${port}/api/properties/health`);
    logger.info(`   Supported portals: http://localhost:${port}/api/properties/portals`);
  });

  return app;
}

export default app;

