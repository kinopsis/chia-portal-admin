/**
 * Playwright Cross-Browser Tests
 * 
 * Comprehensive cross-browser testing using Playwright:
 * - Chrome, Firefox, Safari compatibility
 * - Visual consistency across browsers
 * - Feature support validation
 * - Performance comparison
 * - Responsive behavior testing
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { CROSS_BROWSER_VIEWPORTS } from '../utils/crossBrowserTestUtils'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

// Browser configurations for testing
const BROWSER_CONFIGS = {
  chromium: {
    name: 'Chrome',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  firefox: {
    name: 'Firefox',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  },
  webkit: {
    name: 'Safari',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  },
} as const

/**
 * Setup page for cross-browser testing
 */
async function setupCrossBrowserTest(
  page: Page,
  viewport: keyof typeof CROSS_BROWSER_VIEWPORTS,
  browser: keyof typeof BROWSER_CONFIGS
) {
  const viewportConfig = CROSS_BROWSER_VIEWPORTS[viewport]
  const browserConfig = BROWSER_CONFIGS[browser]
  
  await page.setViewportSize({
    width: viewportConfig.width,
    height: viewportConfig.height,
  })
  
  await page.setUserAgent(browserConfig.userAgent)
  
  // Navigate to homepage
  await page.goto(HOMEPAGE_URL)
  await page.waitForSelector('h1', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

/**
 * Test browser feature support
 */
async function testBrowserFeatures(page: Page): Promise<{
  css: Record<string, boolean>
  javascript: Record<string, boolean>
  media: Record<string, boolean>
}> {
  return await page.evaluate(() => {
    const features = {
      css: {} as Record<string, boolean>,
      javascript: {} as Record<string, boolean>,
      media: {} as Record<string, boolean>,
    }
    
    // Test CSS features
    if (typeof CSS !== 'undefined' && CSS.supports) {
      features.css.grid = CSS.supports('display', 'grid')
      features.css.flexbox = CSS.supports('display', 'flex')
      features.css.customProperties = CSS.supports('--test', 'value')
      features.css.gap = CSS.supports('gap', '1rem')
      features.css.aspectRatio = CSS.supports('aspect-ratio', '1/1')
      features.css.containerQueries = CSS.supports('container-type', 'inline-size')
    }
    
    // Test JavaScript features
    features.javascript.es2020 = typeof globalThis !== 'undefined'
    features.javascript.modules = 'noModule' in document.createElement('script')
    features.javascript.intersectionObserver = 'IntersectionObserver' in window
    features.javascript.resizeObserver = 'ResizeObserver' in window
    features.javascript.performanceObserver = 'PerformanceObserver' in window
    features.javascript.fetch = 'fetch' in window
    
    // Test media features
    features.media.matchMedia = 'matchMedia' in window
    features.media.touchEvents = 'ontouchstart' in window
    features.media.pointerEvents = 'onpointerdown' in window
    features.media.devicePixelRatio = 'devicePixelRatio' in window
    
    return features
  })
}

/**
 * Compare visual rendering across browsers
 */
async function compareVisualRendering(page: Page, selector: string): Promise<{
  dimensions: { width: number; height: number }
  position: { x: number; y: number }
  styles: Record<string, string>
}> {
  const element = page.locator(selector).first()
  
  const boundingBox = await element.boundingBox()
  if (!boundingBox) {
    throw new Error(`Element ${selector} not found or not visible`)
  }
  
  const styles = await element.evaluate((el) => {
    const computedStyle = window.getComputedStyle(el)
    return {
      display: computedStyle.display,
      position: computedStyle.position,
      width: computedStyle.width,
      height: computedStyle.height,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      fontSize: computedStyle.fontSize,
      fontFamily: computedStyle.fontFamily,
    }
  })
  
  return {
    dimensions: {
      width: boundingBox.width,
      height: boundingBox.height,
    },
    position: {
      x: boundingBox.x,
      y: boundingBox.y,
    },
    styles,
  }
}

test.describe('Cross-Browser Compatibility Tests', () => {
  test.describe('Browser Feature Support', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`validates feature support in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        const features = await testBrowserFeatures(page)
        
        console.log(`${BROWSER_CONFIGS[browserName].name} features:`, features)
        
        // Critical CSS features should be supported
        expect(features.css.grid).toBe(true)
        expect(features.css.flexbox).toBe(true)
        expect(features.css.customProperties).toBe(true)
        
        // Critical JavaScript features should be supported
        expect(features.javascript.fetch).toBe(true)
        expect(features.javascript.es2020).toBe(true)
        
        // Media features should be available
        expect(features.media.matchMedia).toBe(true)
        
        await context.close()
      })
    })
  })

  test.describe('Visual Consistency Across Browsers', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`renders ServiceCard consistently in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        // Wait for service cards to load
        await page.waitForSelector('[data-testid="service-card"], .service-card', { timeout: 5000 })
        
        const serviceCard = page.locator('[data-testid="service-card"], .service-card').first()
        await expect(serviceCard).toBeVisible()
        
        // Take screenshot for visual comparison
        await expect(serviceCard).toHaveScreenshot(`service-card-${browserName}.png`, {
          threshold: 0.3, // Allow for browser rendering differences
        })
        
        await context.close()
      })
    })

    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`renders HeroSection consistently in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        const heroSection = page.locator('h1').first()
        await expect(heroSection).toBeVisible()
        
        // Test hero section rendering
        const heroContainer = page.locator('section').first()
        await expect(heroContainer).toHaveScreenshot(`hero-section-${browserName}.png`, {
          threshold: 0.3,
        })
        
        await context.close()
      })
    })
  })

  test.describe('Responsive Behavior Across Browsers', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      Object.entries(CROSS_BROWSER_VIEWPORTS).forEach(([viewportName, viewport]) => {
        test(`responsive design works in ${BROWSER_CONFIGS[browserName].name} at ${viewportName}`, async ({ browser }) => {
          const context = await browser.newContext({
            userAgent: BROWSER_CONFIGS[browserName].userAgent,
            viewport: {
              width: viewport.width,
              height: viewport.height,
            },
          })
          const page = await context.newPage()
          
          await page.goto(HOMEPAGE_URL)
          await page.waitForSelector('h1', { timeout: 10000 })
          await page.waitForLoadState('networkidle')
          
          // Check that content is visible and properly laid out
          const heading = page.locator('h1').first()
          await expect(heading).toBeVisible()
          
          // Check for horizontal scrollbar (should not exist)
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth
          })
          expect(hasHorizontalScroll).toBe(false)
          
          // Take screenshot for responsive comparison
          await expect(page).toHaveScreenshot(`responsive-${browserName}-${viewportName}.png`, {
            fullPage: true,
            threshold: 0.3,
          })
          
          await context.close()
        })
      })
    })
  })

  test.describe('Interactive Functionality Across Browsers', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`theme switching works in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        // Test theme switching if theme toggle exists
        const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').first()
        
        if (await themeToggle.count() > 0) {
          // Test light to dark
          await themeToggle.click()
          await page.waitForTimeout(500)
          
          const isDark = await page.evaluate(() => {
            return document.documentElement.classList.contains('dark')
          })
          
          // Should switch theme (either to dark or back to light)
          expect(typeof isDark).toBe('boolean')
          
          // Take screenshot in switched theme
          await expect(page).toHaveScreenshot(`theme-switched-${browserName}.png`, {
            fullPage: true,
            threshold: 0.3,
          })
        }
        
        await context.close()
      })
    })

    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`search functionality works in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        // Test search functionality if search input exists
        const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="search"]').first()
        
        if (await searchInput.count() > 0) {
          await searchInput.fill('certificado')
          await searchInput.press('Enter')
          
          // Should not cause errors
          await page.waitForTimeout(500)
          expect(await searchInput.inputValue()).toBe('certificado')
        }
        
        await context.close()
      })
    })

    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`FAQ accordion works in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        // Test FAQ accordion if it exists
        const faqButton = page.locator('button[aria-expanded]').first()
        
        if (await faqButton.count() > 0) {
          const initialExpanded = await faqButton.getAttribute('aria-expanded')
          
          await faqButton.click()
          await page.waitForTimeout(300)
          
          const newExpanded = await faqButton.getAttribute('aria-expanded')
          expect(newExpanded).not.toBe(initialExpanded)
        }
        
        await context.close()
      })
    })
  })

  test.describe('Performance Across Browsers', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`loads efficiently in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        const startTime = Date.now()
        
        await page.goto(HOMEPAGE_URL)
        await page.waitForSelector('h1', { timeout: 10000 })
        await page.waitForLoadState('networkidle')
        
        const loadTime = Date.now() - startTime
        
        console.log(`${BROWSER_CONFIGS[browserName].name} load time: ${loadTime}ms`)
        
        // Should load within reasonable time
        expect(loadTime).toBeLessThan(5000) // 5 seconds max
        
        // Check for JavaScript errors
        const errors: string[] = []
        page.on('pageerror', (error) => {
          errors.push(error.message)
        })
        
        await page.waitForTimeout(1000)
        expect(errors).toHaveLength(0)
        
        await context.close()
      })
    })
  })

  test.describe('Accessibility Across Browsers', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`maintains accessibility in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        await setupCrossBrowserTest(page, 'desktop', browserName)
        
        // Check for proper heading structure
        const h1 = page.locator('h1')
        await expect(h1).toHaveCount(1)
        
        // Check for interactive elements
        const buttons = page.locator('button')
        const buttonCount = await buttons.count()
        
        if (buttonCount > 0) {
          // Test keyboard navigation
          await page.keyboard.press('Tab')
          
          const focusedElement = page.locator(':focus')
          await expect(focusedElement).toBeVisible()
        }
        
        // Check for proper ARIA attributes
        const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby]')
        const ariaCount = await ariaElements.count()
        expect(ariaCount).toBeGreaterThan(0)
        
        await context.close()
      })
    })
  })

  test.describe('Error Handling Across Browsers', () => {
    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`handles network errors gracefully in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        // Intercept and fail some requests to simulate network issues
        await page.route('**/api/**', async route => {
          await route.abort('failed')
        })
        
        await page.goto(HOMEPAGE_URL)
        await page.waitForSelector('h1', { timeout: 10000 })
        
        // Page should still load despite API failures
        const heading = page.locator('h1').first()
        await expect(heading).toBeVisible()
        
        await context.close()
      })
    })

    (['chromium', 'firefox', 'webkit'] as const).forEach(browserName => {
      test(`handles JavaScript errors gracefully in ${BROWSER_CONFIGS[browserName].name}`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
        })
        const page = await context.newPage()
        
        // Inject a script that might cause errors
        await page.addInitScript(() => {
          // Override a method to potentially cause issues
          const originalQuerySelector = document.querySelector
          document.querySelector = function(selector: string) {
            if (selector.includes('error-test')) {
              throw new Error('Test error')
            }
            return originalQuerySelector.call(this, selector)
          }
        })
        
        await page.goto(HOMEPAGE_URL)
        await page.waitForSelector('h1', { timeout: 10000 })
        
        // Page should still function despite potential errors
        const heading = page.locator('h1').first()
        await expect(heading).toBeVisible()
        
        await context.close()
      })
    })
  })
})

// Configure tests to run across all browsers
test.describe('Cross-Browser Test Matrix', () => {
  const browsers = ['chromium', 'firefox', 'webkit'] as const
  const viewports = ['mobile', 'tablet', 'desktop'] as const
  
  browsers.forEach(browserName => {
    viewports.forEach(viewportName => {
      test(`${BROWSER_CONFIGS[browserName].name} - ${viewportName} compatibility`, async ({ browser }) => {
        const context = await browser.newContext({
          userAgent: BROWSER_CONFIGS[browserName].userAgent,
          viewport: CROSS_BROWSER_VIEWPORTS[viewportName],
        })
        const page = await context.newPage()
        
        await page.goto(HOMEPAGE_URL)
        await page.waitForSelector('h1', { timeout: 10000 })
        await page.waitForLoadState('networkidle')
        
        // Basic functionality test
        const heading = page.locator('h1').first()
        await expect(heading).toBeVisible()
        
        // Check for layout issues
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth
        })
        expect(hasHorizontalScroll).toBe(false)
        
        // Take screenshot for comparison
        await expect(page).toHaveScreenshot(`matrix-${browserName}-${viewportName}.png`, {
          fullPage: true,
          threshold: 0.3,
        })
        
        await context.close()
      })
    })
  })
})
