/**
 * Cross-Browser Testing Utilities
 * 
 * Utilities for comprehensive cross-browser compatibility testing:
 * - Browser detection and feature support
 * - CSS property compatibility validation
 * - JavaScript API availability testing
 * - Rendering consistency verification
 * - Performance comparison across browsers
 */

/**
 * Supported browsers and their configurations
 */
export const BROWSER_CONFIGS = {
  chromium: {
    name: 'Chromium',
    engine: 'Blink',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: {
      webp: true,
      avif: true,
      css: {
        grid: true,
        flexbox: true,
        customProperties: true,
        containerQueries: true,
        aspectRatio: true,
      },
      javascript: {
        es2020: true,
        modules: true,
        dynamicImport: true,
        optionalChaining: true,
        nullishCoalescing: true,
      },
    },
  },
  firefox: {
    name: 'Firefox',
    engine: 'Gecko',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    features: {
      webp: true,
      avif: true,
      css: {
        grid: true,
        flexbox: true,
        customProperties: true,
        containerQueries: true,
        aspectRatio: true,
      },
      javascript: {
        es2020: true,
        modules: true,
        dynamicImport: true,
        optionalChaining: true,
        nullishCoalescing: true,
      },
    },
  },
  webkit: {
    name: 'Safari',
    engine: 'WebKit',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    features: {
      webp: true,
      avif: false, // Limited support
      css: {
        grid: true,
        flexbox: true,
        customProperties: true,
        containerQueries: false, // Limited support
        aspectRatio: true,
      },
      javascript: {
        es2020: true,
        modules: true,
        dynamicImport: true,
        optionalChaining: true,
        nullishCoalescing: true,
      },
    },
  },
} as const

/**
 * Viewport configurations for cross-browser testing
 */
export const CROSS_BROWSER_VIEWPORTS = {
  mobile: {
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  tablet: {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true,
  },
  desktop: {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  ultrawide: {
    width: 2560,
    height: 1440,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
} as const

/**
 * CSS features to test across browsers
 */
export const CSS_FEATURES_TO_TEST = {
  layout: [
    'display: grid',
    'display: flex',
    'gap',
    'aspect-ratio',
    'container-type',
    'container-name',
  ],
  colors: [
    'color-scheme',
    'prefers-color-scheme',
    'color-mix()',
    'oklch()',
    'color()',
  ],
  typography: [
    'font-display',
    'font-variation-settings',
    'text-decoration-thickness',
    'text-underline-offset',
  ],
  animations: [
    'animation-timeline',
    'animation-range',
    'scroll-behavior',
    'prefers-reduced-motion',
  ],
  interactions: [
    'touch-action',
    'pointer-events',
    'user-select',
    'scroll-snap-type',
  ],
} as const

/**
 * JavaScript APIs to test across browsers
 */
export const JS_APIS_TO_TEST = {
  storage: [
    'localStorage',
    'sessionStorage',
    'indexedDB',
  ],
  performance: [
    'PerformanceObserver',
    'IntersectionObserver',
    'ResizeObserver',
    'MutationObserver',
  ],
  media: [
    'matchMedia',
    'MediaQueryList',
    'screen.orientation',
  ],
  modern: [
    'fetch',
    'Promise',
    'async/await',
    'modules',
    'WeakMap',
    'WeakSet',
  ],
} as const

/**
 * Detect browser capabilities
 */
export const detectBrowserCapabilities = async (): Promise<{
  browser: string
  version: string
  engine: string
  features: {
    css: Record<string, boolean>
    javascript: Record<string, boolean>
    media: Record<string, boolean>
  }
}> => {
  if (typeof window === 'undefined') {
    return {
      browser: 'unknown',
      version: 'unknown',
      engine: 'unknown',
      features: { css: {}, javascript: {}, media: {} },
    }
  }

  const userAgent = navigator.userAgent
  let browser = 'unknown'
  let version = 'unknown'
  let engine = 'unknown'

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome'
    engine = 'Blink'
    const match = userAgent.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'unknown'
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox'
    engine = 'Gecko'
    const match = userAgent.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'unknown'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
    engine = 'WebKit'
    const match = userAgent.match(/Version\/(\d+)/)
    version = match ? match[1] : 'unknown'
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge'
    engine = 'Blink'
    const match = userAgent.match(/Edg\/(\d+)/)
    version = match ? match[1] : 'unknown'
  }

  // Test CSS features
  const cssFeatures: Record<string, boolean> = {}
  const testElement = document.createElement('div')
  
  // Test CSS Grid
  cssFeatures.grid = CSS.supports('display', 'grid')
  
  // Test CSS Flexbox
  cssFeatures.flexbox = CSS.supports('display', 'flex')
  
  // Test CSS Custom Properties
  cssFeatures.customProperties = CSS.supports('--test', 'value')
  
  // Test CSS Container Queries
  cssFeatures.containerQueries = CSS.supports('container-type', 'inline-size')
  
  // Test CSS aspect-ratio
  cssFeatures.aspectRatio = CSS.supports('aspect-ratio', '1/1')
  
  // Test CSS gap
  cssFeatures.gap = CSS.supports('gap', '1rem')

  // Test JavaScript features
  const jsFeatures: Record<string, boolean> = {}
  
  jsFeatures.es2020 = typeof globalThis !== 'undefined'
  jsFeatures.modules = 'noModule' in document.createElement('script')
  jsFeatures.dynamicImport = typeof import === 'function'
  jsFeatures.optionalChaining = true // Assume true if code is running
  jsFeatures.nullishCoalescing = true // Assume true if code is running
  jsFeatures.intersectionObserver = 'IntersectionObserver' in window
  jsFeatures.resizeObserver = 'ResizeObserver' in window
  jsFeatures.performanceObserver = 'PerformanceObserver' in window

  // Test media features
  const mediaFeatures: Record<string, boolean> = {}
  
  mediaFeatures.matchMedia = 'matchMedia' in window
  mediaFeatures.webp = await testImageFormat('webp')
  mediaFeatures.avif = await testImageFormat('avif')
  mediaFeatures.touchEvents = 'ontouchstart' in window
  mediaFeatures.pointerEvents = 'onpointerdown' in window

  return {
    browser,
    version,
    engine,
    features: {
      css: cssFeatures,
      javascript: jsFeatures,
      media: mediaFeatures,
    },
  }
}

/**
 * Test image format support
 */
const testImageFormat = (format: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    
    const testImages = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    }
    
    img.src = testImages[format as keyof typeof testImages] || ''
  })
}

/**
 * Compare rendering across browsers
 */
export const compareRendering = async (element: HTMLElement): Promise<{
  dimensions: { width: number; height: number }
  styles: Record<string, string>
  layout: {
    position: DOMRect
    children: Array<{ tag: string; position: DOMRect }>
  }
}> => {
  const rect = element.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(element)
  
  // Extract key style properties
  const styles: Record<string, string> = {}
  const importantProperties = [
    'display',
    'position',
    'width',
    'height',
    'margin',
    'padding',
    'border',
    'background',
    'color',
    'font-family',
    'font-size',
    'line-height',
    'text-align',
    'flex-direction',
    'justify-content',
    'align-items',
    'grid-template-columns',
    'grid-template-rows',
    'gap',
  ]
  
  importantProperties.forEach(prop => {
    styles[prop] = computedStyle.getPropertyValue(prop)
  })
  
  // Get children layout
  const children = Array.from(element.children).map(child => ({
    tag: child.tagName.toLowerCase(),
    position: child.getBoundingClientRect(),
  }))
  
  return {
    dimensions: {
      width: rect.width,
      height: rect.height,
    },
    styles,
    layout: {
      position: rect,
      children,
    },
  }
}

/**
 * Test CSS feature support
 */
export const testCSSFeatureSupport = (feature: string, value: string): boolean => {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false
  }
  
  try {
    return CSS.supports(feature, value)
  } catch (error) {
    return false
  }
}

/**
 * Test JavaScript API availability
 */
export const testJSAPIAvailability = (api: string): boolean => {
  try {
    const parts = api.split('.')
    let current: any = window
    
    for (const part of parts) {
      if (!(part in current)) {
        return false
      }
      current = current[part]
    }
    
    return true
  } catch (error) {
    return false
  }
}

/**
 * Measure performance across browsers
 */
export const measurePerformance = async (testFn: () => void | Promise<void>): Promise<{
  duration: number
  memory?: {
    used: number
    total: number
  }
}> => {
  const startTime = performance.now()
  let startMemory: any = null
  
  // Get initial memory if available
  if ('memory' in performance) {
    startMemory = (performance as any).memory.usedJSHeapSize
  }
  
  await testFn()
  
  const endTime = performance.now()
  let endMemory: any = null
  
  // Get final memory if available
  if ('memory' in performance) {
    endMemory = (performance as any).memory.usedJSHeapSize
  }
  
  const result: any = {
    duration: endTime - startTime,
  }
  
  if (startMemory !== null && endMemory !== null) {
    result.memory = {
      used: endMemory - startMemory,
      total: endMemory,
    }
  }
  
  return result
}

/**
 * Create cross-browser test matrix
 */
export const createTestMatrix = () => {
  const browsers = Object.keys(BROWSER_CONFIGS)
  const viewports = Object.keys(CROSS_BROWSER_VIEWPORTS)
  
  const matrix: Array<{
    browser: string
    viewport: string
    config: any
  }> = []
  
  browsers.forEach(browser => {
    viewports.forEach(viewport => {
      matrix.push({
        browser,
        viewport,
        config: {
          browser: BROWSER_CONFIGS[browser as keyof typeof BROWSER_CONFIGS],
          viewport: CROSS_BROWSER_VIEWPORTS[viewport as keyof typeof CROSS_BROWSER_VIEWPORTS],
        },
      })
    })
  })
  
  return matrix
}

/**
 * Validate cross-browser consistency
 */
export const validateConsistency = (
  results: Array<{ browser: string; data: any }>
): {
  isConsistent: boolean
  differences: Array<{
    browsers: string[]
    property: string
    values: any[]
  }>
} => {
  const differences: Array<{
    browsers: string[]
    property: string
    values: any[]
  }> = []
  
  if (results.length < 2) {
    return { isConsistent: true, differences: [] }
  }
  
  // Compare key properties across browsers
  const baseResult = results[0]
  const propertiesToCompare = ['dimensions', 'layout', 'performance']
  
  propertiesToCompare.forEach(property => {
    const values = results.map(result => result.data[property])
    const uniqueValues = [...new Set(values.map(v => JSON.stringify(v)))]
    
    if (uniqueValues.length > 1) {
      differences.push({
        browsers: results.map(r => r.browser),
        property,
        values,
      })
    }
  })
  
  return {
    isConsistent: differences.length === 0,
    differences,
  }
}

/**
 * Generate browser compatibility report
 */
export const generateCompatibilityReport = (
  testResults: Record<string, any>
): {
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    compatibilityScore: number
  }
  browserResults: Record<string, {
    score: number
    issues: string[]
    features: Record<string, boolean>
  }>
  recommendations: string[]
} => {
  const browsers = Object.keys(testResults)
  const totalTests = browsers.length
  let passedTests = 0
  const browserResults: Record<string, any> = {}
  const recommendations: string[] = []
  
  browsers.forEach(browser => {
    const result = testResults[browser]
    const issues: string[] = []
    let score = 100
    
    // Check for feature support issues
    Object.entries(result.features || {}).forEach(([category, features]: [string, any]) => {
      Object.entries(features).forEach(([feature, supported]: [string, any]) => {
        if (!supported) {
          issues.push(`${category}.${feature} not supported`)
          score -= 5
        }
      })
    })
    
    // Check for performance issues
    if (result.performance && result.performance.duration > 1000) {
      issues.push('Slow performance detected')
      score -= 10
    }
    
    // Check for layout differences
    if (result.layoutDifferences && result.layoutDifferences.length > 0) {
      issues.push('Layout inconsistencies detected')
      score -= 15
    }
    
    browserResults[browser] = {
      score: Math.max(0, score),
      issues,
      features: result.features || {},
    }
    
    if (score >= 80) {
      passedTests++
    }
  })
  
  // Generate recommendations
  if (passedTests < totalTests) {
    recommendations.push('Consider implementing progressive enhancement for unsupported features')
    recommendations.push('Add polyfills for missing JavaScript APIs')
    recommendations.push('Use CSS fallbacks for unsupported properties')
  }
  
  const compatibilityScore = Math.round((passedTests / totalTests) * 100)
  
  return {
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      compatibilityScore,
    },
    browserResults,
    recommendations,
  }
}

export default {
  BROWSER_CONFIGS,
  CROSS_BROWSER_VIEWPORTS,
  CSS_FEATURES_TO_TEST,
  JS_APIS_TO_TEST,
  detectBrowserCapabilities,
  compareRendering,
  testCSSFeatureSupport,
  testJSAPIAvailability,
  measurePerformance,
  createTestMatrix,
  validateConsistency,
  generateCompatibilityReport,
}
