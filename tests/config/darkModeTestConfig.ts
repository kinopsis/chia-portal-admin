/**
 * Dark Mode Testing Configuration
 * 
 * Centralized configuration for dark mode testing:
 * - Theme values and storage keys
 * - Color contrast requirements
 * - CSS custom properties validation
 * - Component-specific dark mode expectations
 */

export const DARK_MODE_CONFIG = {
  /**
   * Theme configuration
   */
  themes: {
    light: 'light',
    dark: 'dark',
    system: 'system',
  } as const,

  /**
   * Storage configuration
   */
  storage: {
    key: 'theme',
    fallback: 'light',
  },

  /**
   * CSS custom properties for dark mode
   */
  cssProperties: {
    // Core color system
    background: {
      primary: '#0f172a', // slate-900
      secondary: '#1e293b', // slate-800
      tertiary: '#334155', // slate-700
    },
    text: {
      primary: '#f8fafc', // slate-50
      secondary: '#e2e8f0', // slate-200
      muted: '#cbd5e1', // slate-300
    },
    border: {
      primary: '#475569', // slate-600
      secondary: '#64748b', // slate-500
    },
    // Brand colors (maintained in dark mode)
    brand: {
      primary: '#10b981', // emerald-500
      primaryDark: '#059669', // emerald-600
      yellow: '#f59e0b', // amber-500
    },
    // Service card specific colors
    serviceCards: {
      yellow: {
        background: '#451a03', // amber-950
        border: '#78350f', // amber-900
        text: '#fef3c7', // amber-100
      },
      gray: {
        background: '#0f172a', // slate-900
        border: '#334155', // slate-700
        text: '#f1f5f9', // slate-100
      },
      blue: {
        background: '#0c1e3e', // blue-950
        border: '#1e3a8a', // blue-800
        text: '#dbeafe', // blue-100
      },
      green: {
        background: '#022c22', // emerald-950
        border: '#065f46', // emerald-800
        text: '#d1fae5', // emerald-100
      },
      purple: {
        background: '#2e1065', // violet-950
        border: '#5b21b6', // violet-800
        text: '#ede9fe', // violet-100
      },
      indigo: {
        background: '#1e1b4b', // indigo-950
        border: '#3730a3', // indigo-800
        text: '#e0e7ff', // indigo-100
      },
    },
  },

  /**
   * Color contrast requirements (WCAG 2.1)
   */
  colorContrast: {
    AA: {
      normal: 4.5,
      large: 3.0,
    },
    AAA: {
      normal: 7.0,
      large: 4.5,
    },
    // Text size thresholds
    textSizes: {
      large: 18, // px (or 14pt)
      largeBold: 14, // px (or 18pt bold)
    },
  },

  /**
   * Component-specific dark mode expectations
   */
  components: {
    serviceCard: {
      colorSchemes: ['yellow', 'gray', 'blue', 'green', 'purple', 'indigo'],
      requiredClasses: ['service-card', 'dark:bg-'],
      contrastElements: ['title', 'description', 'button'],
    },
    heroSection: {
      backgroundVariants: ['gradient', 'solid', 'image'],
      requiredClasses: ['hero-section', 'dark:text-'],
      contrastElements: ['title', 'subtitle', 'searchInput'],
    },
    metricsGrid: {
      metricTypes: ['primary', 'secondary', 'success', 'info', 'warning'],
      requiredClasses: ['metrics-grid', 'dark:bg-'],
      contrastElements: ['value', 'label', 'icon'],
    },
    whyChooseSection: {
      variants: ['cards', 'minimal', 'icons'],
      requiredClasses: ['benefits-grid', 'dark:bg-'],
      contrastElements: ['title', 'description', 'icon'],
    },
    departmentShowcase: {
      colorSchemes: ['blue', 'green', 'yellow', 'purple', 'red'],
      requiredClasses: ['departments-grid', 'dark:bg-'],
      contrastElements: ['name', 'description', 'stats'],
    },
    faqPreview: {
      states: ['collapsed', 'expanded'],
      requiredClasses: ['faq-accordion', 'dark:bg-'],
      contrastElements: ['question', 'answer', 'button'],
    },
  },

  /**
   * Animation and transition settings for dark mode
   */
  animations: {
    themeSwitch: {
      duration: 300, // ms
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['background-color', 'color', 'border-color'],
    },
    reducedMotion: {
      duration: 1, // ms (effectively disabled)
      easing: 'linear',
    },
  },

  /**
   * Visual regression testing settings
   */
  visualRegression: {
    threshold: 0.2, // 20% difference allowed
    maxDiffPixels: 1000,
    viewports: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1440, height: 900 },
    },
    browsers: ['chromium', 'firefox', 'webkit'],
  },

  /**
   * System preference testing scenarios
   */
  systemPreferences: [
    {
      name: 'Light system, light theme',
      systemPrefersDark: false,
      storedTheme: 'light',
      expectedDark: false,
    },
    {
      name: 'Light system, dark theme',
      systemPrefersDark: false,
      storedTheme: 'dark',
      expectedDark: true,
    },
    {
      name: 'Light system, system theme',
      systemPrefersDark: false,
      storedTheme: 'system',
      expectedDark: false,
    },
    {
      name: 'Dark system, light theme',
      systemPrefersDark: true,
      storedTheme: 'light',
      expectedDark: false,
    },
    {
      name: 'Dark system, dark theme',
      systemPrefersDark: true,
      storedTheme: 'dark',
      expectedDark: true,
    },
    {
      name: 'Dark system, system theme',
      systemPrefersDark: true,
      storedTheme: 'system',
      expectedDark: true,
    },
  ],

  /**
   * Performance thresholds for dark mode
   */
  performance: {
    themeSwitch: {
      maxDuration: 500, // ms
      maxLayoutShift: 0.1, // CLS
    },
    rendering: {
      maxRenderTime: 100, // ms
      maxMemoryIncrease: 10, // MB
    },
  },

  /**
   * Accessibility requirements for dark mode
   */
  accessibility: {
    focusIndicators: {
      minContrast: 3.0, // WCAG 2.1 SC 1.4.11
      minWidth: 2, // px
      minOffset: 2, // px
    },
    colorOnly: {
      // Information should not be conveyed by color alone
      requiresAlternative: true,
    },
    userPreferences: {
      respectReducedMotion: true,
      respectHighContrast: true,
      respectSystemTheme: true,
    },
  },

  /**
   * Error handling scenarios
   */
  errorScenarios: [
    {
      name: 'Invalid stored theme',
      setup: () => localStorage.setItem('theme', 'invalid'),
      expectedFallback: 'light',
    },
    {
      name: 'Missing localStorage',
      setup: () => {
        Object.defineProperty(window, 'localStorage', {
          value: null,
          writable: true,
        })
      },
      expectedFallback: 'light',
    },
    {
      name: 'localStorage throws error',
      setup: () => {
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: () => { throw new Error('Storage error') },
            setItem: () => { throw new Error('Storage error') },
          },
          writable: true,
        })
      },
      expectedFallback: 'light',
    },
  ],

  /**
   * Test data for components
   */
  testData: {
    serviceCards: [
      {
        colorScheme: 'yellow',
        title: 'Certificado de Residencia',
        description: 'Solicita tu certificado de residencia',
      },
      {
        colorScheme: 'blue',
        title: 'Consulta Ciudadano',
        description: 'Consulta el estado de tus solicitudes',
      },
      {
        colorScheme: 'green',
        title: 'Pagos en Línea',
        description: 'Realiza pagos de impuestos y tasas',
      },
    ],
    metrics: [
      { id: '1', title: 'Users', value: 1250, color: 'primary' },
      { id: '2', title: 'Services', value: 45, color: 'secondary' },
      { id: '3', title: 'Revenue', value: 98500, color: 'success' },
    ],
    faqs: [
      {
        id: '1',
        question: '¿Cómo solicito un certificado?',
        answer: 'Puedes solicitar certificados a través del portal...',
      },
      {
        id: '2',
        question: '¿Cuáles son los horarios de atención?',
        answer: 'Nuestros horarios de atención son...',
      },
    ],
  },
} as const

/**
 * Helper functions for dark mode testing
 */
export const getDarkModeExpectation = (
  component: keyof typeof DARK_MODE_CONFIG.components,
  property: string
) => {
  return DARK_MODE_CONFIG.components[component]?.[property as keyof typeof DARK_MODE_CONFIG.components[typeof component]]
}

export const getContrastRequirement = (
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
) => {
  return DARK_MODE_CONFIG.colorContrast[level][textSize]
}

export const getSystemPreferenceScenarios = () => {
  return DARK_MODE_CONFIG.systemPreferences
}

export const getErrorScenarios = () => {
  return DARK_MODE_CONFIG.errorScenarios
}

export const getVisualRegressionConfig = () => {
  return DARK_MODE_CONFIG.visualRegression
}

export default DARK_MODE_CONFIG
