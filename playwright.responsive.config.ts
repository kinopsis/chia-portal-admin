/**
 * Playwright Configuration for Responsive Testing
 * 
 * Specialized configuration for responsive design and visual regression testing
 */

import { defineConfig, devices } from '@playwright/test'
import { RESPONSIVE_CONFIG } from './tests/config/responsiveTestConfig'

export default defineConfig({
  testDir: './tests',
  
  // Test patterns for responsive tests
  testMatch: [
    '**/responsive/**/*.test.{ts,tsx}',
    '**/visual/**/*.test.{ts,tsx}',
  ],
  
  // Global test timeout
  timeout: 60000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000,
    // Visual comparison settings
    threshold: RESPONSIVE_CONFIG.visualRegression.threshold,
    toHaveScreenshot: {
      threshold: RESPONSIVE_CONFIG.visualRegression.threshold,
      maxDiffPixels: RESPONSIVE_CONFIG.visualRegression.maxDiffPixels,
      animations: 'disabled',
    },
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/responsive-report' }],
    ['json', { outputFile: 'test-results/responsive-results.json' }],
    ['junit', { outputFile: 'test-results/responsive-junit.xml' }],
    ...(process.env.CI ? [['github'] as const] : [['list'] as const]),
  ],
  
  // Global setup and teardown
  globalSetup: './tests/setup/global-setup.ts',
  globalTeardown: './tests/setup/global-teardown.ts',
  
  // Output directories
  outputDir: 'test-results/responsive-artifacts',
  
  // Use configuration
  use: {
    // Base URL for tests
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global test settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Disable animations for consistent screenshots
    reducedMotion: 'reduce',
    
    // Force color scheme for consistent testing
    colorScheme: 'light',
    
    // Locale for testing
    locale: 'es-CO',
    
    // Timezone
    timezoneId: 'America/Bogota',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
    },
  },
  
  // Project configurations for different testing scenarios
  projects: [
    // Mobile devices testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: RESPONSIVE_CONFIG.viewports.mobile['Pixel 5'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        viewport: RESPONSIVE_CONFIG.viewports.mobile['iPhone 12'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    
    // Tablet devices testing
    {
      name: 'tablet-chrome',
      use: {
        ...devices['iPad Pro'],
        viewport: RESPONSIVE_CONFIG.viewports.tablet['iPad Pro 11"'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    {
      name: 'tablet-safari',
      use: {
        ...devices['iPad Pro'],
        viewport: RESPONSIVE_CONFIG.viewports.tablet['iPad Pro 11"'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    
    // Desktop browsers testing
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    {
      name: 'desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    {
      name: 'desktop-safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    
    // Visual regression testing projects
    {
      name: 'visual-mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: RESPONSIVE_CONFIG.viewports.mobile['iPhone 12'],
      },
      testMatch: '**/visual/**/*.test.{ts,tsx}',
    },
    {
      name: 'visual-tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: RESPONSIVE_CONFIG.viewports.tablet['iPad Pro 11"'],
      },
      testMatch: '**/visual/**/*.test.{ts,tsx}',
    },
    {
      name: 'visual-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
      },
      testMatch: '**/visual/**/*.test.{ts,tsx}',
    },
    
    // High-resolution testing
    {
      name: 'desktop-4k',
      use: {
        ...devices['Desktop Chrome'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop 4K'],
        deviceScaleFactor: 2,
      },
      testMatch: '**/visual/**/*.test.{ts,tsx}',
    },
    
    // Dark theme testing
    {
      name: 'dark-theme-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
        colorScheme: 'dark',
      },
      testMatch: '**/visual/**/*.test.{ts,tsx}',
    },
    {
      name: 'dark-theme-mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: RESPONSIVE_CONFIG.viewports.mobile['iPhone 12'],
        colorScheme: 'dark',
      },
      testMatch: '**/visual/**/*.test.{ts,tsx}',
    },
    
    // Slow network testing
    {
      name: 'slow-network',
      use: {
        ...devices['Desktop Chrome'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
        // Simulate slow 3G
        launchOptions: {
          args: [
            '--force-effective-connection-type=3g',
            '--force-prefers-reduced-motion',
          ],
        },
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
    
    // Accessibility testing
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        viewport: RESPONSIVE_CONFIG.viewports.desktop['Desktop Medium'],
        // Force prefers-reduced-motion for accessibility testing
        reducedMotion: 'reduce',
      },
      testMatch: '**/responsive/**/*.test.{ts,tsx}',
    },
  ],
  
  // Web server configuration for local testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  // Test metadata
  metadata: {
    testType: 'responsive-visual-regression',
    environment: process.env.NODE_ENV || 'test',
    version: process.env.npm_package_version || '1.0.0',
  },
})

// Export configuration for use in other files
export { RESPONSIVE_CONFIG }
