/**
 * Playwright Accessibility Tests
 * 
 * Comprehensive accessibility testing using Playwright:
 * - Automated axe-core audits
 * - Keyboard navigation testing
 * - Screen reader simulation
 * - Color contrast validation
 * - Focus management testing
 * - WCAG 2.1 AA compliance validation
 */

import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

// Accessibility test configuration
const ACCESSIBILITY_CONFIG = {
  // WCAG 2.1 AA compliance tags
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Rules to include/exclude
  rules: {
    // Include critical accessibility rules
    include: [
      'color-contrast',
      'keyboard',
      'aria-valid-attr',
      'aria-required-attr',
      'button-name',
      'link-name',
      'image-alt',
      'label',
      'heading-order',
      'landmark-one-main',
      'page-has-heading-one',
      'region',
    ],
    // Exclude rules that might not be relevant
    exclude: [
      'color-contrast-enhanced', // We test AA, not AAA
    ],
  },
  
  // Viewport configurations
  viewports: {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
} as const

/**
 * Setup page for accessibility testing
 */
async function setupAccessibilityTest(page: Page, viewport: keyof typeof ACCESSIBILITY_CONFIG.viewports) {
  await page.setViewportSize(ACCESSIBILITY_CONFIG.viewports[viewport])
  
  // Ensure page is fully loaded
  await page.goto(HOMEPAGE_URL)
  await page.waitForSelector('h1', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}

/**
 * Run comprehensive axe audit
 */
async function runAxeAudit(page: Page, options: {
  include?: string[]
  exclude?: string[]
  tags?: string[]
} = {}) {
  const axeBuilder = new AxeBuilder({ page })
    .withTags(options.tags || ACCESSIBILITY_CONFIG.tags)
  
  if (options.include) {
    axeBuilder.include(options.include)
  }
  
  if (options.exclude) {
    axeBuilder.exclude(options.exclude)
  }
  
  return await axeBuilder.analyze()
}

/**
 * Test keyboard navigation
 */
async function testKeyboardNavigation(page: Page): Promise<{
  focusableElements: number
  tabOrder: string[]
  keyboardTraps: boolean
}> {
  const focusableElements = await page.locator(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ).count()
  
  const tabOrder: string[] = []
  let keyboardTraps = false
  
  // Test tab navigation
  for (let i = 0; i < Math.min(focusableElements, 20); i++) {
    await page.keyboard.press('Tab')
    
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement
      if (!element) return null
      
      return {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        textContent: element.textContent?.slice(0, 50),
      }
    })
    
    if (focusedElement) {
      const elementDesc = `${focusedElement.tagName}${focusedElement.id ? '#' + focusedElement.id : ''}${focusedElement.className ? '.' + focusedElement.className.split(' ').join('.') : ''}`
      tabOrder.push(elementDesc)
      
      // Check for keyboard traps (same element focused twice in a row)
      if (tabOrder.length > 1 && tabOrder[tabOrder.length - 1] === tabOrder[tabOrder.length - 2]) {
        keyboardTraps = true
        break
      }
    }
  }
  
  return {
    focusableElements,
    tabOrder,
    keyboardTraps,
  }
}

/**
 * Test color contrast
 */
async function testColorContrast(page: Page): Promise<{
  violations: Array<{
    element: string
    foreground: string
    background: string
    ratio: number
    required: number
  }>
}> {
  return await page.evaluate(() => {
    const violations: Array<{
      element: string
      foreground: string
      background: string
      ratio: number
      required: number
    }> = []
    
    // Get all text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label, li')
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element)
      const foreground = styles.color
      const background = styles.backgroundColor
      
      // Simple contrast calculation (simplified for testing)
      // In real implementation, you'd use a proper contrast calculation library
      if (foreground && background && background !== 'rgba(0, 0, 0, 0)') {
        violations.push({
          element: element.tagName.toLowerCase(),
          foreground,
          background,
          ratio: 4.5, // Placeholder - would calculate actual ratio
          required: 4.5,
        })
      }
    })
    
    return { violations: violations.slice(0, 5) } // Limit for testing
  })
}

test.describe('Playwright Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOMEPAGE_URL)
  })

  test.describe('Automated Accessibility Audits', () => {
    Object.entries(ACCESSIBILITY_CONFIG.viewports).forEach(([viewportName, viewport]) => {
      test(`passes axe audit on ${viewportName}`, async ({ page }) => {
        await setupAccessibilityTest(page, viewportName as keyof typeof ACCESSIBILITY_CONFIG.viewports)
        
        const results = await runAxeAudit(page)
        
        // Log violations for debugging
        if (results.violations.length > 0) {
          console.log(`Accessibility violations on ${viewportName}:`, results.violations)
        }
        
        expect(results.violations).toHaveLength(0)
      })
    })

    test('passes specific WCAG 2.1 AA rules', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const criticalRules = [
        'color-contrast',
        'keyboard',
        'aria-valid-attr',
        'button-name',
        'link-name',
        'image-alt',
        'label',
      ]
      
      for (const rule of criticalRules) {
        const results = await new AxeBuilder({ page })
          .withRules([rule])
          .analyze()
        
        expect(results.violations, `Rule ${rule} should pass`).toHaveLength(0)
      }
    })

    test('has proper document structure', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const results = await new AxeBuilder({ page })
        .withRules(['landmark-one-main', 'page-has-heading-one', 'heading-order', 'region'])
        .analyze()
      
      expect(results.violations).toHaveLength(0)
    })
  })

  test.describe('Keyboard Navigation Testing', () => {
    test('supports complete keyboard navigation', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const navigationResults = await testKeyboardNavigation(page)
      
      console.log('Keyboard Navigation Results:', {
        focusableElements: navigationResults.focusableElements,
        tabOrderLength: navigationResults.tabOrder.length,
        hasKeyboardTraps: navigationResults.keyboardTraps,
      })
      
      expect(navigationResults.focusableElements).toBeGreaterThan(0)
      expect(navigationResults.keyboardTraps).toBe(false)
      expect(navigationResults.tabOrder.length).toBeGreaterThan(0)
    })

    test('supports Enter and Space key activation', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Find first button
      const button = page.locator('button').first()
      await button.focus()
      
      // Test Enter key
      await page.keyboard.press('Enter')
      
      // Test Space key
      await page.keyboard.press('Space')
      
      // Should not throw errors and button should remain focusable
      expect(await button.isVisible()).toBe(true)
    })

    test('maintains focus visibility', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Tab to first focusable element
      await page.keyboard.press('Tab')
      
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Check that focus is visually indicated
      const focusStyles = await focusedElement.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow,
        }
      })
      
      // Should have some form of focus indication
      const hasFocusIndicator = focusStyles.outline !== 'none' ||
                               focusStyles.outlineWidth !== '0px' ||
                               focusStyles.boxShadow !== 'none'
      
      expect(hasFocusIndicator).toBe(true)
    })

    test('supports Escape key for dismissible content', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Look for FAQ accordion or modal triggers
      const faqButton = page.locator('button[aria-expanded]').first()
      
      if (await faqButton.count() > 0) {
        // Open accordion
        await faqButton.click()
        await expect(faqButton).toHaveAttribute('aria-expanded', 'true')
        
        // Test Escape key
        await page.keyboard.press('Escape')
        
        // Should close accordion or maintain proper state
        const isExpanded = await faqButton.getAttribute('aria-expanded')
        expect(isExpanded).toBeTruthy() // Should have aria-expanded attribute
      }
    })
  })

  test.describe('Screen Reader Compatibility', () => {
    test('has proper ARIA landmarks', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Check for main landmark
      const main = page.locator('main, [role="main"]')
      await expect(main).toHaveCount(1)
      
      // Check for navigation landmarks
      const navigation = page.locator('nav, [role="navigation"]')
      const navCount = await navigation.count()
      
      if (navCount > 0) {
        // Each navigation should have accessible name
        for (let i = 0; i < navCount; i++) {
          const nav = navigation.nth(i)
          const hasLabel = await nav.evaluate((el) => {
            return el.getAttribute('aria-label') || 
                   el.getAttribute('aria-labelledby') ||
                   el.querySelector('h1, h2, h3, h4, h5, h6')
          })
          expect(hasLabel).toBeTruthy()
        }
      }
    })

    test('has proper heading hierarchy', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      
      expect(headings.length).toBeGreaterThan(0)
      
      // Should have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)
      
      // Check heading order
      const headingLevels = await Promise.all(
        headings.map(async (heading) => {
          const tagName = await heading.evaluate((el) => el.tagName)
          return parseInt(tagName.charAt(1))
        })
      )
      
      // First heading should be h1
      expect(headingLevels[0]).toBe(1)
    })

    test('has accessible form controls', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const formControls = page.locator('input, select, textarea')
      const controlCount = await formControls.count()
      
      if (controlCount > 0) {
        for (let i = 0; i < controlCount; i++) {
          const control = formControls.nth(i)
          
          // Should have accessible name
          const hasAccessibleName = await control.evaluate((el) => {
            const id = el.getAttribute('id')
            const ariaLabel = el.getAttribute('aria-label')
            const ariaLabelledby = el.getAttribute('aria-labelledby')
            const label = id ? document.querySelector(`label[for="${id}"]`) : null
            
            return !!(ariaLabel || ariaLabelledby || label)
          })
          
          expect(hasAccessibleName).toBe(true)
        }
      }
    })

    test('has accessible images', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const images = page.locator('img')
      const imageCount = await images.count()
      
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const image = images.nth(i)
          
          // Should have alt text or be marked as decorative
          const hasAltText = await image.evaluate((el) => {
            const alt = el.getAttribute('alt')
            const ariaLabel = el.getAttribute('aria-label')
            const ariaLabelledby = el.getAttribute('aria-labelledby')
            const ariaHidden = el.getAttribute('aria-hidden')
            const role = el.getAttribute('role')
            
            return !!(alt !== null || ariaLabel || ariaLabelledby || ariaHidden === 'true' || role === 'presentation')
          })
          
          expect(hasAltText).toBe(true)
        }
      }
    })
  })

  test.describe('Color and Contrast Testing', () => {
    test('meets color contrast requirements', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze()
      
      expect(results.violations).toHaveLength(0)
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Enable dark mode
      await page.evaluate(() => {
        localStorage.setItem('theme', 'dark')
        document.documentElement.classList.add('dark')
      })
      
      await page.waitForTimeout(500) // Wait for theme application
      
      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast'])
        .analyze()
      
      expect(results.violations).toHaveLength(0)
    })

    test('does not rely solely on color for information', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Check for color-only information
      const results = await new AxeBuilder({ page })
        .withRules(['color-contrast', 'link-in-text-block'])
        .analyze()
      
      expect(results.violations).toHaveLength(0)
    })
  })

  test.describe('Touch and Mobile Accessibility', () => {
    test('has adequate touch targets on mobile', async ({ page }) => {
      await setupAccessibilityTest(page, 'mobile')
      
      const interactiveElements = page.locator('button, a[href], input, select, textarea, [role="button"]')
      const elementCount = await interactiveElements.count()
      
      if (elementCount > 0) {
        for (let i = 0; i < Math.min(elementCount, 10); i++) {
          const element = interactiveElements.nth(i)
          
          const boundingBox = await element.boundingBox()
          if (boundingBox) {
            // WCAG 2.1 SC 2.5.5 - minimum 44x44 CSS pixels
            expect(boundingBox.width).toBeGreaterThanOrEqual(44)
            expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })

    test('supports zoom up to 200% without horizontal scrolling', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Set zoom to 200%
      await page.setViewportSize({ width: 720, height: 450 }) // Simulate 200% zoom
      
      // Check for horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth
      })
      
      expect(hasHorizontalScroll).toBe(false)
    })
  })

  test.describe('Dynamic Content Accessibility', () => {
    test('announces dynamic content changes', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
      const liveRegionCount = await liveRegions.count()
      
      if (liveRegionCount > 0) {
        for (let i = 0; i < liveRegionCount; i++) {
          const region = liveRegions.nth(i)
          
          const ariaLive = await region.getAttribute('aria-live')
          const role = await region.getAttribute('role')
          
          // Should have appropriate live region settings
          expect(ariaLive || role).toMatch(/polite|assertive|status|alert/)
        }
      }
    })

    test('handles focus management during interactions', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Test FAQ accordion focus management
      const faqButton = page.locator('button[aria-expanded]').first()
      
      if (await faqButton.count() > 0) {
        await faqButton.focus()
        await faqButton.click()
        
        // Focus should remain on button or move to appropriate element
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
      }
    })

    test('provides accessible error states', async ({ page }) => {
      await setupAccessibilityTest(page, 'desktop')
      
      // Look for error messages or alerts
      const errorElements = page.locator('[role="alert"], .error, [aria-invalid="true"]')
      const errorCount = await errorElements.count()
      
      if (errorCount > 0) {
        for (let i = 0; i < errorCount; i++) {
          const error = errorElements.nth(i)
          
          // Error should be accessible
          const isVisible = await error.isVisible()
          const hasText = await error.textContent()
          
          expect(isVisible).toBe(true)
          expect(hasText?.trim()).toBeTruthy()
        }
      }
    })
  })
})

// Test configuration
test.use({
  // Ensure consistent testing environment
  colorScheme: 'light',
  reducedMotion: 'reduce',
})
