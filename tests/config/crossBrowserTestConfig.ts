/**
 * Cross-Browser Testing Configuration
 * 
 * Centralized configuration for cross-browser compatibility testing:
 * - Browser specifications and capabilities
 * - Feature support matrices
 * - Compatibility requirements
 * - Testing scenarios and priorities
 * - Fallback strategies
 */

export const CROSS_BROWSER_CONFIG = {
  /**
   * Supported browsers and their configurations
   */
  browsers: {
    chrome: {
      name: 'Google Chrome',
      engine: 'Blink',
      marketShare: 65.0, // Approximate global market share
      priority: 'critical',
      versions: {
        current: '120',
        minimum: '90',
        testing: ['120', '119', '118'],
      },
      userAgents: {
        desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        mobile: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      capabilities: {
        es2020: true,
        webp: true,
        avif: true,
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          containerQueries: true,
          aspectRatio: true,
          colorScheme: true,
        },
        javascript: {
          modules: true,
          dynamicImport: true,
          optionalChaining: true,
          nullishCoalescing: true,
          bigint: true,
        },
        apis: {
          intersectionObserver: true,
          resizeObserver: true,
          performanceObserver: true,
          webAnimations: true,
        },
      },
    },
    
    firefox: {
      name: 'Mozilla Firefox',
      engine: 'Gecko',
      marketShare: 8.0,
      priority: 'high',
      versions: {
        current: '120',
        minimum: '78', // ESR
        testing: ['120', '119', '118'],
      },
      userAgents: {
        desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        mobile: 'Mozilla/5.0 (Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
      },
      capabilities: {
        es2020: true,
        webp: true,
        avif: true,
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          containerQueries: true,
          aspectRatio: true,
          colorScheme: true,
        },
        javascript: {
          modules: true,
          dynamicImport: true,
          optionalChaining: true,
          nullishCoalescing: true,
          bigint: true,
        },
        apis: {
          intersectionObserver: true,
          resizeObserver: true,
          performanceObserver: true,
          webAnimations: true,
        },
      },
    },
    
    safari: {
      name: 'Safari',
      engine: 'WebKit',
      marketShare: 18.0,
      priority: 'critical',
      versions: {
        current: '17',
        minimum: '14',
        testing: ['17', '16.6', '16'],
      },
      userAgents: {
        desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      capabilities: {
        es2020: true,
        webp: true,
        avif: false, // Limited support
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          containerQueries: false, // Limited support
          aspectRatio: true,
          colorScheme: true,
        },
        javascript: {
          modules: true,
          dynamicImport: true,
          optionalChaining: true,
          nullishCoalescing: true,
          bigint: true,
        },
        apis: {
          intersectionObserver: true,
          resizeObserver: true,
          performanceObserver: true,
          webAnimations: true,
        },
      },
    },
    
    edge: {
      name: 'Microsoft Edge',
      engine: 'Blink',
      marketShare: 5.0,
      priority: 'medium',
      versions: {
        current: '120',
        minimum: '90',
        testing: ['120', '119'],
      },
      userAgents: {
        desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        mobile: 'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0',
      },
      capabilities: {
        es2020: true,
        webp: true,
        avif: true,
        css: {
          grid: true,
          flexbox: true,
          customProperties: true,
          containerQueries: true,
          aspectRatio: true,
          colorScheme: true,
        },
        javascript: {
          modules: true,
          dynamicImport: true,
          optionalChaining: true,
          nullishCoalescing: true,
          bigint: true,
        },
        apis: {
          intersectionObserver: true,
          resizeObserver: true,
          performanceObserver: true,
          webAnimations: true,
        },
      },
    },
  },

  /**
   * Device and viewport configurations
   */
  devices: {
    mobile: {
      small: { width: 320, height: 568, deviceScaleFactor: 2 }, // iPhone SE
      medium: { width: 375, height: 667, deviceScaleFactor: 2 }, // iPhone 8
      large: { width: 414, height: 896, deviceScaleFactor: 3 }, // iPhone 11 Pro Max
    },
    tablet: {
      portrait: { width: 768, height: 1024, deviceScaleFactor: 2 }, // iPad
      landscape: { width: 1024, height: 768, deviceScaleFactor: 2 }, // iPad landscape
    },
    desktop: {
      small: { width: 1024, height: 768, deviceScaleFactor: 1 }, // Small laptop
      medium: { width: 1440, height: 900, deviceScaleFactor: 1 }, // Standard desktop
      large: { width: 1920, height: 1080, deviceScaleFactor: 1 }, // Full HD
      ultrawide: { width: 2560, height: 1440, deviceScaleFactor: 1 }, // 2K ultrawide
    },
  },

  /**
   * Feature support matrix
   */
  features: {
    critical: {
      // Features that must work across all browsers
      css: [
        'display: flex',
        'display: grid',
        'gap',
        'custom-properties',
        'media-queries',
        'transforms',
        'transitions',
      ],
      javascript: [
        'fetch',
        'promises',
        'arrow-functions',
        'template-literals',
        'destructuring',
        'modules',
      ],
      apis: [
        'localStorage',
        'sessionStorage',
        'matchMedia',
        'addEventListener',
      ],
    },
    
    enhanced: {
      // Features that enhance experience but have fallbacks
      css: [
        'container-queries',
        'aspect-ratio',
        'color-scheme',
        'scroll-behavior',
        'backdrop-filter',
      ],
      javascript: [
        'optional-chaining',
        'nullish-coalescing',
        'dynamic-import',
        'bigint',
      ],
      apis: [
        'IntersectionObserver',
        'ResizeObserver',
        'PerformanceObserver',
        'Web Animations API',
      ],
    },
    
    progressive: {
      // Cutting-edge features with graceful degradation
      css: [
        'color-mix',
        'oklch',
        'animation-timeline',
        'view-transitions',
      ],
      javascript: [
        'top-level-await',
        'private-fields',
        'logical-assignment',
      ],
      apis: [
        'View Transitions API',
        'Navigation API',
        'Popover API',
      ],
    },
  },

  /**
   * Testing scenarios and priorities
   */
  scenarios: {
    smoke: {
      // Quick smoke tests for all browsers
      browsers: ['chrome', 'firefox', 'safari'],
      devices: ['mobile.medium', 'desktop.medium'],
      tests: [
        'page-loads',
        'basic-navigation',
        'core-functionality',
      ],
    },
    
    comprehensive: {
      // Full compatibility testing
      browsers: ['chrome', 'firefox', 'safari', 'edge'],
      devices: [
        'mobile.small', 'mobile.medium', 'mobile.large',
        'tablet.portrait', 'tablet.landscape',
        'desktop.small', 'desktop.medium', 'desktop.large',
      ],
      tests: [
        'visual-consistency',
        'interactive-elements',
        'responsive-design',
        'accessibility',
        'performance',
      ],
    },
    
    regression: {
      // Regression testing for critical paths
      browsers: ['chrome', 'firefox', 'safari'],
      devices: ['mobile.medium', 'desktop.medium'],
      tests: [
        'theme-switching',
        'search-functionality',
        'form-submission',
        'navigation-flow',
      ],
    },
  },

  /**
   * Compatibility requirements
   */
  requirements: {
    // Minimum browser support
    support: {
      chrome: '90+',
      firefox: '78+', // ESR
      safari: '14+',
      edge: '90+',
    },
    
    // Performance thresholds per browser
    performance: {
      chrome: {
        loadTime: 2000, // ms
        renderTime: 100, // ms
        memoryUsage: 50, // MB
      },
      firefox: {
        loadTime: 2500, // ms
        renderTime: 150, // ms
        memoryUsage: 60, // MB
      },
      safari: {
        loadTime: 2200, // ms
        renderTime: 120, // ms
        memoryUsage: 55, // MB
      },
      edge: {
        loadTime: 2000, // ms
        renderTime: 100, // ms
        memoryUsage: 50, // MB
      },
    },
    
    // Visual consistency tolerances
    visual: {
      pixelDifference: 0.3, // 30% tolerance
      layoutShift: 0.1, // CLS threshold
      colorAccuracy: 0.95, // 95% color accuracy
    },
  },

  /**
   * Fallback strategies
   */
  fallbacks: {
    css: {
      'container-queries': 'media-queries',
      'aspect-ratio': 'padding-hack',
      'color-scheme': 'class-based-theming',
      'backdrop-filter': 'solid-background',
      'color-mix': 'predefined-colors',
    },
    
    javascript: {
      'optional-chaining': 'manual-checks',
      'nullish-coalescing': 'logical-or',
      'dynamic-import': 'static-import',
      'IntersectionObserver': 'scroll-events',
      'ResizeObserver': 'resize-events',
    },
    
    images: {
      'avif': 'webp',
      'webp': 'jpeg',
      'svg': 'png',
    },
  },

  /**
   * Testing tools configuration
   */
  tools: {
    playwright: {
      browsers: ['chromium', 'firefox', 'webkit'],
      headless: true,
      screenshot: {
        mode: 'only-on-failure',
        fullPage: true,
      },
      video: {
        mode: 'retain-on-failure',
      },
    },
    
    browserstack: {
      // Configuration for BrowserStack testing
      browsers: [
        { browser: 'chrome', version: 'latest' },
        { browser: 'firefox', version: 'latest' },
        { browser: 'safari', version: 'latest' },
        { browser: 'edge', version: 'latest' },
      ],
      devices: [
        'iPhone 14',
        'Samsung Galaxy S22',
        'iPad Pro',
        'Windows 11',
        'macOS Ventura',
      ],
    },
  },

  /**
   * Reporting and monitoring
   */
  reporting: {
    formats: ['json', 'html', 'junit'],
    
    metrics: [
      'browser-support-coverage',
      'feature-compatibility-score',
      'visual-consistency-score',
      'performance-comparison',
      'error-rate-by-browser',
    ],
    
    thresholds: {
      compatibility: 95, // % of tests that must pass
      performance: 90, // % of performance tests that must pass
      visual: 85, // % of visual tests that must pass
    },
    
    alerts: {
      criticalFailure: 'immediate',
      performanceRegression: 'daily',
      visualInconsistency: 'weekly',
    },
  },

  /**
   * CI/CD integration
   */
  cicd: {
    triggers: [
      'pull-request',
      'main-branch-push',
      'release-candidate',
      'scheduled-daily',
    ],
    
    stages: {
      'pull-request': 'smoke',
      'main-branch-push': 'comprehensive',
      'release-candidate': 'comprehensive',
      'scheduled-daily': 'regression',
    },
    
    parallelization: {
      maxWorkers: 4,
      shardStrategy: 'browser',
    },
  },
} as const

/**
 * Helper functions for cross-browser configuration
 */
export const getBrowserConfig = (browser: keyof typeof CROSS_BROWSER_CONFIG.browsers) => {
  return CROSS_BROWSER_CONFIG.browsers[browser]
}

export const getDeviceConfig = (device: string) => {
  const [category, size] = device.split('.')
  return CROSS_BROWSER_CONFIG.devices[category as keyof typeof CROSS_BROWSER_CONFIG.devices]?.[size as any]
}

export const getScenarioConfig = (scenario: keyof typeof CROSS_BROWSER_CONFIG.scenarios) => {
  return CROSS_BROWSER_CONFIG.scenarios[scenario]
}

export const getFeatureSupport = (browser: string, feature: string): boolean => {
  const browserConfig = CROSS_BROWSER_CONFIG.browsers[browser as keyof typeof CROSS_BROWSER_CONFIG.browsers]
  if (!browserConfig) return false
  
  // Check in capabilities
  const capabilities = browserConfig.capabilities
  
  // Check CSS features
  if (feature.startsWith('css.')) {
    const cssFeature = feature.replace('css.', '')
    return capabilities.css[cssFeature as keyof typeof capabilities.css] || false
  }
  
  // Check JavaScript features
  if (feature.startsWith('js.')) {
    const jsFeature = feature.replace('js.', '')
    return capabilities.javascript[jsFeature as keyof typeof capabilities.javascript] || false
  }
  
  // Check API features
  if (feature.startsWith('api.')) {
    const apiFeature = feature.replace('api.', '')
    return capabilities.apis[apiFeature as keyof typeof capabilities.apis] || false
  }
  
  return false
}

export const getFallbackStrategy = (feature: string): string | null => {
  const fallbacks = CROSS_BROWSER_CONFIG.fallbacks
  
  if (feature in fallbacks.css) {
    return fallbacks.css[feature as keyof typeof fallbacks.css]
  }
  
  if (feature in fallbacks.javascript) {
    return fallbacks.javascript[feature as keyof typeof fallbacks.javascript]
  }
  
  if (feature in fallbacks.images) {
    return fallbacks.images[feature as keyof typeof fallbacks.images]
  }
  
  return null
}

export const generateTestMatrix = (scenario: keyof typeof CROSS_BROWSER_CONFIG.scenarios) => {
  const config = getScenarioConfig(scenario)
  const matrix: Array<{
    browser: string
    device: string
    config: any
  }> = []
  
  config.browsers.forEach(browser => {
    config.devices.forEach(device => {
      matrix.push({
        browser,
        device,
        config: {
          browser: getBrowserConfig(browser as keyof typeof CROSS_BROWSER_CONFIG.browsers),
          device: getDeviceConfig(device),
        },
      })
    })
  })
  
  return matrix
}

export default CROSS_BROWSER_CONFIG
