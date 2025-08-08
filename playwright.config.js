/**
 * Playwright Configuration for Service Management E2E Tests
 * 
 * This configuration sets up Playwright for comprehensive end-to-end testing
 * of the service management interface, including CRUD operations, API integration,
 * and cross-page parity validation.
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Global test timeout
  timeout: 30000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js'),
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Slow down operations for better debugging
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
});
