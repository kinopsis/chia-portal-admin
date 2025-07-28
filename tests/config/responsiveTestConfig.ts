/**
 * Responsive Testing Configuration
 * 
 * Centralized configuration for responsive design testing:
 * - Viewport definitions
 * - Breakpoint mappings
 * - Test scenarios
 * - Performance thresholds
 */

export const RESPONSIVE_CONFIG = {
  /**
   * Viewport sizes for testing
   */
  viewports: {
    // Mobile devices (320px - 639px)
    mobile: {
      'Mobile XS': { width: 320, height: 568, devicePixelRatio: 2 },
      'Mobile Small': { width: 375, height: 667, devicePixelRatio: 2 },
      'iPhone SE': { width: 375, height: 667, devicePixelRatio: 2 },
      'iPhone 12': { width: 390, height: 844, devicePixelRatio: 3 },
      'iPhone 12 Pro Max': { width: 428, height: 926, devicePixelRatio: 3 },
      'Samsung Galaxy S21': { width: 360, height: 800, devicePixelRatio: 3 },
      'Pixel 5': { width: 393, height: 851, devicePixelRatio: 3 },
    },
    
    // Tablet devices (640px - 1023px)
    tablet: {
      'Tablet Small': { width: 640, height: 960, devicePixelRatio: 2 },
      'iPad Mini': { width: 768, height: 1024, devicePixelRatio: 2 },
      'iPad': { width: 768, height: 1024, devicePixelRatio: 2 },
      'iPad Air': { width: 820, height: 1180, devicePixelRatio: 2 },
      'iPad Pro 11"': { width: 834, height: 1194, devicePixelRatio: 2 },
      'Surface Pro': { width: 912, height: 1368, devicePixelRatio: 2 },
      'Tablet Landscape': { width: 1024, height: 768, devicePixelRatio: 2 },
    },
    
    // Desktop devices (1024px+)
    desktop: {
      'Desktop Small': { width: 1024, height: 768, devicePixelRatio: 1 },
      'Desktop Medium': { width: 1280, height: 720, devicePixelRatio: 1 },
      'Desktop Large': { width: 1440, height: 900, devicePixelRatio: 1 },
      'Desktop XL': { width: 1920, height: 1080, devicePixelRatio: 1 },
      'Desktop 4K': { width: 2560, height: 1440, devicePixelRatio: 2 },
      'Ultrawide': { width: 3440, height: 1440, devicePixelRatio: 1 },
    },
  },

  /**
   * Breakpoint definitions matching CSS
   */
  breakpoints: {
    mobile: { min: 0, max: 639 },
    tablet: { min: 640, max: 1023 },
    desktop: { min: 1024, max: Infinity },
  },

  /**
   * Grid layout expectations per breakpoint
   */
  gridLayouts: {
    serviceCards: {
      mobile: { columns: 1, gap: '1rem' },
      tablet: { columns: 2, gap: '1.5rem' },
      desktop: { columns: 3, gap: '2rem' },
    },
    metricsGrid: {
      mobile: { columns: 2, gap: '0.75rem' },
      tablet: { columns: 3, gap: '1rem' },
      desktop: { columns: 5, gap: '1.5rem' },
    },
    benefitsGrid: {
      mobile: { columns: 1, gap: '1.5rem' },
      tablet: { columns: 3, gap: '2rem' },
      desktop: { columns: 3, gap: '2.5rem' },
    },
    departmentsGrid: {
      mobile: { columns: 1, gap: '1rem' },
      tablet: { columns: 2, gap: '1.5rem' },
      desktop: { columns: 4, gap: '2rem' },
    },
  },

  /**
   * Typography scale expectations
   */
  typography: {
    heroTitle: {
      mobile: { minSize: 24, maxSize: 32 },
      tablet: { minSize: 32, maxSize: 40 },
      desktop: { minSize: 48, maxSize: 60 },
    },
    sectionTitle: {
      mobile: { minSize: 20, maxSize: 28 },
      tablet: { minSize: 28, maxSize: 36 },
      desktop: { minSize: 36, maxSize: 48 },
    },
    cardTitle: {
      mobile: { minSize: 16, maxSize: 20 },
      tablet: { minSize: 18, maxSize: 24 },
      desktop: { minSize: 20, maxSize: 28 },
    },
    bodyText: {
      mobile: { minSize: 14, maxSize: 16 },
      tablet: { minSize: 16, maxSize: 18 },
      desktop: { minSize: 16, maxSize: 20 },
    },
  },

  /**
   * Touch target requirements (WCAG 2.1 SC 2.5.5)
   */
  touchTargets: {
    minimum: 44, // 44px minimum
    comfortable: 48, // 48px comfortable
    large: 56, // 56px large
    extraLarge: 64, // 64px extra large
  },

  /**
   * Performance thresholds
   */
  performance: {
    renderTime: {
      mobile: 150, // ms
      tablet: 100, // ms
      desktop: 80, // ms
    },
    layoutShift: {
      maximum: 0.1, // CLS threshold
    },
    memoryUsage: {
      maximum: 50, // MB
    },
  },

  /**
   * Visual regression thresholds
   */
  visualRegression: {
    threshold: 0.2, // 20% difference allowed
    maxDiffPixels: 1000,
    animations: {
      // Disable for consistent screenshots
    },
  },

  /**
   * Test scenarios for comprehensive coverage
   */
  testScenarios: {
    // Critical user journeys
    userJourneys: [
      'homepage-load',
      'service-search',
      'service-selection',
      'faq-interaction',
      'department-navigation',
    ],
    
    // Component states to test
    componentStates: [
      'default',
      'loading',
      'error',
      'empty',
      'hover',
      'focus',
      'active',
    ],
    
    // Interaction patterns
    interactions: [
      'click',
      'tap',
      'keyboard-navigation',
      'scroll',
      'resize',
      'orientation-change',
    ],
  },

  /**
   * Browser configurations for cross-browser testing
   */
  browsers: {
    chrome: {
      name: 'chromium',
      args: [
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
    },
    firefox: {
      name: 'firefox',
      args: [
        '--disable-web-security',
      ],
    },
    safari: {
      name: 'webkit',
      args: [],
    },
  },

  /**
   * Accessibility requirements
   */
  accessibility: {
    colorContrast: {
      normal: 4.5, // WCAG AA
      large: 3.0, // WCAG AA for large text
      enhanced: 7.0, // WCAG AAA
    },
    focusIndicators: {
      minWidth: 2, // px
      minOffset: 2, // px
    },
    headingHierarchy: {
      enforceSequential: true,
      maxSkipLevel: 1,
    },
  },

  /**
   * Content length limits for responsive testing
   */
  contentLimits: {
    serviceTitle: {
      short: 15, // characters
      medium: 30,
      long: 60,
      extreme: 100,
    },
    serviceDescription: {
      short: 50, // characters
      medium: 100,
      long: 200,
      extreme: 400,
    },
    faqQuestion: {
      short: 30,
      medium: 60,
      long: 120,
      extreme: 200,
    },
    faqAnswer: {
      short: 100,
      medium: 300,
      long: 600,
      extreme: 1200,
    },
  },

  /**
   * Animation and transition settings
   */
  animations: {
    durations: {
      fast: 150, // ms
      normal: 300, // ms
      slow: 500, // ms
    },
    easings: {
      easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    reducedMotion: {
      duration: 1, // ms (effectively disabled)
      easing: 'linear',
    },
  },

  /**
   * Network conditions for testing
   */
  networkConditions: {
    fast3G: {
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 40, // ms
    },
    slow3G: {
      downloadThroughput: 500 * 1024 / 8, // 500 Kbps
      uploadThroughput: 500 * 1024 / 8, // 500 Kbps
      latency: 400, // ms
    },
    offline: {
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    },
  },
} as const

/**
 * Helper functions for test configuration
 */
export const getViewportsByCategory = (category: keyof typeof RESPONSIVE_CONFIG.viewports) => {
  return RESPONSIVE_CONFIG.viewports[category]
}

export const getBreakpointForWidth = (width: number): keyof typeof RESPONSIVE_CONFIG.breakpoints => {
  if (width >= RESPONSIVE_CONFIG.breakpoints.desktop.min) return 'desktop'
  if (width >= RESPONSIVE_CONFIG.breakpoints.tablet.min) return 'tablet'
  return 'mobile'
}

export const getExpectedGridColumns = (
  component: keyof typeof RESPONSIVE_CONFIG.gridLayouts,
  breakpoint: keyof typeof RESPONSIVE_CONFIG.breakpoints
) => {
  return RESPONSIVE_CONFIG.gridLayouts[component][breakpoint].columns
}

export const getTypographyRange = (
  element: keyof typeof RESPONSIVE_CONFIG.typography,
  breakpoint: keyof typeof RESPONSIVE_CONFIG.breakpoints
) => {
  return RESPONSIVE_CONFIG.typography[element][breakpoint]
}

export const getTouchTargetRequirement = (size: 'minimum' | 'comfortable' | 'large' | 'extraLarge' = 'minimum') => {
  return RESPONSIVE_CONFIG.touchTargets[size]
}

export default RESPONSIVE_CONFIG
