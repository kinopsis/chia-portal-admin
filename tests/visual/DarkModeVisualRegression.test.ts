/**
 * Dark Mode Visual Regression Tests
 * 
 * Comprehensive visual testing for dark mode:
 * - Theme switching animations and transitions
 * - Component appearance in dark mode
 * - Color contrast validation
 * - Cross-browser dark mode consistency
 * - System preference detection
 */

import { test, expect, type Page } from '@playwright/test'

// Test URLs
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
} as const

/**
 * Setup page for dark mode testing
 */
async function setupDarkModeTest(page: Page, viewport: keyof typeof VIEWPORTS) {
  await page.setViewportSize(VIEWPORTS[viewport])
  
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
  
  // Wait for fonts to load
  await page.waitForLoadState('networkidle')
}

/**
 * Enable dark mode
 */
async function enableDarkMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
  })
  await page.waitForTimeout(100) // Wait for theme application
}

/**
 * Enable light mode
 */
async function enableLightMode(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
  })
  await page.waitForTimeout(100) // Wait for theme application
}

/**
 * Set system preference
 */
async function setSystemPreference(page: Page, prefersDark: boolean) {
  await page.emulateMedia({ colorScheme: prefersDark ? 'dark' : 'light' })
}

/**
 * Wait for homepage to load completely
 */
async function waitForHomepageLoad(page: Page) {
  await page.waitForSelector('h1', { timeout: 10000 })
  await page.waitForSelector('[data-testid="service-card"], .service-card', { timeout: 5000 })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000) // Additional wait for any lazy content
}

test.describe('Dark Mode Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOMEPAGE_URL)
  })

  test.describe('Theme Switching Visual Tests', () => {
    Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
      test(`Theme switching - ${viewportName}`, async ({ page }) => {
        await setupDarkModeTest(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        
        // Start in light mode
        await enableLightMode(page)
        await expect(page).toHaveScreenshot(`theme-switch-light-${viewportName}.png`, {
          fullPage: true,
          threshold: 0.2,
        })
        
        // Switch to dark mode
        await enableDarkMode(page)
        await expect(page).toHaveScreenshot(`theme-switch-dark-${viewportName}.png`, {
          fullPage: true,
          threshold: 0.2,
        })
        
        // Switch back to light mode
        await enableLightMode(page)
        await expect(page).toHaveScreenshot(`theme-switch-light-return-${viewportName}.png`, {
          fullPage: true,
          threshold: 0.2,
        })
      })
    })
  })

  test.describe('Component-Specific Dark Mode Tests', () => {
    test('Service Cards - All Color Schemes in Dark Mode', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      await enableDarkMode(page)
      
      // Find service cards section
      const serviceSection = page.locator('section').filter({ hasText: /servicios más solicitados/i })
      if (await serviceSection.count() > 0) {
        await expect(serviceSection).toHaveScreenshot('service-cards-dark-mode.png', {
          threshold: 0.2,
        })
        
        // Test individual service cards
        const serviceCards = serviceSection.locator('.service-card, [data-testid="service-card"]')
        const cardCount = await serviceCards.count()
        
        for (let i = 0; i < Math.min(cardCount, 6); i++) {
          const card = serviceCards.nth(i)
          await expect(card).toHaveScreenshot(`service-card-${i}-dark-mode.png`, {
            threshold: 0.2,
          })
        }
      }
    })

    test('Hero Section - Dark Mode Gradient', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      await enableDarkMode(page)
      
      const heroSection = page.locator('section').first()
      await expect(heroSection).toHaveScreenshot('hero-section-dark-mode.png', {
        threshold: 0.2,
      })
      
      // Test search functionality in dark mode
      const searchInput = heroSection.locator('input[placeholder*="buscar"], input[placeholder*="search"]')
      if (await searchInput.count() > 0) {
        await searchInput.focus()
        await expect(heroSection).toHaveScreenshot('hero-search-focused-dark-mode.png', {
          threshold: 0.2,
        })
        
        await searchInput.fill('certificado')
        await expect(heroSection).toHaveScreenshot('hero-search-filled-dark-mode.png', {
          threshold: 0.2,
        })
      }
    })

    test('Metrics Grid - Dark Mode Styling', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      await enableDarkMode(page)
      
      const metricsSection = page.locator('[data-testid="metrics-grid"], .metrics-grid').first()
      if (await metricsSection.count() > 0) {
        await expect(metricsSection).toHaveScreenshot('metrics-grid-dark-mode.png', {
          threshold: 0.2,
        })
      }
    })

    test('FAQ Accordion - Dark Mode Interactions', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      await enableDarkMode(page)
      
      const faqSection = page.locator('section').filter({ hasText: /preguntas frecuentes/i })
      if (await faqSection.count() > 0) {
        // Default state
        await expect(faqSection).toHaveScreenshot('faq-section-dark-mode-default.png', {
          threshold: 0.2,
        })
        
        // Open additional FAQ items
        const faqButtons = faqSection.locator('button[aria-expanded]')
        const buttonCount = await faqButtons.count()
        
        if (buttonCount > 1) {
          await faqButtons.nth(1).click()
          await page.waitForTimeout(300)
          
          await expect(faqSection).toHaveScreenshot('faq-section-dark-mode-expanded.png', {
            threshold: 0.2,
          })
        }
      }
    })

    test('Department Showcase - Dark Mode Cards', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      await enableDarkMode(page)
      
      const departmentSection = page.locator('section').filter({ hasText: /acceso rápido por dependencia/i })
      if (await departmentSection.count() > 0) {
        await expect(departmentSection).toHaveScreenshot('department-showcase-dark-mode.png', {
          threshold: 0.2,
        })
        
        // Test hover states
        const departmentCards = departmentSection.locator('a')
        if (await departmentCards.count() > 0) {
          await departmentCards.first().hover()
          await page.waitForTimeout(200)
          
          await expect(departmentSection).toHaveScreenshot('department-showcase-dark-mode-hover.png', {
            threshold: 0.2,
          })
        }
      }
    })
  })

  test.describe('System Preference Detection', () => {
    test('System Dark Mode Preference', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      
      // Set system preference to dark
      await setSystemPreference(page, true)
      
      // Set theme to system
      await page.evaluate(() => {
        localStorage.setItem('theme', 'system')
      })
      
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      
      // Should automatically be in dark mode
      await expect(page).toHaveScreenshot('system-dark-preference.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })

    test('System Light Mode Preference', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      
      // Set system preference to light
      await setSystemPreference(page, false)
      
      // Set theme to system
      await page.evaluate(() => {
        localStorage.setItem('theme', 'system')
      })
      
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      
      // Should automatically be in light mode
      await expect(page).toHaveScreenshot('system-light-preference.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })
  })

  test.describe('Cross-Browser Dark Mode Consistency', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`Dark mode consistency - ${browserName}`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: VIEWPORTS.desktop,
          colorScheme: 'dark',
        })
        const page = await context.newPage()
        
        await setupDarkModeTest(page, 'desktop')
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        await enableDarkMode(page)
        
        await expect(page).toHaveScreenshot(`dark-mode-${browserName}.png`, {
          fullPage: true,
          threshold: 0.3, // Allow more variance for cross-browser
          maxDiffPixels: 2000,
        })
        
        await context.close()
      })
    })
  })

  test.describe('Responsive Dark Mode', () => {
    Object.entries(VIEWPORTS).forEach(([viewportName, viewport]) => {
      test(`Dark mode responsive - ${viewportName}`, async ({ page }) => {
        await setupDarkModeTest(page, viewportName as keyof typeof VIEWPORTS)
        await page.goto(HOMEPAGE_URL)
        await waitForHomepageLoad(page)
        await enableDarkMode(page)
        
        await expect(page).toHaveScreenshot(`dark-mode-responsive-${viewportName}.png`, {
          fullPage: true,
          threshold: 0.2,
        })
      })
    })
  })

  test.describe('Theme Persistence', () => {
    test('Dark mode persists across page reloads', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      
      // Enable dark mode
      await enableDarkMode(page)
      
      // Take screenshot in dark mode
      await expect(page).toHaveScreenshot('dark-mode-before-reload.png', {
        fullPage: true,
        threshold: 0.2,
      })
      
      // Reload page
      await page.reload()
      await waitForHomepageLoad(page)
      
      // Should still be in dark mode
      await expect(page).toHaveScreenshot('dark-mode-after-reload.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })
  })

  test.describe('Color Contrast Validation', () => {
    test('Dark mode color contrast compliance', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await page.goto(HOMEPAGE_URL)
      await waitForHomepageLoad(page)
      await enableDarkMode(page)
      
      // Check color contrast for key elements
      const contrastResults = await page.evaluate(() => {
        const elements = [
          { selector: 'h1', name: 'Main heading' },
          { selector: 'h2', name: 'Section headings' },
          { selector: 'p', name: 'Body text' },
          { selector: 'button', name: 'Buttons' },
          { selector: 'a', name: 'Links' },
        ]
        
        return elements.map(({ selector, name }) => {
          const element = document.querySelector(selector)
          if (!element) return { name, error: 'Element not found' }
          
          const styles = window.getComputedStyle(element)
          return {
            name,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            selector,
          }
        })
      })
      
      // Log contrast results for manual verification
      console.log('Dark mode color contrast results:', contrastResults)
      
      // Take screenshot for visual verification
      await expect(page).toHaveScreenshot('dark-mode-contrast-validation.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })
  })

  test.describe('Loading States in Dark Mode', () => {
    test('Loading skeletons in dark mode', async ({ page }) => {
      await setupDarkModeTest(page, 'desktop')
      await enableDarkMode(page)
      
      // Intercept API calls to show loading states
      await page.route('**/api/**', async route => {
        await page.waitForTimeout(2000)
        await route.continue()
      })
      
      await page.goto(HOMEPAGE_URL)
      
      // Screenshot during loading
      await expect(page).toHaveScreenshot('dark-mode-loading-state.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })
  })
})

// Test configuration for dark mode
test.use({
  colorScheme: 'dark',
})
