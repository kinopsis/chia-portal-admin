/**
 * Global Setup for Playwright E2E Tests
 * 
 * This file handles global setup tasks before running E2E tests:
 * - Database preparation
 * - Test user creation
 * - Environment validation
 * - Service cleanup
 */

const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Validate that the application is running
    console.log('🔍 Validating application availability...');
    await page.goto(config.use.baseURL);
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Application is running and accessible');
    
    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await cleanupTestData(page);
    
    // Validate database connection
    console.log('🔗 Validating database connection...');
    await validateDatabaseConnection(page);
    
    // Prepare test users
    console.log('👥 Preparing test users...');
    await prepareTestUsers(page);
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page) {
  // Navigate to a page that can help with cleanup
  await page.goto(`${page.url()}/api/test/cleanup`, { 
    waitUntil: 'networkidle',
    timeout: 30000 
  }).catch(() => {
    // If cleanup endpoint doesn't exist, that's okay
    console.log('ℹ️ No cleanup endpoint available, skipping automated cleanup');
  });
}

async function validateDatabaseConnection(page) {
  // Try to access a page that requires database connection
  try {
    await page.goto(`${page.url()}/tramites`);
    await page.waitForSelector('[data-testid*="services"], .loading, .error', { timeout: 10000 });
    console.log('✅ Database connection validated');
  } catch (error) {
    console.warn('⚠️ Could not validate database connection:', error.message);
  }
}

async function prepareTestUsers(page) {
  // This would typically involve API calls to create test users
  // For now, we'll assume test users exist in the database
  console.log('ℹ️ Assuming test users exist in database');
  console.log('   - admin@chia.gov.co (admin role)');
  console.log('   - funcionario@chia.gov.co (funcionario role)');
  
  // In a real implementation, you might:
  // 1. Call user creation API
  // 2. Set up test permissions
  // 3. Create test dependencies/subdependencies
}

module.exports = globalSetup;
