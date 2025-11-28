/**
 * Test script to manually test scraping strategies
 * Run with: npm run test
 */

import 'dotenv/config';
import { scrapeProperty, getSupportedPortals } from './index.js';
import { logger } from '../utils/logger.js';

// Test URLs (replace with real URLs for testing)
const TEST_URLS = {
  zonaprop: 'https://www.zonaprop.com.ar/propiedades/departamento-venta-alquiler-palermo.html',
  argenprop: 'https://www.argenprop.com/propiedades/departamento-2-ambientes-en-venta-en-palermo.html',
};

async function runTests() {
  logger.info('=== Property Portals Scraper - Test Suite ===');
  
  // Test 1: Get supported portals
  logger.info('\n--- Test 1: Supported Portals ---');
  const portals = getSupportedPortals();
  console.log(JSON.stringify(portals, null, 2));
  
  // Test 2: Test ZonaProp scraping
  logger.info('\n--- Test 2: ZonaProp Scraping ---');
  logger.info(`Testing URL: ${TEST_URLS.zonaprop}`);
  
  const zonapropResult = await scrapeProperty({
    url: TEST_URLS.zonaprop,
  });
  
  console.log('\nZonaProp Result:');
  console.log(JSON.stringify(zonapropResult, null, 2));
  
  // Test 3: Test ArgenProp scraping
  logger.info('\n--- Test 3: ArgenProp Scraping ---');
  logger.info(`Testing URL: ${TEST_URLS.argenprop}`);
  
  const argenpropResult = await scrapeProperty({
    url: TEST_URLS.argenprop,
  });
  
  console.log('\nArgenProp Result:');
  console.log(JSON.stringify(argenpropResult, null, 2));
  
  // Test 4: Test unsupported domain
  logger.info('\n--- Test 4: Unsupported Domain ---');
  const unsupportedResult = await scrapeProperty({
    url: 'https://www.example.com/property/123',
  });
  
  console.log('\nUnsupported Domain Result:');
  console.log(JSON.stringify(unsupportedResult, null, 2));
  
  logger.info('\n=== Tests Completed ===');
  process.exit(0);
}

// Run tests
runTests().catch((error) => {
  logger.error('Test suite failed', { error: error.message, stack: error.stack });
  process.exit(1);
});

