/**
 * Global Teardown for Playwright E2E Tests
 * 
 * This file handles cleanup tasks after all E2E tests complete:
 * - Test data cleanup
 * - Temporary user removal
 * - Report generation
 * - Resource cleanup
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown for E2E tests...');
  
  // Launch browser for cleanup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Clean up test data
    console.log('🗑️ Cleaning up test data...');
    await cleanupTestData(page);
    
    // Generate test summary
    console.log('📊 Generating test summary...');
    await generateTestSummary();
    
    // Clean up temporary files
    console.log('🧽 Cleaning up temporary files...');
    await cleanupTempFiles();
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

async function cleanupTestData(page) {
  try {
    // Navigate to cleanup endpoint if available
    await page.goto(`${page.url()}/api/test/cleanup`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.log('ℹ️ No cleanup endpoint available or cleanup failed:', error.message);
  }
}

async function generateTestSummary() {
  try {
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      const summary = {
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        timestamp: new Date().toISOString()
      };
      
      console.log('📈 Test Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Skipped: ${summary.skipped}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
      
      // Save summary
      const summaryPath = path.join(process.cwd(), 'test-results', 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
    } else {
      console.log('ℹ️ No test results file found');
    }
  } catch (error) {
    console.error('❌ Failed to generate test summary:', error.message);
  }
}

async function cleanupTempFiles() {
  try {
    // Clean up any temporary files created during tests
    const tempDirs = [
      path.join(process.cwd(), 'test-results', 'temp'),
      path.join(process.cwd(), 'playwright-report', 'temp')
    ];
    
    for (const dir of tempDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🗑️ Cleaned up ${dir}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to cleanup temp files:', error.message);
  }
}

module.exports = globalTeardown;
