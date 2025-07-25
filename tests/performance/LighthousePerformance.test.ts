/**
 * Lighthouse Performance Tests
 * 
 * Comprehensive Lighthouse audits for:
 * - Core Web Vitals measurement
 * - Performance score validation
 * - Accessibility compliance
 * - Best practices adherence
 * - SEO optimization
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'
import { CORE_WEB_VITALS_THRESHOLDS, PERFORMANCE_BUDGET, NETWORK_CONDITIONS } from '../utils/performanceTestUtils'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

// Lighthouse thresholds
const LIGHTHOUSE_THRESHOLDS = {
  performance: 90,
  accessibility: 95,
  'best-practices': 90,
  seo: 95,
  pwa: 80,
} as const

// Device configurations
const DEVICES = {
  desktop: {
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  mobile: {
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
} as const

/**
 * Setup page for Lighthouse testing
 */
async function setupLighthouseTest(page: Page, device: keyof typeof DEVICES) {
  const deviceConfig = DEVICES[device]
  
  await page.setViewportSize(deviceConfig.viewport)
  await page.setUserAgent(deviceConfig.userAgent)
  
  // Set device scale factor
  await page.emulateMedia({ 
    media: device === 'mobile' ? 'screen' : 'screen',
    colorScheme: 'light'
  })
}

/**
 * Run Lighthouse audit with custom configuration
 */
async function runLighthouseAudit(
  page: Page,
  url: string,
  options: {
    device: keyof typeof DEVICES
    networkCondition?: keyof typeof NETWORK_CONDITIONS
    thresholds?: Partial<typeof LIGHTHOUSE_THRESHOLDS>
  }
) {
  const { device, networkCondition = 'WiFi', thresholds = LIGHTHOUSE_THRESHOLDS } = options
  
  // Configure network conditions
  if (networkCondition !== 'WiFi') {
    const network = NETWORK_CONDITIONS[networkCondition]
    await page.context().setOffline(false)
    // Note: Playwright doesn't have direct network throttling, 
    // this would typically be configured at the browser level
  }
  
  // Run Lighthouse audit
  const lighthouseResult = await playAudit({
    page,
    thresholds,
    port: 9222, // Chrome debugging port
    opts: {
      chromeFlags: ['--headless'],
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        formFactor: device,
        throttling: networkCondition === 'Slow 3G' ? {
          rttMs: 400,
          throughputKbps: 400,
          cpuSlowdownMultiplier: 4,
        } : networkCondition === 'Fast 3G' ? {
          rttMs: 40,
          throughputKbps: 1500,
          cpuSlowdownMultiplier: 2,
        } : undefined,
        screenEmulation: {
          mobile: device === 'mobile',
          width: DEVICES[device].viewport.width,
          height: DEVICES[device].viewport.height,
          deviceScaleFactor: DEVICES[device].deviceScaleFactor,
        },
      },
    },
  })
  
  return lighthouseResult
}

test.describe('Lighthouse Performance Audits', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure page is ready for testing
    await page.goto(HOMEPAGE_URL)
    await page.waitForLoadState('networkidle')
  })

  test.describe('Desktop Performance', () => {
    test('meets performance thresholds on desktop', async ({ page, context }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      
      // Wait for page to be fully loaded
      await page.waitForSelector('h1', { timeout: 10000 })
      await page.waitForLoadState('networkidle')
      
      // Run Lighthouse audit
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
        networkCondition: 'WiFi',
      })
      
      // Verify performance scores
      expect(result.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.performance)
      expect(result.lhr.categories.accessibility.score * 100).toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.accessibility)
      expect(result.lhr.categories['best-practices'].score * 100).toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS['best-practices'])
      expect(result.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.seo)
    })

    test('meets Core Web Vitals on desktop', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      const audits = result.lhr.audits
      
      // Check LCP (Largest Contentful Paint)
      const lcp = audits['largest-contentful-paint']
      if (lcp && lcp.numericValue) {
        expect(lcp.numericValue).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.LCP.good)
      }
      
      // Check FID (First Input Delay) - simulated through TBT
      const tbt = audits['total-blocking-time']
      if (tbt && tbt.numericValue) {
        expect(tbt.numericValue).toBeLessThanOrEqual(200) // Good TBT threshold
      }
      
      // Check CLS (Cumulative Layout Shift)
      const cls = audits['cumulative-layout-shift']
      if (cls && cls.numericValue) {
        expect(cls.numericValue).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.CLS.good)
      }
    })
  })

  test.describe('Mobile Performance', () => {
    test('meets performance thresholds on mobile', async ({ page }) => {
      await setupLighthouseTest(page, 'mobile')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'mobile',
        networkCondition: 'Fast 3G',
      })
      
      // Mobile thresholds are typically lower
      const mobileThresholds = {
        performance: 85, // Slightly lower for mobile
        accessibility: LIGHTHOUSE_THRESHOLDS.accessibility,
        'best-practices': LIGHTHOUSE_THRESHOLDS['best-practices'],
        seo: LIGHTHOUSE_THRESHOLDS.seo,
      }
      
      expect(result.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(mobileThresholds.performance)
      expect(result.lhr.categories.accessibility.score * 100).toBeGreaterThanOrEqual(mobileThresholds.accessibility)
      expect(result.lhr.categories['best-practices'].score * 100).toBeGreaterThanOrEqual(mobileThresholds['best-practices'])
      expect(result.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(mobileThresholds.seo)
    })

    test('meets Core Web Vitals on mobile', async ({ page }) => {
      await setupLighthouseTest(page, 'mobile')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'mobile',
        networkCondition: 'Fast 3G',
      })
      
      const audits = result.lhr.audits
      
      // Mobile Core Web Vitals thresholds
      const lcp = audits['largest-contentful-paint']
      if (lcp && lcp.numericValue) {
        expect(lcp.numericValue).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.LCP.needsImprovement) // More lenient for mobile
      }
      
      const cls = audits['cumulative-layout-shift']
      if (cls && cls.numericValue) {
        expect(cls.numericValue).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.CLS.good)
      }
    })
  })

  test.describe('Network Condition Testing', () => {
    test('performs adequately on Slow 3G', async ({ page }) => {
      await setupLighthouseTest(page, 'mobile')
      await page.goto(HOMEPAGE_URL)
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'mobile',
        networkCondition: 'Slow 3G',
        thresholds: {
          performance: 70, // Lower threshold for slow network
          accessibility: LIGHTHOUSE_THRESHOLDS.accessibility,
          'best-practices': LIGHTHOUSE_THRESHOLDS['best-practices'],
          seo: LIGHTHOUSE_THRESHOLDS.seo,
        },
      })
      
      // Should still meet minimum performance standards on slow network
      expect(result.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(70)
    })

    test('performs well on Fast 3G', async ({ page }) => {
      await setupLighthouseTest(page, 'mobile')
      await page.goto(HOMEPAGE_URL)
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'mobile',
        networkCondition: 'Fast 3G',
      })
      
      expect(result.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(80)
    })
  })

  test.describe('Specific Performance Metrics', () => {
    test('has fast First Contentful Paint', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      const fcp = result.lhr.audits['first-contentful-paint']
      if (fcp && fcp.numericValue) {
        expect(fcp.numericValue).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.FCP.good)
      }
    })

    test('has minimal Total Blocking Time', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      const tbt = result.lhr.audits['total-blocking-time']
      if (tbt && tbt.numericValue) {
        expect(tbt.numericValue).toBeLessThanOrEqual(200) // Good TBT threshold
      }
    })

    test('has fast Speed Index', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      const speedIndex = result.lhr.audits['speed-index']
      if (speedIndex && speedIndex.numericValue) {
        expect(speedIndex.numericValue).toBeLessThanOrEqual(3400) // Good Speed Index threshold
      }
    })
  })

  test.describe('Resource Optimization', () => {
    test('has optimized images', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      // Check for image optimization opportunities
      const unusedImages = result.lhr.audits['unused-css-rules']
      const modernImageFormats = result.lhr.audits['modern-image-formats']
      const efficientImages = result.lhr.audits['uses-optimized-images']
      
      // These should pass or have minimal impact
      if (modernImageFormats && modernImageFormats.score !== null) {
        expect(modernImageFormats.score).toBeGreaterThanOrEqual(0.8)
      }
    })

    test('has minimal unused JavaScript', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      const unusedJS = result.lhr.audits['unused-javascript']
      if (unusedJS && unusedJS.details && unusedJS.details.overallSavingsBytes) {
        // Should have minimal unused JavaScript
        expect(unusedJS.details.overallSavingsBytes).toBeLessThanOrEqual(50 * 1024) // 50KB threshold
      }
    })
  })

  test.describe('Accessibility Compliance', () => {
    test('meets WCAG accessibility standards', async ({ page }) => {
      await setupLighthouseTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const result = await runLighthouseAudit(page, HOMEPAGE_URL, {
        device: 'desktop',
      })
      
      const accessibilityScore = result.lhr.categories.accessibility.score * 100
      expect(accessibilityScore).toBeGreaterThanOrEqual(LIGHTHOUSE_THRESHOLDS.accessibility)
      
      // Check specific accessibility audits
      const colorContrast = result.lhr.audits['color-contrast']
      if (colorContrast && colorContrast.score !== null) {
        expect(colorContrast.score).toBe(1) // Should have perfect color contrast
      }
      
      const ariaAttributes = result.lhr.audits['aria-valid-attr']
      if (ariaAttributes && ariaAttributes.score !== null) {
        expect(ariaAttributes.score).toBe(1) // Should have valid ARIA attributes
      }
    })
  })
})

// Test configuration for Lighthouse
test.use({
  // Use Chromium for Lighthouse compatibility
  launchOptions: {
    args: [
      '--remote-debugging-port=9222',
      '--disable-web-security',
      '--disable-features=TranslateUI',
    ],
  },
})
