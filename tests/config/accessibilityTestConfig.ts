/**
 * Accessibility Testing Configuration
 * 
 * Centralized configuration for accessibility testing:
 * - WCAG 2.1 AA compliance requirements
 * - Color contrast standards
 * - Touch target specifications
 * - ARIA attribute requirements
 * - Keyboard navigation standards
 * - Screen reader compatibility
 */

export const ACCESSIBILITY_CONFIG = {
  /**
   * WCAG 2.1 AA compliance requirements
   */
  wcag: {
    version: '2.1',
    level: 'AA',
    
    // Color contrast requirements
    colorContrast: {
      normal: 4.5, // Normal text (under 18pt or under 14pt bold)
      large: 3.0, // Large text (18pt+ or 14pt+ bold)
      nonText: 3.0, // UI components and graphical objects
      enhanced: 7.0, // AAA level for enhanced contrast
    },
    
    // Text size thresholds
    textSize: {
      large: 18, // pt
      largeBold: 14, // pt
      minimum: 12, // pt (absolute minimum)
    },
    
    // Touch target requirements (SC 2.5.5)
    touchTargets: {
      minimum: 44, // px (WCAG 2.1 Level AA)
      comfortable: 48, // px (recommended)
      spacing: 8, // px minimum spacing between targets
    },
    
    // Timing requirements
    timing: {
      sessionTimeout: 20, // hours minimum warning
      autoRefresh: 20, // hours maximum
      movingContent: 5, // seconds before auto-pause
    },
    
    // Animation and motion
    animation: {
      respectReducedMotion: true,
      maxDuration: 5000, // ms for essential animations
      parallaxLimit: 3, // maximum parallax ratio
    },
  },

  /**
   * ARIA requirements and best practices
   */
  aria: {
    // Required attributes for specific roles
    roleRequirements: {
      button: {
        required: [],
        optional: ['aria-pressed', 'aria-expanded', 'aria-describedby', 'aria-label'],
        forbidden: ['aria-checked'], // Use aria-pressed instead
      },
      link: {
        required: [],
        optional: ['aria-describedby', 'aria-label', 'aria-current'],
        forbidden: ['aria-pressed', 'aria-expanded'],
      },
      heading: {
        required: [],
        optional: ['aria-level', 'aria-describedby'],
        forbidden: ['aria-expanded', 'aria-pressed'],
      },
      region: {
        required: ['aria-label', 'aria-labelledby'], // At least one required
        optional: ['aria-describedby'],
        forbidden: [],
      },
      navigation: {
        required: [],
        optional: ['aria-label', 'aria-labelledby'],
        forbidden: [],
      },
      main: {
        required: [],
        optional: ['aria-label', 'aria-labelledby'],
        forbidden: [],
        unique: true, // Only one main per page
      },
      dialog: {
        required: ['aria-label', 'aria-labelledby'], // At least one required
        optional: ['aria-describedby', 'aria-modal'],
        forbidden: [],
      },
      tablist: {
        required: [],
        optional: ['aria-label', 'aria-labelledby', 'aria-orientation'],
        forbidden: [],
      },
      tab: {
        required: ['aria-selected'],
        optional: ['aria-controls', 'aria-describedby', 'aria-setsize', 'aria-posinset'],
        forbidden: [],
      },
      tabpanel: {
        required: [],
        optional: ['aria-labelledby', 'aria-describedby'],
        forbidden: [],
      },
      listbox: {
        required: [],
        optional: ['aria-label', 'aria-labelledby', 'aria-multiselectable', 'aria-orientation'],
        forbidden: [],
      },
      option: {
        required: ['aria-selected'],
        optional: ['aria-describedby', 'aria-setsize', 'aria-posinset'],
        forbidden: [],
      },
      alert: {
        required: [],
        optional: ['aria-label', 'aria-labelledby', 'aria-describedby'],
        forbidden: [],
        liveRegion: 'assertive',
      },
      status: {
        required: [],
        optional: ['aria-label', 'aria-labelledby', 'aria-describedby'],
        forbidden: [],
        liveRegion: 'polite',
      },
    },
    
    // Live region settings
    liveRegions: {
      polite: ['status', 'log'],
      assertive: ['alert'],
      off: ['presentation', 'none'],
    },
    
    // States and properties validation
    states: {
      'aria-expanded': ['true', 'false'],
      'aria-selected': ['true', 'false'],
      'aria-checked': ['true', 'false', 'mixed'],
      'aria-pressed': ['true', 'false', 'mixed'],
      'aria-hidden': ['true', 'false'],
      'aria-disabled': ['true', 'false'],
      'aria-invalid': ['true', 'false', 'grammar', 'spelling'],
      'aria-current': ['page', 'step', 'location', 'date', 'time', 'true', 'false'],
    },
  },

  /**
   * Keyboard navigation requirements
   */
  keyboard: {
    // Standard key mappings
    keys: {
      activation: ['Enter', 'Space'],
      navigation: ['Tab', 'Shift+Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
      escape: ['Escape'],
      home: ['Home', 'Ctrl+Home'],
      end: ['End', 'Ctrl+End'],
      pageNavigation: ['PageUp', 'PageDown'],
    },
    
    // Focus management requirements
    focus: {
      visibleIndicator: true,
      minimumWidth: 2, // px
      minimumOffset: 2, // px
      respectSystemPreferences: true,
    },
    
    // Tabindex best practices
    tabindex: {
      avoidPositive: true, // Avoid positive tabindex values
      allowedValues: [-1, 0], // Only -1 and 0 are recommended
    },
    
    // Keyboard trap prevention
    traps: {
      allowedContexts: ['modal', 'dialog', 'menu'],
      escapeRequired: true,
    },
  },

  /**
   * Screen reader compatibility
   */
  screenReader: {
    // Supported screen readers for testing
    supportedReaders: [
      'NVDA', 'JAWS', 'VoiceOver', 'TalkBack', 'Orca'
    ],
    
    // Content structure requirements
    structure: {
      headingHierarchy: true,
      landmarkRoles: true,
      skipLinks: true,
      pageTitle: true,
    },
    
    // Announcement requirements
    announcements: {
      stateChanges: true,
      dynamicContent: true,
      errors: true,
      loading: true,
    },
    
    // Text alternatives
    textAlternatives: {
      images: 'required',
      decorativeImages: 'empty-alt-or-aria-hidden',
      complexImages: 'long-description',
      icons: 'aria-label-or-text',
    },
  },

  /**
   * Form accessibility requirements
   */
  forms: {
    // Label requirements
    labels: {
      required: true,
      methods: ['label-for', 'aria-label', 'aria-labelledby'],
      placeholder: 'not-sufficient', // Placeholder alone is not sufficient
    },
    
    // Error handling
    errors: {
      identification: 'required',
      description: 'required',
      suggestion: 'recommended',
      liveRegion: 'assertive',
    },
    
    // Required field indication
    required: {
      indication: 'required',
      methods: ['aria-required', 'required-attribute', 'visual-indicator'],
    },
    
    // Grouping
    grouping: {
      fieldsets: 'recommended',
      legends: 'required-for-fieldsets',
      sections: 'aria-labelledby',
    },
  },

  /**
   * Image accessibility requirements
   */
  images: {
    // Alt text requirements
    altText: {
      informative: 'descriptive',
      decorative: 'empty',
      functional: 'purpose',
      complex: 'summary-plus-details',
    },
    
    // Forbidden alt text patterns
    forbiddenAltPatterns: [
      /image of/i,
      /picture of/i,
      /photo of/i,
      /graphic of/i,
      /icon of/i,
    ],
    
    // Context requirements
    context: {
      captionWhenNeeded: true,
      longDescriptionForComplex: true,
      textAlternativeInContext: true,
    },
  },

  /**
   * Color and visual design requirements
   */
  visual: {
    // Color usage
    color: {
      notSoleIndicator: true,
      contrastCompliance: 'AA',
      colorBlindnessSupport: true,
    },
    
    // Typography
    typography: {
      minimumSize: 12, // pt
      lineHeight: 1.5, // minimum
      characterSpacing: 0.12, // em
      wordSpacing: 0.16, // em
      paragraphSpacing: 2.0, // em
    },
    
    // Layout
    layout: {
      responsiveDesign: true,
      zoomSupport: 200, // percent
      orientationSupport: ['portrait', 'landscape'],
    },
  },

  /**
   * Testing tools configuration
   */
  tools: {
    // Automated testing tools
    automated: {
      axeCore: {
        version: '4.x',
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
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
          exclude: [
            'color-contrast-enhanced', // Testing AA, not AAA
          ],
        },
      },
      
      lighthouse: {
        accessibility: {
          threshold: 95, // Minimum score
          audits: [
            'accesskeys',
            'aria-allowed-attr',
            'aria-command-name',
            'aria-hidden-body',
            'aria-hidden-focus',
            'aria-input-field-name',
            'aria-meter-name',
            'aria-progressbar-name',
            'aria-required-attr',
            'aria-required-children',
            'aria-required-parent',
            'aria-roles',
            'aria-toggle-field-name',
            'aria-tooltip-name',
            'aria-valid-attr',
            'aria-valid-attr-value',
            'button-name',
            'bypass',
            'color-contrast',
            'definition-list',
            'dlitem',
            'document-title',
            'duplicate-id-active',
            'duplicate-id-aria',
            'form-field-multiple-labels',
            'frame-title',
            'heading-order',
            'html-has-lang',
            'html-lang-valid',
            'image-alt',
            'input-image-alt',
            'label',
            'landmark-one-main',
            'link-name',
            'list',
            'listitem',
            'meta-refresh',
            'meta-viewport',
            'object-alt',
            'tabindex',
            'table-fake-caption',
            'td-headers-attr',
            'th-has-data-cells',
            'valid-lang',
            'video-caption',
          ],
        },
      },
    },
    
    // Manual testing guidelines
    manual: {
      screenReader: {
        testWith: ['NVDA', 'VoiceOver'],
        scenarios: [
          'navigation-only',
          'forms-completion',
          'content-consumption',
          'interactive-elements',
        ],
      },
      
      keyboard: {
        scenarios: [
          'tab-navigation',
          'arrow-navigation',
          'escape-functionality',
          'activation-keys',
        ],
      },
      
      zoom: {
        levels: [200, 300, 400], // percent
        requirements: [
          'no-horizontal-scroll',
          'all-content-visible',
          'functionality-preserved',
        ],
      },
    },
  },

  /**
   * Component-specific accessibility requirements
   */
  components: {
    serviceCard: {
      role: 'article',
      heading: 'required',
      button: 'descriptive-name',
      stats: 'accessible-format',
    },
    
    metricsGrid: {
      role: 'region',
      label: 'required',
      metrics: 'accessible-format',
      animation: 'respectful',
    },
    
    heroSection: {
      heading: 'h1-required',
      search: 'labeled',
      landmark: 'banner-or-main',
    },
    
    faqAccordion: {
      buttons: 'aria-expanded',
      panels: 'aria-labelledby',
      keyboard: 'arrow-navigation',
    },
    
    navigation: {
      role: 'navigation',
      label: 'descriptive',
      current: 'aria-current',
      skipLink: 'recommended',
    },
  },

  /**
   * Error patterns to avoid
   */
  antiPatterns: {
    // Common accessibility mistakes
    common: [
      'click-here-links',
      'placeholder-as-label',
      'positive-tabindex',
      'missing-alt-text',
      'color-only-indication',
      'keyboard-traps',
      'focus-invisible',
      'empty-headings',
      'skipped-heading-levels',
      'missing-form-labels',
    ],
    
    // ARIA misuse
    aria: [
      'aria-label-on-div',
      'redundant-aria-roles',
      'invalid-aria-attributes',
      'aria-hidden-on-focusable',
      'missing-required-aria',
    ],
  },
} as const

/**
 * Helper functions for accessibility configuration
 */
export const getWCAGRequirement = (
  category: keyof typeof ACCESSIBILITY_CONFIG.wcag,
  requirement: string
) => {
  const categoryConfig = ACCESSIBILITY_CONFIG.wcag[category] as any
  return categoryConfig[requirement]
}

export const getARIARequirements = (role: string) => {
  return ACCESSIBILITY_CONFIG.aria.roleRequirements[role as keyof typeof ACCESSIBILITY_CONFIG.aria.roleRequirements]
}

export const getKeyboardRequirements = (context: string) => {
  return ACCESSIBILITY_CONFIG.keyboard[context as keyof typeof ACCESSIBILITY_CONFIG.keyboard]
}

export const getComponentRequirements = (component: string) => {
  return ACCESSIBILITY_CONFIG.components[component as keyof typeof ACCESSIBILITY_CONFIG.components]
}

export const validateColorContrast = (ratio: number, textSize: number, isBold: boolean = false): {
  isCompliant: boolean
  level: 'AA' | 'AAA' | 'fail'
  requirement: number
} => {
  const isLarge = textSize >= ACCESSIBILITY_CONFIG.wcag.textSize.large || 
                  (isBold && textSize >= ACCESSIBILITY_CONFIG.wcag.textSize.largeBold)
  
  const aaRequirement = isLarge ? 
    ACCESSIBILITY_CONFIG.wcag.colorContrast.large : 
    ACCESSIBILITY_CONFIG.wcag.colorContrast.normal
  
  const aaaRequirement = isLarge ? 4.5 : ACCESSIBILITY_CONFIG.wcag.colorContrast.enhanced
  
  let level: 'AA' | 'AAA' | 'fail'
  if (ratio >= aaaRequirement) {
    level = 'AAA'
  } else if (ratio >= aaRequirement) {
    level = 'AA'
  } else {
    level = 'fail'
  }

  return {
    isCompliant: ratio >= aaRequirement,
    level,
    requirement: aaRequirement,
  }
}

export default ACCESSIBILITY_CONFIG
