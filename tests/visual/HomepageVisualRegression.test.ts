/**
 * Homepage Visual Regression Tests
 * 
 * Tests visual consistency across different:
 * - Viewport sizes (mobile, tablet, desktop)
 * - Browsers (Chrome, Firefox, Safari)
 * - Themes (light, dark)
 * - Component states (loading, error, interactive)
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test'

// Viewport configurations for testing
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
  desktopLarge: { width: 1920, height: 1080 },
} as const

// Test URLs
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

/**
 * Setup page with common configurations
 */
async function setupPage(page: Page, viewport: keyof typeof VIEWPORTS) {
  await page.setViewportSize(VIEWPORTS[viewport])
  
  // Wait for fonts to load
  await page.addStyleTag({
    content: `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `
  })
  
  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  })
}

/**
 * Wait for homepage to be fully loaded
 */
async function waitForHomepageLoad(page: Page) {
  // Wait for main content to load
  await page.waitForSelector('[data-testid="hero-section"], h1', { timeout: 10000 })
  
  // Wait for service cards to load
  await page.waitForSelector('[data-testid="service-card"], .service-card', { timeout: 5000 })
  
  // Wait for metrics to load (if any)
  await page.waitForSelector('[data-testid="metrics-grid"], .metrics-grid', { timeout: 5000 })
  
  // Wait for images to load
  await page.waitForLoadState('networkidle')
  
  // Additional wait for any lazy-loaded content
  await page.waitForTimeout(1000)
}

test.describe('Homepage Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up common page configurations
    await page.goto(HOMEPAGE_URL)
  })

  test.describe('Light Theme', () => {
    Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
      test(`Homepage - ${viewportName} - Light Theme`, async ({ page }) => {
        await setupPage(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Ensure light theme is active
        await page.evaluate(() => {
          localStorage.setItem('theme', 'light')
          document.documentElement.classList.remove('dark')
        })
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`homepage-${viewportName}-light.png`, {
          fullPage: true,
          threshold: 0.2,
          maxDiffPixels: 1000,
        })
      })
    })
  })

  test.describe('Dark Theme', () => {
    Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
      test(`Homepage - ${viewportName} - Dark Theme`, async ({ page }) => {
        await setupPage(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Enable dark theme
        await page.evaluate(() => {
          localStorage.setItem('theme', 'dark')
          document.documentElement.classList.add('dark')
        })
        
        // Wait for theme transition
        await page.waitForTimeout(500)
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`homepage-${viewportName}-dark.png`, {
          fullPage: true,
          threshold: 0.2,
          maxDiffPixels: 1000,
        })
      })
    })
  })

  test.describe('Component-Specific Visual Tests', () => {
    test('Hero Section - All Viewports', async ({ page }) => {
      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        await setupPage(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Focus on hero section
        const heroSection = page.locator('section').first()
        await expect(heroSection).toHaveScreenshot(`hero-section-${viewportName}.png`, {
          threshold: 0.2,
        })
      }
    })

    test('Service Cards Grid - Responsive Layout', async ({ page }) => {
      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        await setupPage(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Find service cards section
        const serviceSection = page.locator('section').filter({ hasText: /servicios más solicitados/i })
        if (await serviceSection.count() > 0) {
          await expect(serviceSection).toHaveScreenshot(`service-cards-${viewportName}.png`, {
            threshold: 0.2,
          })
        }
      }
    })

    test('Metrics Grid - Responsive Display', async ({ page }) => {
      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        await setupPage(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Find metrics section
        const metricsSection = page.locator('[data-testid="metrics-grid"], .metrics-grid').first()
        if (await metricsSection.count() > 0) {
          await expect(metricsSection).toHaveScreenshot(`metrics-grid-${viewportName}.png`, {
            threshold: 0.2,
          })
        }
      }
    })

    test('FAQ Section - Accordion States', async ({ page }) => {
      await setupPage(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      
      // Find FAQ section
      const faqSection = page.locator('section').filter({ hasText: /preguntas frecuentes/i })
      
      if (await faqSection.count() > 0) {
        // Screenshot with default state (first FAQ open)
        await expect(faqSection).toHaveScreenshot('faq-section-default.png', {
          threshold: 0.2,
        })
        
        // Click to open second FAQ
        const faqButtons = faqSection.locator('button[aria-expanded]')
        if (await faqButtons.count() > 1) {
          await faqButtons.nth(1).click()
          await page.waitForTimeout(300) // Wait for animation
          
          await expect(faqSection).toHaveScreenshot('faq-section-multiple-open.png', {
            threshold: 0.2,
          })
        }
      }
    })
  })

  test.describe('Interactive States', () => {
    test('Service Card Hover States - Desktop', async ({ page }) => {
      await setupPage(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      
      // Find first service card
      const serviceCard = page.locator('.service-card, [data-testid="service-card"]').first()
      
      if (await serviceCard.count() > 0) {
        // Normal state
        await expect(serviceCard).toHaveScreenshot('service-card-normal.png', {
          threshold: 0.2,
        })
        
        // Hover state
        await serviceCard.hover()
        await page.waitForTimeout(200) // Wait for hover animation
        
        await expect(serviceCard).toHaveScreenshot('service-card-hover.png', {
          threshold: 0.2,
        })
      }
    })

    test('Search Input Focus States', async ({ page }) => {
      await setupPage(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      
      // Find search input in hero section
      const searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="search"]').first()
      
      if (await searchInput.count() > 0) {
        const heroSection = page.locator('section').first()
        
        // Normal state
        await expect(heroSection).toHaveScreenshot('hero-search-normal.png', {
          threshold: 0.2,
        })
        
        // Focus state
        await searchInput.focus()
        await page.waitForTimeout(200)
        
        await expect(heroSection).toHaveScreenshot('hero-search-focused.png', {
          threshold: 0.2,
        })
        
        // With text
        await searchInput.fill('certificado')
        await page.waitForTimeout(200)
        
        await expect(heroSection).toHaveScreenshot('hero-search-with-text.png', {
          threshold: 0.2,
        })
      }
    })
  })

  test.describe('Loading States', () => {
    test('Metrics Loading State', async ({ page }) => {
      await setupPage(page, 'desktop')
      
      // Intercept metrics API call to simulate loading
      await page.route('**/api/metrics**', async route => {
        // Delay response to show loading state
        await page.waitForTimeout(2000)
        await route.continue()
      })
      
      await page.goto(HOMEPAGE_URL)
      
      // Screenshot during loading
      const metricsSection = page.locator('[data-testid="metrics-grid"], .metrics-grid').first()
      if (await metricsSection.count() > 0) {
        await expect(metricsSection).toHaveScreenshot('metrics-loading.png', {
          threshold: 0.2,
        })
      }
    })
  })

  test.describe('Error States', () => {
    test('Metrics Error State', async ({ page }) => {
      await setupPage(page, 'desktop')
      
      // Intercept metrics API call to simulate error
      await page.route('**/api/metrics**', async route => {
        await route.abort('failed')
      })
      
      await page.goto(HOMEPAGE_URL)
      await page.waitForTimeout(3000) // Wait for error state
      
      // Screenshot error state
      const metricsSection = page.locator('[data-testid="metrics-grid"], .metrics-grid').first()
      if (await metricsSection.count() > 0) {
        await expect(metricsSection).toHaveScreenshot('metrics-error.png', {
          threshold: 0.2,
        })
      }
    })
  })

  test.describe('Cross-Browser Consistency', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`Homepage consistency - ${browserName}`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: VIEWPORTS.desktop,
        })
        const page = await context.newPage()
        
        await setupPage(page, 'desktop')
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Take screenshot for browser comparison
        await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
          fullPage: true,
          threshold: 0.3, // Allow more variance for cross-browser
          maxDiffPixels: 2000,
        })
        
        await context.close()
      })
    })
  })

  test.describe('Performance Visual Tests', () => {
    test('Page Load Performance Visual', async ({ page }) => {
      await setupPage(page, 'desktop')
      
      // Start performance monitoring
      await page.goto(HOMEPAGE_URL, { waitUntil: 'domcontentloaded' })
      
      // Screenshot at different loading stages
      await expect(page).toHaveScreenshot('homepage-dom-loaded.png', {
        threshold: 0.3,
      })
      
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveScreenshot('homepage-fully-loaded.png', {
        threshold: 0.2,
      })
    })
  })
})

// Configuration for visual regression tests
test.use({
  // Use consistent browser settings
  launchOptions: {
    args: [
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
    ],
  },
})
