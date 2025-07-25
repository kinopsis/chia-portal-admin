/**
 * Performance Testing Configuration
 * 
 * Centralized configuration for performance testing:
 * - Core Web Vitals thresholds
 * - Performance budgets
 * - Network conditions
 * - Device configurations
 * - Lighthouse settings
 */

export const PERFORMANCE_CONFIG = {
  /**
   * Core Web Vitals thresholds (Google recommendations)
   */
  coreWebVitals: {
    LCP: {
      good: 2500, // ms
      needsImprovement: 4000, // ms
      poor: Infinity,
    },
    FID: {
      good: 100, // ms
      needsImprovement: 300, // ms
      poor: Infinity,
    },
    CLS: {
      good: 0.1,
      needsImprovement: 0.25,
      poor: Infinity,
    },
    FCP: {
      good: 1800, // ms
      needsImprovement: 3000, // ms
      poor: Infinity,
    },
    TTFB: {
      good: 800, // ms
      needsImprovement: 1800, // ms
      poor: Infinity,
    },
    TTI: {
      good: 3800, // ms
      needsImprovement: 7300, // ms
      poor: Infinity,
    },
    TBT: {
      good: 200, // ms
      needsImprovement: 600, // ms
      poor: Infinity,
    },
    SI: {
      good: 3400, // ms
      needsImprovement: 5800, // ms
      poor: Infinity,
    },
  },

  /**
   * Performance budgets
   */
  budgets: {
    // Bundle sizes (gzipped, in KB)
    javascript: {
      initial: 150,
      total: 300,
      perChunk: 50,
    },
    css: {
      initial: 50,
      total: 100,
      critical: 20,
    },
    images: {
      perImage: 200,
      total: 1000,
      hero: 300,
    },
    fonts: {
      total: 100,
      perFont: 30,
    },
    // Timing budgets (in ms)
    timing: {
      domContentLoaded: 1500,
      loadComplete: 3000,
      timeToInteractive: 3500,
      firstMeaningfulPaint: 2000,
    },
    // Memory budgets (in MB)
    memory: {
      heapSize: 50,
      memoryIncrease: 10,
      maxHeapSize: 100,
    },
    // Network budgets
    network: {
      totalRequests: 50,
      totalSize: 2048, // KB
      criticalRequests: 10,
    },
  },

  /**
   * Network conditions for testing
   */
  networkConditions: {
    'Fast 3G': {
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40, // ms
      name: 'Fast 3G',
    },
    'Slow 3G': {
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8, // 500 Kbps
      latency: 400, // ms
      name: 'Slow 3G',
    },
    '4G': {
      downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
      uploadThroughput: 3 * 1024 * 1024 / 8, // 3 Mbps
      latency: 20, // ms
      name: '4G',
    },
    'WiFi': {
      downloadThroughput: 30 * 1024 * 1024 / 8, // 30 Mbps
      uploadThroughput: 15 * 1024 * 1024 / 8, // 15 Mbps
      latency: 2, // ms
      name: 'WiFi',
    },
    'Offline': {
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
      name: 'Offline',
    },
  },

  /**
   * Device configurations
   */
  devices: {
    desktop: {
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      cpu: 'desktop',
    },
    mobile: {
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      cpu: 'mobile',
    },
    tablet: {
      viewport: { width: 768, height: 1024 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: true,
      cpu: 'mobile',
    },
    'desktop-4k': {
      viewport: { width: 2560, height: 1440 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
      cpu: 'desktop',
    },
  },

  /**
   * Lighthouse configuration
   */
  lighthouse: {
    thresholds: {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 95,
      pwa: 80,
    },
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      skipAudits: ['uses-http2'], // Skip audits that might not be relevant
      throttling: {
        rttMs: 40,
        throughputKbps: 1024,
        cpuSlowdownMultiplier: 1,
      },
    },
  },

  /**
   * Test scenarios and configurations
   */
  scenarios: {
    // Basic performance scenarios
    basic: [
      { device: 'desktop', network: 'WiFi' },
      { device: 'mobile', network: 'Fast 3G' },
      { device: 'tablet', network: '4G' },
    ],
    // Stress test scenarios
    stress: [
      { device: 'mobile', network: 'Slow 3G' },
      { device: 'desktop', network: 'Fast 3G' },
      { device: 'tablet', network: 'Slow 3G' },
    ],
    // High-end scenarios
    premium: [
      { device: 'desktop-4k', network: 'WiFi' },
      { device: 'desktop', network: 'WiFi' },
      { device: 'tablet', network: 'WiFi' },
    ],
  },

  /**
   * Component-specific performance expectations
   */
  components: {
    serviceCard: {
      renderTime: 50, // ms
      memoryUsage: 2, // MB
      animationDuration: 300, // ms
    },
    metricsGrid: {
      renderTime: 80, // ms
      memoryUsage: 5, // MB
      animationDuration: 200, // ms
    },
    heroSection: {
      renderTime: 60, // ms
      memoryUsage: 3, // MB
      searchResponseTime: 100, // ms
    },
    faqPreview: {
      renderTime: 40, // ms
      memoryUsage: 2, // MB
      accordionToggleTime: 200, // ms
    },
    themeSwitch: {
      transitionTime: 300, // ms
      memoryIncrease: 1, // MB
      layoutShift: 0.05, // CLS
    },
  },

  /**
   * Optimization targets
   */
  optimization: {
    // Code splitting targets
    codeSplitting: {
      minChunks: 2,
      lazyLoadingPercentage: 30, // % of chunks that should be lazy-loaded
    },
    // Image optimization targets
    images: {
      lazyLoadingPercentage: 70, // % of images that should be lazy-loaded
      modernFormatPercentage: 50, // % of images in WebP/AVIF
      compressionRatio: 0.8, // Target compression ratio
    },
    // Font optimization targets
    fonts: {
      preloadedFonts: 2, // Number of critical fonts to preload
      fontDisplayOptimization: 80, // % of fonts with font-display optimization
    },
    // CSS optimization targets
    css: {
      criticalCSSPercentage: 30, // % of CSS that should be critical
      unusedCSSPercentage: 10, // Max % of unused CSS allowed
    },
  },

  /**
   * Monitoring and alerting thresholds
   */
  monitoring: {
    // Performance regression thresholds
    regression: {
      LCP: 500, // ms increase that triggers alert
      FID: 50, // ms increase that triggers alert
      CLS: 0.05, // CLS increase that triggers alert
      bundleSize: 50, // KB increase that triggers alert
    },
    // Performance improvement targets
    improvement: {
      LCP: -200, // ms improvement target
      FID: -20, // ms improvement target
      CLS: -0.02, // CLS improvement target
      bundleSize: -20, // KB reduction target
    },
  },

  /**
   * Test environment configuration
   */
  environment: {
    // CI/CD specific settings
    ci: {
      retries: 3,
      timeout: 60000, // ms
      parallel: false,
      headless: true,
    },
    // Local development settings
    local: {
      retries: 1,
      timeout: 30000, // ms
      parallel: true,
      headless: false,
    },
    // Performance lab settings
    lab: {
      retries: 5,
      timeout: 120000, // ms
      parallel: false,
      headless: true,
      warmupRuns: 3,
    },
  },

  /**
   * Reporting configuration
   */
  reporting: {
    formats: ['json', 'html', 'csv'],
    metrics: [
      'LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'TTI', 'TBT', 'SI',
      'bundleSize', 'imageSize', 'fontSize', 'totalSize',
      'renderTime', 'memoryUsage', 'networkRequests',
    ],
    thresholds: {
      pass: 'good',
      warn: 'needs-improvement',
      fail: 'poor',
    },
  },
} as const

/**
 * Helper functions for performance configuration
 */
export const getThreshold = (
  metric: keyof typeof PERFORMANCE_CONFIG.coreWebVitals,
  level: 'good' | 'needsImprovement' | 'poor' = 'good'
) => {
  return PERFORMANCE_CONFIG.coreWebVitals[metric][level]
}

export const getBudget = (
  category: keyof typeof PERFORMANCE_CONFIG.budgets,
  type: string
) => {
  const budget = PERFORMANCE_CONFIG.budgets[category] as any
  return budget[type]
}

export const getNetworkCondition = (name: keyof typeof PERFORMANCE_CONFIG.networkConditions) => {
  return PERFORMANCE_CONFIG.networkConditions[name]
}

export const getDevice = (name: keyof typeof PERFORMANCE_CONFIG.devices) => {
  return PERFORMANCE_CONFIG.devices[name]
}

export const getScenarios = (type: keyof typeof PERFORMANCE_CONFIG.scenarios) => {
  return PERFORMANCE_CONFIG.scenarios[type]
}

export const getComponentExpectation = (
  component: keyof typeof PERFORMANCE_CONFIG.components,
  metric: string
) => {
  const expectations = PERFORMANCE_CONFIG.components[component] as any
  return expectations[metric]
}

export const evaluateMetric = (
  value: number,
  metric: keyof typeof PERFORMANCE_CONFIG.coreWebVitals
): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds = PERFORMANCE_CONFIG.coreWebVitals[metric]
  
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

export default PERFORMANCE_CONFIG
