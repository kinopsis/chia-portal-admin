/**
 * Bundle Size and Optimization Tests
 * 
 * Comprehensive testing for:
 * - JavaScript bundle size analysis
 * - CSS bundle optimization
 * - Image optimization validation
 * - Font loading performance
 * - Code splitting effectiveness
 * - Lazy loading implementation
 */

import { test, expect, type Page } from '@playwright/test'
import { PERFORMANCE_BUDGET } from '../utils/performanceTestUtils'

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const HOMEPAGE_URL = `${BASE_URL}/`

/**
 * Analyze network resources loaded by the page
 */
async function analyzeNetworkResources(page: Page): Promise<{
  javascript: { size: number; count: number; files: string[] }
  css: { size: number; count: number; files: string[] }
  images: { size: number; count: number; files: string[] }
  fonts: { size: number; count: number; files: string[] }
  total: { size: number; count: number }
}> {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const analysis = {
      javascript: { size: 0, count: 0, files: [] as string[] },
      css: { size: 0, count: 0, files: [] as string[] },
      images: { size: 0, count: 0, files: [] as string[] },
      fonts: { size: 0, count: 0, files: [] as string[] },
      total: { size: 0, count: 0 },
    }
    
    entries.forEach(entry => {
      const size = entry.transferSize || entry.encodedBodySize || 0
      const url = entry.name
      
      analysis.total.size += size
      analysis.total.count += 1
      
      if (url.includes('.js') || url.includes('javascript')) {
        analysis.javascript.size += size
        analysis.javascript.count += 1
        analysis.javascript.files.push(url)
      } else if (url.includes('.css') || url.includes('stylesheet')) {
        analysis.css.size += size
        analysis.css.count += 1
        analysis.css.files.push(url)
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
        analysis.images.size += size
        analysis.images.count += 1
        analysis.images.files.push(url)
      } else if (url.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
        analysis.fonts.size += size
        analysis.fonts.count += 1
        analysis.fonts.files.push(url)
      }
    })
    
    return analysis
  })
  
  return resources
}

/**
 * Check for lazy loading implementation
 */
async function checkLazyLoading(page: Page): Promise<{
  imagesWithLazyLoading: number
  totalImages: number
  lazyLoadingPercentage: number
}> {
  return await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'))
    const imagesWithLazyLoading = images.filter(img => 
      img.loading === 'lazy' || 
      img.hasAttribute('data-src') ||
      img.classList.contains('lazy')
    ).length
    
    return {
      imagesWithLazyLoading,
      totalImages: images.length,
      lazyLoadingPercentage: images.length > 0 ? (imagesWithLazyLoading / images.length) * 100 : 0,
    }
  })
}

/**
 * Analyze code splitting effectiveness
 */
async function analyzeCodeSplitting(page: Page): Promise<{
  initialChunks: string[]
  lazyChunks: string[]
  totalChunks: number
  codeSplittingRatio: number
}> {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsFiles = entries.filter(entry => 
      entry.name.includes('.js') || entry.name.includes('javascript')
    ).map(entry => entry.name)
    
    return jsFiles
  })
  
  // Analyze chunk patterns (this is simplified - real implementation would be more sophisticated)
  const initialChunks = resources.filter(file => 
    file.includes('main') || 
    file.includes('index') || 
    file.includes('app') ||
    !file.includes('chunk')
  )
  
  const lazyChunks = resources.filter(file => 
    file.includes('chunk') || 
    file.includes('lazy') ||
    file.includes('async')
  )
  
  return {
    initialChunks,
    lazyChunks,
    totalChunks: resources.length,
    codeSplittingRatio: resources.length > 0 ? (lazyChunks.length / resources.length) * 100 : 0,
  }
}

/**
 * Check font loading optimization
 */
async function analyzeFontLoading(page: Page): Promise<{
  fontsWithDisplaySwap: number
  totalFonts: number
  fontDisplayOptimization: number
  preloadedFonts: number
}> {
  return await page.evaluate(() => {
    const fontFaces = Array.from(document.fonts)
    const linkElements = Array.from(document.querySelectorAll('link[rel="preload"][as="font"]'))
    const styleSheets = Array.from(document.styleSheets)
    
    let fontsWithDisplaySwap = 0
    
    // Check for font-display: swap in CSS
    try {
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || [])
          rules.forEach(rule => {
            if (rule instanceof CSSFontFaceRule) {
              const fontDisplay = rule.style.getPropertyValue('font-display')
              if (fontDisplay === 'swap' || fontDisplay === 'fallback' || fontDisplay === 'optional') {
                fontsWithDisplaySwap++
              }
            }
          })
        } catch (e) {
          // Cross-origin stylesheet access might be blocked
        }
      })
    } catch (e) {
      console.warn('Could not analyze font-display properties')
    }
    
    return {
      fontsWithDisplaySwap,
      totalFonts: fontFaces.length,
      fontDisplayOptimization: fontFaces.length > 0 ? (fontsWithDisplaySwap / fontFaces.length) * 100 : 0,
      preloadedFonts: linkElements.length,
    }
  })
}

test.describe('Bundle Size and Optimization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HOMEPAGE_URL)
    await page.waitForLoadState('networkidle')
  })

  test.describe('JavaScript Bundle Analysis', () => {
    test('JavaScript bundle size meets performance budget', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const resources = await analyzeNetworkResources(page)
      
      console.log('JavaScript Analysis:', {
        size: `${(resources.javascript.size / 1024).toFixed(2)} KB`,
        count: resources.javascript.count,
        files: resources.javascript.files.slice(0, 5), // Show first 5 files
      })
      
      // Convert bytes to KB
      const jsSize = resources.javascript.size / 1024
      
      expect(jsSize).toBeLessThanOrEqual(PERFORMANCE_BUDGET.javascript.total)
      expect(resources.javascript.count).toBeGreaterThan(0) // Should have at least some JS
    })

    test('Initial JavaScript bundle is optimized', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('domcontentloaded') // Only wait for initial load
      
      const resources = await analyzeNetworkResources(page)
      const initialJsSize = resources.javascript.size / 1024
      
      console.log(`Initial JavaScript size: ${initialJsSize.toFixed(2)} KB`)
      
      expect(initialJsSize).toBeLessThanOrEqual(PERFORMANCE_BUDGET.javascript.initial)
    })

    test('Code splitting is implemented effectively', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const codeSplitting = await analyzeCodeSplitting(page)
      
      console.log('Code Splitting Analysis:', {
        initialChunks: codeSplitting.initialChunks.length,
        lazyChunks: codeSplitting.lazyChunks.length,
        codeSplittingRatio: `${codeSplitting.codeSplittingRatio.toFixed(1)}%`,
      })
      
      // Should have some level of code splitting
      expect(codeSplitting.totalChunks).toBeGreaterThan(1)
      
      // At least 20% of chunks should be lazy-loaded (if applicable)
      if (codeSplitting.totalChunks > 2) {
        expect(codeSplitting.codeSplittingRatio).toBeGreaterThanOrEqual(20)
      }
    })
  })

  test.describe('CSS Bundle Analysis', () => {
    test('CSS bundle size meets performance budget', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const resources = await analyzeNetworkResources(page)
      
      console.log('CSS Analysis:', {
        size: `${(resources.css.size / 1024).toFixed(2)} KB`,
        count: resources.css.count,
        files: resources.css.files,
      })
      
      const cssSize = resources.css.size / 1024
      
      expect(cssSize).toBeLessThanOrEqual(PERFORMANCE_BUDGET.css.total)
      expect(resources.css.count).toBeGreaterThan(0) // Should have at least some CSS
    })

    test('Critical CSS is inlined or prioritized', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('domcontentloaded')
      
      // Check for inline styles or critical CSS
      const criticalCSS = await page.evaluate(() => {
        const inlineStyles = Array.from(document.querySelectorAll('style')).length
        const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        const preloadCSS = Array.from(document.querySelectorAll('link[rel="preload"][as="style"]')).length
        
        return {
          inlineStyles,
          externalStylesheets: linkElements.length,
          preloadedCSS: preloadCSS,
        }
      })
      
      console.log('Critical CSS Analysis:', criticalCSS)
      
      // Should have some form of CSS optimization
      expect(criticalCSS.inlineStyles + criticalCSS.preloadedCSS).toBeGreaterThan(0)
    })
  })

  test.describe('Image Optimization', () => {
    test('Image sizes meet performance budget', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const resources = await analyzeNetworkResources(page)
      
      console.log('Image Analysis:', {
        totalSize: `${(resources.images.size / 1024).toFixed(2)} KB`,
        count: resources.images.count,
        averageSize: resources.images.count > 0 ? `${(resources.images.size / 1024 / resources.images.count).toFixed(2)} KB` : '0 KB',
      })
      
      const totalImageSize = resources.images.size / 1024
      const averageImageSize = resources.images.count > 0 ? totalImageSize / resources.images.count : 0
      
      expect(totalImageSize).toBeLessThanOrEqual(PERFORMANCE_BUDGET.images.total)
      
      if (resources.images.count > 0) {
        expect(averageImageSize).toBeLessThanOrEqual(PERFORMANCE_BUDGET.images.perImage)
      }
    })

    test('Lazy loading is implemented for images', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const lazyLoading = await checkLazyLoading(page)
      
      console.log('Lazy Loading Analysis:', {
        imagesWithLazyLoading: lazyLoading.imagesWithLazyLoading,
        totalImages: lazyLoading.totalImages,
        percentage: `${lazyLoading.lazyLoadingPercentage.toFixed(1)}%`,
      })
      
      if (lazyLoading.totalImages > 3) {
        // If there are more than 3 images, at least 50% should be lazy-loaded
        expect(lazyLoading.lazyLoadingPercentage).toBeGreaterThanOrEqual(50)
      }
    })

    test('Modern image formats are used', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const imageFormats = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'))
        const formats = {
          webp: 0,
          avif: 0,
          jpeg: 0,
          png: 0,
          svg: 0,
          total: images.length,
        }
        
        images.forEach(img => {
          const src = img.src || img.getAttribute('data-src') || ''
          if (src.includes('.webp')) formats.webp++
          else if (src.includes('.avif')) formats.avif++
          else if (src.includes('.jpg') || src.includes('.jpeg')) formats.jpeg++
          else if (src.includes('.png')) formats.png++
          else if (src.includes('.svg')) formats.svg++
        })
        
        return formats
      })
      
      console.log('Image Formats:', imageFormats)
      
      if (imageFormats.total > 0) {
        const modernFormats = imageFormats.webp + imageFormats.avif + imageFormats.svg
        const modernFormatPercentage = (modernFormats / imageFormats.total) * 100
        
        // At least 30% of images should use modern formats (if applicable)
        if (imageFormats.total > 2) {
          expect(modernFormatPercentage).toBeGreaterThanOrEqual(30)
        }
      }
    })
  })

  test.describe('Font Optimization', () => {
    test('Font loading meets performance budget', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const resources = await analyzeNetworkResources(page)
      
      console.log('Font Analysis:', {
        size: `${(resources.fonts.size / 1024).toFixed(2)} KB`,
        count: resources.fonts.count,
        files: resources.fonts.files,
      })
      
      const fontSize = resources.fonts.size / 1024
      
      expect(fontSize).toBeLessThanOrEqual(PERFORMANCE_BUDGET.fonts.total)
    })

    test('Font loading is optimized', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const fontOptimization = await analyzeFontLoading(page)
      
      console.log('Font Optimization:', {
        fontsWithDisplaySwap: fontOptimization.fontsWithDisplaySwap,
        totalFonts: fontOptimization.totalFonts,
        optimization: `${fontOptimization.fontDisplayOptimization.toFixed(1)}%`,
        preloadedFonts: fontOptimization.preloadedFonts,
      })
      
      // Should have font preloading or display optimization
      if (fontOptimization.totalFonts > 0) {
        expect(fontOptimization.preloadedFonts + fontOptimization.fontsWithDisplaySwap).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Overall Bundle Performance', () => {
    test('Total resource size is reasonable', async ({ page }) => {
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const resources = await analyzeNetworkResources(page)
      
      const totalSize = resources.total.size / 1024 // KB
      const breakdown = {
        javascript: `${(resources.javascript.size / 1024).toFixed(2)} KB`,
        css: `${(resources.css.size / 1024).toFixed(2)} KB`,
        images: `${(resources.images.size / 1024).toFixed(2)} KB`,
        fonts: `${(resources.fonts.size / 1024).toFixed(2)} KB`,
        total: `${totalSize.toFixed(2)} KB`,
      }
      
      console.log('Resource Breakdown:', breakdown)
      
      // Total should be reasonable for a homepage
      expect(totalSize).toBeLessThanOrEqual(2000) // 2MB total budget
      expect(resources.total.count).toBeGreaterThan(0)
    })

    test('Resource loading is efficient', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto(HOMEPAGE_URL)
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      const resources = await analyzeNetworkResources(page)
      
      console.log('Loading Performance:', {
        loadTime: `${loadTime}ms`,
        resourceCount: resources.total.count,
        averageResourceSize: `${(resources.total.size / 1024 / resources.total.count).toFixed(2)} KB`,
      })
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThanOrEqual(PERFORMANCE_BUDGET.loadComplete)
      
      // Should not have excessive number of resources
      expect(resources.total.count).toBeLessThanOrEqual(50) // Reasonable resource count
    })
  })
})
