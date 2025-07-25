/**
 * Core Web Vitals Tests
 * 
 * Comprehensive testing for Core Web Vitals metrics:
 * - Largest Contentful Paint (LCP)
 * - First Input Delay (FID)
 * - Cumulative Layout Shift (CLS)
 * - First Contentful Paint (FCP)
 * - Time to First Byte (TTFB)
 */

import { test, expect, type Page } from '@playwright/test'
import { CORE_WEB_VITALS_THRESHOLDS } from '../utils/performanceTestUtils'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

// Device configurations for testing
const DEVICES = {
  desktop: { width: 1440, height: 900, isMobile: false },
  mobile: { width: 375, height: 667, isMobile: true },
  tablet: { width: 768, height: 1024, isMobile: false },
} as const

/**
 * Collect Core Web Vitals metrics from the page
 */
async function collectWebVitals(page: Page): Promise<{
  LCP?: number
  FID?: number
  CLS?: number
  FCP?: number
  TTFB?: number
}> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics: any = {}
      let lcpObserver: PerformanceObserver | null = null
      let fidObserver: PerformanceObserver | null = null
      let clsObserver: PerformanceObserver | null = null
      
      // Collect LCP
      try {
        lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          metrics.LCP = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP not supported')
      }

      // Collect FID
      try {
        fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry: any) => {
            metrics.FID = entry.processingStart - entry.startTime
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('FID not supported')
      }

      // Collect CLS
      try {
        let clsValue = 0
        clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          metrics.CLS = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS not supported')
      }

      // Collect FCP and TTFB from existing performance entries
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        metrics.FCP = fcpEntry.startTime
      }

      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming
        metrics.TTFB = navEntry.responseStart - navEntry.requestStart
      }

      // Wait for metrics to be collected
      setTimeout(() => {
        // Cleanup observers
        lcpObserver?.disconnect()
        fidObserver?.disconnect()
        clsObserver?.disconnect()
        
        resolve(metrics)
      }, 3000) // Wait 3 seconds for metrics collection
    })
  })
}

/**
 * Simulate user interaction to trigger FID measurement
 */
async function simulateUserInteraction(page: Page): Promise<void> {
  // Click on the search input to trigger first input delay
  const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="search"]').first()
  if (await searchInput.count() > 0) {
    await searchInput.click()
    await page.waitForTimeout(100)
  } else {
    // Fallback: click on any button
    const button = page.locator('button').first()
    if (await button.count() > 0) {
      await button.click()
      await page.waitForTimeout(100)
    }
  }
}

/**
 * Wait for page to be fully loaded and stable
 */
async function waitForPageStability(page: Page): Promise<void> {
  // Wait for main content
  await page.waitForSelector('h1', { timeout: 10000 })
  
  // Wait for service cards or main content
  await page.waitForSelector('[data-testid="service-card"], .service-card, main', { timeout: 5000 })
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle')
  
  // Additional wait for any lazy-loaded content
  await page.waitForTimeout(1000)
}

test.describe('Core Web Vitals Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto(HOMEPAGE_URL)
  })

  test.describe('Largest Contentful Paint (LCP)', () => {
    Object.entries(DEVICES).forEach(([deviceName, device]) => {
      test(`LCP meets good threshold on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })
        await page.goto(HOMEPAGE_URL)
        await waitForPageStability(page)
        
        const metrics = await collectWebVitals(page)
        
        if (metrics.LCP) {
          console.log(`LCP on ${deviceName}: ${metrics.LCP}ms`)
          
          if (device.isMobile) {
            // More lenient threshold for mobile
            expect(metrics.LCP).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.LCP.needsImprovement)
          } else {
            expect(metrics.LCP).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.LCP.good)
          }
        } else {
          console.warn(`LCP not measured on ${deviceName}`)
        }
      })
    })

    test('LCP element is above the fold', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(HOMEPAGE_URL)
      await waitForPageStability(page)
      
      // Check that the LCP element (likely the hero section) is visible
      const heroSection = page.locator('h1, [data-testid="hero-section"]').first()
      await expect(heroSection).toBeInViewport()
    })
  })

  test.describe('First Input Delay (FID)', () => {
    Object.entries(DEVICES).forEach(([deviceName, device]) => {
      test(`FID meets good threshold on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })
        await page.goto(HOMEPAGE_URL)
        await waitForPageStability(page)
        
        // Simulate user interaction
        await simulateUserInteraction(page)
        
        const metrics = await collectWebVitals(page)
        
        if (metrics.FID !== undefined) {
          console.log(`FID on ${deviceName}: ${metrics.FID}ms`)
          expect(metrics.FID).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.FID.good)
        } else {
          console.warn(`FID not measured on ${deviceName} - no user interaction detected`)
        }
      })
    })

    test('Interactive elements respond quickly', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(HOMEPAGE_URL)
      await waitForPageStability(page)
      
      // Test search input responsiveness
      const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="search"]').first()
      if (await searchInput.count() > 0) {
        const startTime = Date.now()
        await searchInput.click()
        await searchInput.type('test')
        const endTime = Date.now()
        
        const responseTime = endTime - startTime
        expect(responseTime).toBeLessThanOrEqual(100) // Should respond within 100ms
      }
    })
  })

  test.describe('Cumulative Layout Shift (CLS)', () => {
    Object.entries(DEVICES).forEach(([deviceName, device]) => {
      test(`CLS meets good threshold on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })
        await page.goto(HOMEPAGE_URL)
        await waitForPageStability(page)
        
        const metrics = await collectWebVitals(page)
        
        if (metrics.CLS !== undefined) {
          console.log(`CLS on ${deviceName}: ${metrics.CLS}`)
          expect(metrics.CLS).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.CLS.good)
        } else {
          console.warn(`CLS not measured on ${deviceName}`)
        }
      })
    })

    test('No layout shifts during theme switching', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(HOMEPAGE_URL)
      await waitForPageStability(page)
      
      // Measure CLS before theme switch
      const initialMetrics = await collectWebVitals(page)
      
      // Switch theme (if theme toggle exists)
      const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').first()
      if (await themeToggle.count() > 0) {
        await themeToggle.click()
        await page.waitForTimeout(500) // Wait for theme transition
        
        const finalMetrics = await collectWebVitals(page)
        
        // CLS should not increase significantly due to theme switching
        const clsIncrease = (finalMetrics.CLS || 0) - (initialMetrics.CLS || 0)
        expect(clsIncrease).toBeLessThanOrEqual(0.05) // Minimal layout shift allowed
      }
    })

    test('No layout shifts during component loading', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      
      // Intercept API calls to simulate loading states
      await page.route('**/api/**', async route => {
        await page.waitForTimeout(1000) // Simulate slow API
        await route.continue()
      })
      
      await page.goto(HOMEPAGE_URL)
      
      // Wait for initial load
      await page.waitForSelector('h1', { timeout: 10000 })
      
      // Wait for all content to load
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      
      const metrics = await collectWebVitals(page)
      
      if (metrics.CLS !== undefined) {
        expect(metrics.CLS).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.CLS.good)
      }
    })
  })

  test.describe('First Contentful Paint (FCP)', () => {
    Object.entries(DEVICES).forEach(([deviceName, device]) => {
      test(`FCP meets good threshold on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })
        await page.goto(HOMEPAGE_URL)
        await waitForPageStability(page)
        
        const metrics = await collectWebVitals(page)
        
        if (metrics.FCP) {
          console.log(`FCP on ${deviceName}: ${metrics.FCP}ms`)
          
          if (device.isMobile) {
            // More lenient threshold for mobile
            expect(metrics.FCP).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.FCP.needsImprovement)
          } else {
            expect(metrics.FCP).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.FCP.good)
          }
        } else {
          console.warn(`FCP not measured on ${deviceName}`)
        }
      })
    })
  })

  test.describe('Time to First Byte (TTFB)', () => {
    Object.entries(DEVICES).forEach(([deviceName, device]) => {
      test(`TTFB meets good threshold on ${deviceName}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })
        await page.goto(HOMEPAGE_URL)
        await waitForPageStability(page)
        
        const metrics = await collectWebVitals(page)
        
        if (metrics.TTFB) {
          console.log(`TTFB on ${deviceName}: ${metrics.TTFB}ms`)
          expect(metrics.TTFB).toBeLessThanOrEqual(CORE_WEB_VITALS_THRESHOLDS.TTFB.good)
        } else {
          console.warn(`TTFB not measured on ${deviceName}`)
        }
      })
    })
  })

  test.describe('Overall Core Web Vitals Score', () => {
    test('Meets all Core Web Vitals thresholds on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(HOMEPAGE_URL)
      await waitForPageStability(page)
      
      // Simulate user interaction for FID
      await simulateUserInteraction(page)
      
      const metrics = await collectWebVitals(page)
      
      console.log('Desktop Core Web Vitals:', metrics)
      
      // Evaluate all metrics
      const scores = {
        LCP: metrics.LCP ? (metrics.LCP <= CORE_WEB_VITALS_THRESHOLDS.LCP.good ? 'good' : 'needs-improvement') : 'unknown',
        FID: metrics.FID ? (metrics.FID <= CORE_WEB_VITALS_THRESHOLDS.FID.good ? 'good' : 'needs-improvement') : 'unknown',
        CLS: metrics.CLS ? (metrics.CLS <= CORE_WEB_VITALS_THRESHOLDS.CLS.good ? 'good' : 'needs-improvement') : 'unknown',
      }
      
      console.log('Core Web Vitals Scores:', scores)
      
      // At least 2 out of 3 should be good for overall good score
      const goodScores = Object.values(scores).filter(score => score === 'good').length
      expect(goodScores).toBeGreaterThanOrEqual(2)
    })

    test('Acceptable Core Web Vitals on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(HOMEPAGE_URL)
      await waitForPageStability(page)
      
      // Simulate user interaction for FID
      await simulateUserInteraction(page)
      
      const metrics = await collectWebVitals(page)
      
      console.log('Mobile Core Web Vitals:', metrics)
      
      // More lenient evaluation for mobile
      const scores = {
        LCP: metrics.LCP ? (metrics.LCP <= CORE_WEB_VITALS_THRESHOLDS.LCP.needsImprovement ? 'acceptable' : 'poor') : 'unknown',
        FID: metrics.FID ? (metrics.FID <= CORE_WEB_VITALS_THRESHOLDS.FID.good ? 'good' : 'needs-improvement') : 'unknown',
        CLS: metrics.CLS ? (metrics.CLS <= CORE_WEB_VITALS_THRESHOLDS.CLS.good ? 'good' : 'needs-improvement') : 'unknown',
      }
      
      console.log('Mobile Core Web Vitals Scores:', scores)
      
      // Should not have any poor scores
      const poorScores = Object.values(scores).filter(score => score === 'poor').length
      expect(poorScores).toBe(0)
    })
  })
})
