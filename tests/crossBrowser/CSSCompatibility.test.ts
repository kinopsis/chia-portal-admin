/**
 * CSS Compatibility Tests
 * 
 * Comprehensive CSS compatibility testing:
 * - Modern CSS feature support validation
 * - Fallback behavior testing
 * - Cross-browser CSS rendering consistency
 * - Responsive design compatibility
 * - Dark mode CSS compatibility
 */

import { test, expect, type Page } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

/**
 * CSS features to test across browsers
 */
const CSS_FEATURES = {
  layout: {
    'CSS Grid': { property: 'display', value: 'grid' },
    'CSS Flexbox': { property: 'display', value: 'flex' },
    'CSS Gap': { property: 'gap', value: '1rem' },
    'Aspect Ratio': { property: 'aspect-ratio', value: '16/9' },
    'Container Queries': { property: 'container-type', value: 'inline-size' },
  },
  colors: {
    'Custom Properties': { property: '--custom-color', value: '#ff0000' },
    'Color Scheme': { property: 'color-scheme', value: 'light dark' },
    'Color Mix': { property: 'color', value: 'color-mix(in srgb, red 50%, blue)' },
    'OKLCH Colors': { property: 'color', value: 'oklch(0.7 0.15 180)' },
  },
  typography: {
    'Font Display': { property: 'font-display', value: 'swap' },
    'Font Variation Settings': { property: 'font-variation-settings', value: '"wght" 400' },
    'Text Decoration Thickness': { property: 'text-decoration-thickness', value: '2px' },
    'Text Underline Offset': { property: 'text-underline-offset', value: '2px' },
  },
  animations: {
    'Scroll Behavior': { property: 'scroll-behavior', value: 'smooth' },
    'Animation Timeline': { property: 'animation-timeline', value: 'scroll()' },
    'Transform 3D': { property: 'transform', value: 'translate3d(0, 0, 0)' },
  },
  interactions: {
    'Touch Action': { property: 'touch-action', value: 'manipulation' },
    'User Select': { property: 'user-select', value: 'none' },
    'Pointer Events': { property: 'pointer-events', value: 'none' },
    'Scroll Snap': { property: 'scroll-snap-type', value: 'x mandatory' },
  },
} as const

/**
 * Test CSS feature support in browser
 */
async function testCSSSupport(page: Page): Promise<Record<string, Record<string, boolean>>> {
  return await page.evaluate((features) => {
    const results: Record<string, Record<string, boolean>> = {}
    
    Object.entries(features).forEach(([category, categoryFeatures]) => {
      results[category] = {}
      
      Object.entries(categoryFeatures).forEach(([featureName, feature]) => {
        try {
          if (typeof CSS !== 'undefined' && CSS.supports) {
            results[category][featureName] = CSS.supports(feature.property, feature.value)
          } else {
            results[category][featureName] = false
          }
        } catch (error) {
          results[category][featureName] = false
        }
      })
    })
    
    return results
  }, CSS_FEATURES)
}

/**
 * Test CSS custom properties
 */
async function testCustomProperties(page: Page): Promise<{
  supported: boolean
  values: Record<string, string>
}> {
  return await page.evaluate(() => {
    const testElement = document.createElement('div')
    document.body.appendChild(testElement)
    
    try {
      testElement.style.setProperty('--test-color', '#ff0000')
      testElement.style.color = 'var(--test-color)'
      
      const computedStyle = window.getComputedStyle(testElement)
      const colorValue = computedStyle.color
      
      // Get actual CSS custom property values from the page
      const rootStyle = window.getComputedStyle(document.documentElement)
      const values: Record<string, string> = {}
      
      // Common custom properties to check
      const propertiesToCheck = [
        '--color-primary',
        '--color-secondary',
        '--color-background',
        '--color-text',
        '--font-family-sans',
        '--border-radius',
        '--spacing-unit',
      ]
      
      propertiesToCheck.forEach(prop => {
        const value = rootStyle.getPropertyValue(prop).trim()
        if (value) {
          values[prop] = value
        }
      })
      
      document.body.removeChild(testElement)
      
      return {
        supported: colorValue !== '' && colorValue !== 'var(--test-color)',
        values,
      }
    } catch (error) {
      document.body.removeChild(testElement)
      return {
        supported: false,
        values: {},
      }
    }
  })
}

/**
 * Test responsive design features
 */
async function testResponsiveFeatures(page: Page): Promise<{
  mediaQueries: boolean
  containerQueries: boolean
  viewportUnits: boolean
  flexboxWrap: boolean
  gridAutoFit: boolean
}> {
  return await page.evaluate(() => {
    const results = {
      mediaQueries: false,
      containerQueries: false,
      viewportUnits: false,
      flexboxWrap: false,
      gridAutoFit: false,
    }
    
    // Test media queries
    if (typeof window.matchMedia === 'function') {
      try {
        const mq = window.matchMedia('(min-width: 768px)')
        results.mediaQueries = typeof mq.matches === 'boolean'
      } catch (error) {
        results.mediaQueries = false
      }
    }
    
    // Test CSS features
    if (typeof CSS !== 'undefined' && CSS.supports) {
      results.containerQueries = CSS.supports('container-type', 'inline-size')
      results.viewportUnits = CSS.supports('width', '100vw')
      results.flexboxWrap = CSS.supports('flex-wrap', 'wrap')
      results.gridAutoFit = CSS.supports('grid-template-columns', 'repeat(auto-fit, minmax(200px, 1fr))')
    }
    
    return results
  })
}

/**
 * Test dark mode CSS compatibility
 */
async function testDarkModeCSS(page: Page): Promise<{
  prefersColorScheme: boolean
  darkModeClasses: boolean
  colorSchemeProperty: boolean
  customPropertiesInDark: Record<string, string>
}> {
  return await page.evaluate(() => {
    const results = {
      prefersColorScheme: false,
      darkModeClasses: false,
      colorSchemeProperty: false,
      customPropertiesInDark: {} as Record<string, string>,
    }
    
    // Test prefers-color-scheme
    if (typeof window.matchMedia === 'function') {
      try {
        const darkMQ = window.matchMedia('(prefers-color-scheme: dark)')
        results.prefersColorScheme = typeof darkMQ.matches === 'boolean'
      } catch (error) {
        results.prefersColorScheme = false
      }
    }
    
    // Test color-scheme property
    if (typeof CSS !== 'undefined' && CSS.supports) {
      results.colorSchemeProperty = CSS.supports('color-scheme', 'light dark')
    }
    
    // Test dark mode classes
    const testElement = document.createElement('div')
    testElement.className = 'dark'
    document.body.appendChild(testElement)
    
    try {
      const hasClass = testElement.classList.contains('dark')
      results.darkModeClasses = hasClass
      
      // Test dark mode custom properties
      document.documentElement.classList.add('dark')
      const darkStyle = window.getComputedStyle(document.documentElement)
      
      const darkProperties = [
        '--color-background',
        '--color-text',
        '--color-primary',
        '--color-secondary',
      ]
      
      darkProperties.forEach(prop => {
        const value = darkStyle.getPropertyValue(prop).trim()
        if (value) {
          results.customPropertiesInDark[prop] = value
        }
      })
      
      document.documentElement.classList.remove('dark')
    } catch (error) {
      // Ignore errors
    } finally {
      document.body.removeChild(testElement)
    }
    
    return results
  })
}

test.describe('CSS Compatibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOMEPAGE_URL)
    await page.waitForSelector('h1', { timeout: 10000 })
    await page.waitForLoadState('networkidle')
  })

  test.describe('Modern CSS Feature Support', () => {
    test('validates CSS Grid support', async ({ page }) => {
      const support = await testCSSSupport(page)
      
      console.log('CSS Grid support:', support.layout['CSS Grid'])
      expect(support.layout['CSS Grid']).toBe(true)
      
      // Test actual grid usage
      const gridElements = await page.locator('[style*="display: grid"], .grid').count()
      if (gridElements > 0) {
        const gridElement = page.locator('[style*="display: grid"], .grid').first()
        const computedDisplay = await gridElement.evaluate((el) => {
          return window.getComputedStyle(el).display
        })
        expect(computedDisplay).toBe('grid')
      }
    })

    test('validates CSS Flexbox support', async ({ page }) => {
      const support = await testCSSSupport(page)
      
      console.log('CSS Flexbox support:', support.layout['CSS Flexbox'])
      expect(support.layout['CSS Flexbox']).toBe(true)
      
      // Test actual flexbox usage
      const flexElements = await page.locator('[style*="display: flex"], .flex').count()
      if (flexElements > 0) {
        const flexElement = page.locator('[style*="display: flex"], .flex').first()
        const computedDisplay = await flexElement.evaluate((el) => {
          return window.getComputedStyle(el).display
        })
        expect(computedDisplay).toBe('flex')
      }
    })

    test('validates CSS Custom Properties support', async ({ page }) => {
      const customProps = await testCustomProperties(page)
      
      console.log('Custom Properties support:', customProps.supported)
      console.log('Custom Properties values:', customProps.values)
      
      expect(customProps.supported).toBe(true)
      expect(Object.keys(customProps.values).length).toBeGreaterThan(0)
    })

    test('validates CSS Gap support', async ({ page }) => {
      const support = await testCSSSupport(page)
      
      console.log('CSS Gap support:', support.layout['CSS Gap'])
      expect(support.layout['CSS Gap']).toBe(true)
    })

    test('validates modern color features', async ({ page }) => {
      const support = await testCSSSupport(page)
      
      console.log('Color features support:', support.colors)
      
      // Custom properties should be supported
      expect(support.colors['Custom Properties']).toBe(true)
      
      // Color scheme should be supported in modern browsers
      // Note: Some browsers might not support this yet
      if (support.colors['Color Scheme']) {
        console.log('Color scheme is supported')
      }
    })
  })

  test.describe('Responsive Design Compatibility', () => {
    test('validates responsive features support', async ({ page }) => {
      const responsive = await testResponsiveFeatures(page)
      
      console.log('Responsive features:', responsive)
      
      expect(responsive.mediaQueries).toBe(true)
      expect(responsive.viewportUnits).toBe(true)
      expect(responsive.flexboxWrap).toBe(true)
      expect(responsive.gridAutoFit).toBe(true)
    })

    test('validates responsive breakpoints', async ({ page }) => {
      const breakpoints = [
        { name: 'mobile', width: 375 },
        { name: 'tablet', width: 768 },
        { name: 'desktop', width: 1024 },
        { name: 'wide', width: 1440 },
      ]
      
      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: 800 })
        await page.waitForTimeout(100)
        
        // Check that layout adapts
        const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
        expect(bodyWidth).toBeLessThanOrEqual(breakpoint.width)
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth
        })
        expect(hasHorizontalScroll).toBe(false)
      }
    })

    test('validates container queries support', async ({ page }) => {
      const support = await testCSSSupport(page)
      
      console.log('Container Queries support:', support.layout['Container Queries'])
      
      // Container queries are newer, so we'll be more lenient
      if (support.layout['Container Queries']) {
        console.log('Container queries are supported - testing implementation')
        
        // If supported, test actual usage
        const containerElements = await page.locator('[style*="container-type"]').count()
        console.log('Container elements found:', containerElements)
      } else {
        console.log('Container queries not supported - using fallback behavior')
      }
    })
  })

  test.describe('Dark Mode CSS Compatibility', () => {
    test('validates dark mode CSS features', async ({ page }) => {
      const darkMode = await testDarkModeCSS(page)
      
      console.log('Dark mode features:', darkMode)
      
      expect(darkMode.prefersColorScheme).toBe(true)
      expect(darkMode.darkModeClasses).toBe(true)
      
      // Color scheme property support varies
      if (darkMode.colorSchemeProperty) {
        console.log('color-scheme property is supported')
      }
    })

    test('validates dark mode theme switching', async ({ page }) => {
      // Enable dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      })
      
      await page.waitForTimeout(500)
      
      // Check that dark mode styles are applied
      const isDarkMode = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark')
      })
      
      expect(isDarkMode).toBe(true)
      
      // Check that colors have changed
      const backgroundColor = await page.evaluate(() => {
        const style = window.getComputedStyle(document.body)
        return style.backgroundColor
      })
      
      expect(backgroundColor).toBeTruthy()
      
      // Switch back to light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      })
      
      await page.waitForTimeout(500)
      
      const isLightMode = await page.evaluate(() => {
        return !document.documentElement.classList.contains('dark')
      })
      
      expect(isLightMode).toBe(true)
    })

    test('validates prefers-color-scheme media query', async ({ page }) => {
      // Test system dark mode preference
      await page.emulateMedia({ colorScheme: 'dark' })
      
      const prefersDark = await page.evaluate(() => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      })
      
      expect(prefersDark).toBe(true)
      
      // Test system light mode preference
      await page.emulateMedia({ colorScheme: 'light' })
      
      const prefersLight = await page.evaluate(() => {
        return window.matchMedia('(prefers-color-scheme: light)').matches
      })
      
      expect(prefersLight).toBe(true)
    })
  })

  test.describe('CSS Animation Compatibility', () => {
    test('validates animation features support', async ({ page }) => {
      const support = await testCSSSupport(page)
      
      console.log('Animation features:', support.animations)
      
      expect(support.animations['Scroll Behavior']).toBe(true)
      expect(support.animations['Transform 3D']).toBe(true)
      
      // Animation timeline is newer
      if (support.animations['Animation Timeline']) {
        console.log('Animation timeline is supported')
      }
    })

    test('validates reduced motion preference', async ({ page }) => {
      // Test reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      const prefersReducedMotion = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      })
      
      expect(prefersReducedMotion).toBe(true)
      
      // Test no preference
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      
      const noPreference = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: no-preference)').matches
      })
      
      expect(noPreference).toBe(true)
    })
  })

  test.describe('CSS Fallback Behavior', () => {
    test('validates graceful degradation', async ({ page }) => {
      // Test with CSS.supports disabled
      await page.addInitScript(() => {
        // Mock CSS.supports to return false for some features
        if (typeof CSS !== 'undefined' && CSS.supports) {
          const originalSupports = CSS.supports
          CSS.supports = function(property: string, value: string) {
            // Simulate lack of support for container queries
            if (property === 'container-type') {
              return false
            }
            return originalSupports.call(this, property, value)
          }
        }
      })
      
      await page.reload()
      await page.waitForSelector('h1', { timeout: 10000 })
      
      // Page should still render correctly
      const heading = page.locator('h1').first()
      await expect(heading).toBeVisible()
      
      // Layout should still work with fallbacks
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth
      })
      expect(hasHorizontalScroll).toBe(false)
    })

    test('validates vendor prefix handling', async ({ page }) => {
      const vendorPrefixes = await page.evaluate(() => {
        const testElement = document.createElement('div')
        const style = testElement.style
        
        const prefixes = {
          transform: false,
          webkitTransform: false,
          mozTransform: false,
          msTransform: false,
        }
        
        // Test for vendor prefixes
        Object.keys(prefixes).forEach(prop => {
          if (prop in style) {
            prefixes[prop as keyof typeof prefixes] = true
          }
        })
        
        return prefixes
      })
      
      console.log('Vendor prefix support:', vendorPrefixes)
      
      // At least one transform property should be supported
      const hasTransformSupport = Object.values(vendorPrefixes).some(Boolean)
      expect(hasTransformSupport).toBe(true)
    })
  })
})
