/**
 * Accessibility Testing Utilities
 * 
 * Utilities for comprehensive accessibility testing:
 * - WCAG 2.1 AA compliance validation
 * - Color contrast analysis
 * - Keyboard navigation testing
 * - Screen reader compatibility
 * - ARIA attribute validation
 * - Focus management testing
 */

/**
 * WCAG 2.1 AA compliance requirements
 */
export const WCAG_REQUIREMENTS = {
  colorContrast: {
    normal: 4.5, // Normal text
    large: 3.0, // Large text (18pt+ or 14pt+ bold)
    nonText: 3.0, // UI components and graphics
  },
  textSize: {
    large: 18, // pt
    largeBold: 14, // pt
  },
  touchTargets: {
    minimum: 44, // px (WCAG 2.1 SC 2.5.5)
    comfortable: 48, // px
  },
  timing: {
    maxAutoRefresh: 20, // hours
    sessionTimeout: 20, // hours minimum warning
  },
} as const

/**
 * ARIA roles and their required/optional attributes
 */
export const ARIA_REQUIREMENTS = {
  button: {
    required: [],
    optional: ['aria-pressed', 'aria-expanded', 'aria-describedby', 'aria-label'],
  },
  link: {
    required: [],
    optional: ['aria-describedby', 'aria-label'],
  },
  heading: {
    required: [],
    optional: ['aria-level', 'aria-describedby'],
  },
  region: {
    required: ['aria-label', 'aria-labelledby'],
    optional: ['aria-describedby'],
  },
  navigation: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  main: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  complementary: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  contentinfo: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  banner: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  search: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  form: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  dialog: {
    required: ['aria-label', 'aria-labelledby'],
    optional: ['aria-describedby', 'aria-modal'],
  },
  tablist: {
    required: [],
    optional: ['aria-label', 'aria-labelledby'],
  },
  tab: {
    required: ['aria-selected'],
    optional: ['aria-controls', 'aria-describedby'],
  },
  tabpanel: {
    required: [],
    optional: ['aria-labelledby', 'aria-describedby'],
  },
  listbox: {
    required: [],
    optional: ['aria-label', 'aria-labelledby', 'aria-multiselectable'],
  },
  option: {
    required: ['aria-selected'],
    optional: ['aria-describedby'],
  },
} as const

/**
 * Calculate color contrast ratio
 */
export const calculateContrastRatio = (foreground: string, background: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null
  }

  // Parse RGB string
  const rgbToValues = (rgb: string): { r: number; g: number; b: number } | null => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    return match ? {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    } : null
  }

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  let rgb1 = hexToRgb(foreground) || rgbToValues(foreground)
  let rgb2 = hexToRgb(background) || rgbToValues(background)

  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Validate color contrast compliance
 */
export const validateColorContrast = (
  foreground: string,
  background: string,
  fontSize: number = 16,
  isBold: boolean = false
): {
  ratio: number
  isCompliant: boolean
  level: 'AA' | 'AAA' | 'fail'
  requirement: number
} => {
  const ratio = calculateContrastRatio(foreground, background)
  
  // Determine if text is large
  const isLarge = fontSize >= WCAG_REQUIREMENTS.textSize.large || 
                  (isBold && fontSize >= WCAG_REQUIREMENTS.textSize.largeBold)
  
  const aaRequirement = isLarge ? WCAG_REQUIREMENTS.colorContrast.large : WCAG_REQUIREMENTS.colorContrast.normal
  const aaaRequirement = isLarge ? 4.5 : 7.0
  
  let level: 'AA' | 'AAA' | 'fail'
  if (ratio >= aaaRequirement) {
    level = 'AAA'
  } else if (ratio >= aaRequirement) {
    level = 'AA'
  } else {
    level = 'fail'
  }

  return {
    ratio,
    isCompliant: ratio >= aaRequirement,
    level,
    requirement: aaRequirement,
  }
}

/**
 * Validate touch target sizes
 */
export const validateTouchTargets = (element: HTMLElement): {
  isCompliant: boolean
  violations: Array<{
    element: string
    size: { width: number; height: number }
    required: number
  }>
} => {
  const violations: Array<{
    element: string
    size: { width: number; height: number }
    required: number
  }> = []

  // Find all interactive elements
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
  )

  interactiveElements.forEach((el) => {
    const rect = el.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(el as Element)
    
    const width = Math.max(rect.width, parseInt(computedStyle.minWidth) || 0)
    const height = Math.max(rect.height, parseInt(computedStyle.minHeight) || 0)
    
    if (width < WCAG_REQUIREMENTS.touchTargets.minimum || height < WCAG_REQUIREMENTS.touchTargets.minimum) {
      violations.push({
        element: `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}`,
        size: { width, height },
        required: WCAG_REQUIREMENTS.touchTargets.minimum,
      })
    }
  })

  return {
    isCompliant: violations.length === 0,
    violations,
  }
}

/**
 * Validate ARIA attributes
 */
export const validateAriaAttributes = (element: HTMLElement): {
  isValid: boolean
  violations: Array<{
    element: string
    issue: string
    severity: 'error' | 'warning'
  }>
} => {
  const violations: Array<{
    element: string
    issue: string
    severity: 'error' | 'warning'
  }> = []

  const elementsWithRoles = element.querySelectorAll('[role]')
  
  elementsWithRoles.forEach((el) => {
    const role = el.getAttribute('role')
    if (!role) return

    const elementDesc = `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}`
    
    // Check if role is valid
    if (!(role in ARIA_REQUIREMENTS)) {
      violations.push({
        element: elementDesc,
        issue: `Invalid ARIA role: ${role}`,
        severity: 'error',
      })
      return
    }

    const requirements = ARIA_REQUIREMENTS[role as keyof typeof ARIA_REQUIREMENTS]
    
    // Check required attributes
    requirements.required.forEach(attr => {
      if (!el.hasAttribute(attr)) {
        violations.push({
          element: elementDesc,
          issue: `Missing required ARIA attribute: ${attr}`,
          severity: 'error',
        })
      }
    })

    // Check for invalid ARIA attributes
    const ariaAttributes = Array.from(el.attributes).filter(attr => attr.name.startsWith('aria-'))
    ariaAttributes.forEach(attr => {
      if (!requirements.required.includes(attr.name) && !requirements.optional.includes(attr.name)) {
        violations.push({
          element: elementDesc,
          issue: `Invalid ARIA attribute for role ${role}: ${attr.name}`,
          severity: 'warning',
        })
      }
    })
  })

  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations,
  }
}

/**
 * Validate heading hierarchy
 */
export const validateHeadingHierarchy = (element: HTMLElement): {
  isValid: boolean
  violations: Array<{
    element: string
    level: number
    issue: string
  }>
} => {
  const violations: Array<{
    element: string
    level: number
    issue: string
  }> = []

  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let previousLevel = 0

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    const elementDesc = `${heading.tagName.toLowerCase()}${heading.className ? '.' + heading.className.split(' ').join('.') : ''}`

    // Check for skipped levels
    if (level > previousLevel + 1) {
      violations.push({
        element: elementDesc,
        level,
        issue: `Heading level skipped from h${previousLevel} to h${level}`,
      })
    }

    // Check for empty headings
    if (!heading.textContent?.trim()) {
      violations.push({
        element: elementDesc,
        level,
        issue: 'Heading is empty',
      })
    }

    previousLevel = level
  })

  return {
    isValid: violations.length === 0,
    violations,
  }
}

/**
 * Validate form accessibility
 */
export const validateFormAccessibility = (element: HTMLElement): {
  isValid: boolean
  violations: Array<{
    element: string
    issue: string
    severity: 'error' | 'warning'
  }>
} => {
  const violations: Array<{
    element: string
    issue: string
    severity: 'error' | 'warning'
  }> = []

  // Check form controls
  const formControls = element.querySelectorAll('input, select, textarea')
  
  formControls.forEach((control) => {
    const elementDesc = `${control.tagName.toLowerCase()}${control.className ? '.' + control.className.split(' ').join('.') : ''}`
    
    // Check for labels
    const id = control.getAttribute('id')
    const ariaLabel = control.getAttribute('aria-label')
    const ariaLabelledby = control.getAttribute('aria-labelledby')
    
    let hasLabel = false
    
    if (id) {
      const label = element.querySelector(`label[for="${id}"]`)
      if (label) hasLabel = true
    }
    
    if (ariaLabel || ariaLabelledby) hasLabel = true
    
    if (!hasLabel) {
      violations.push({
        element: elementDesc,
        issue: 'Form control missing accessible label',
        severity: 'error',
      })
    }

    // Check for required field indication
    if (control.hasAttribute('required')) {
      const hasRequiredIndication = 
        control.getAttribute('aria-required') === 'true' ||
        control.getAttribute('aria-label')?.includes('required') ||
        control.getAttribute('aria-describedby')
      
      if (!hasRequiredIndication) {
        violations.push({
          element: elementDesc,
          issue: 'Required field not properly indicated',
          severity: 'warning',
        })
      }
    }
  })

  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations,
  }
}

/**
 * Validate keyboard navigation
 */
export const validateKeyboardNavigation = (element: HTMLElement): {
  isValid: boolean
  violations: Array<{
    element: string
    issue: string
  }>
} => {
  const violations: Array<{
    element: string
    issue: string
  }> = []

  // Check for keyboard traps
  const focusableElements = element.querySelectorAll(
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  focusableElements.forEach((el) => {
    const elementDesc = `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''}`
    
    // Check tabindex values
    const tabindex = el.getAttribute('tabindex')
    if (tabindex && parseInt(tabindex) > 0) {
      violations.push({
        element: elementDesc,
        issue: 'Positive tabindex values should be avoided',
      })
    }

    // Check for click handlers without keyboard support
    const hasClickHandler = el.getAttribute('onclick') || 
                           (el as any).onclick ||
                           el.hasAttribute('data-click')
    
    if (hasClickHandler && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      const hasKeyboardHandler = el.getAttribute('onkeydown') ||
                                el.getAttribute('onkeyup') ||
                                el.getAttribute('onkeypress') ||
                                (el as any).onkeydown ||
                                (el as any).onkeyup ||
                                (el as any).onkeypress
      
      if (!hasKeyboardHandler) {
        violations.push({
          element: elementDesc,
          issue: 'Click handler without keyboard support',
        })
      }
    }
  })

  return {
    isValid: violations.length === 0,
    violations,
  }
}

/**
 * Validate image accessibility
 */
export const validateImageAccessibility = (element: HTMLElement): {
  isValid: boolean
  violations: Array<{
    element: string
    issue: string
    severity: 'error' | 'warning'
  }>
} => {
  const violations: Array<{
    element: string
    issue: string
    severity: 'error' | 'warning'
  }> = []

  const images = element.querySelectorAll('img')
  
  images.forEach((img) => {
    const elementDesc = `img${img.className ? '.' + img.className.split(' ').join('.') : ''}`
    
    const alt = img.getAttribute('alt')
    const ariaLabel = img.getAttribute('aria-label')
    const ariaLabelledby = img.getAttribute('aria-labelledby')
    const role = img.getAttribute('role')
    
    // Check for alt text
    if (alt === null && !ariaLabel && !ariaLabelledby && role !== 'presentation') {
      violations.push({
        element: elementDesc,
        issue: 'Image missing alt text',
        severity: 'error',
      })
    }

    // Check for redundant alt text
    if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture') || alt.toLowerCase().includes('photo'))) {
      violations.push({
        element: elementDesc,
        issue: 'Alt text should not include "image", "picture", or "photo"',
        severity: 'warning',
      })
    }

    // Check for empty alt on decorative images
    if (alt === '' && role !== 'presentation') {
      violations.push({
        element: elementDesc,
        issue: 'Decorative images should have role="presentation" or aria-hidden="true"',
        severity: 'warning',
      })
    }
  })

  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations,
  }
}

/**
 * Create accessibility test suite
 */
export const createAccessibilityTestSuite = (
  suiteName: string,
  testFn: () => void | Promise<void>
) => {
  describe(`${suiteName} - Accessibility Tests`, () => {
    testFn()
  })
}

export default {
  WCAG_REQUIREMENTS,
  ARIA_REQUIREMENTS,
  calculateContrastRatio,
  validateColorContrast,
  validateTouchTargets,
  validateAriaAttributes,
  validateHeadingHierarchy,
  validateFormAccessibility,
  validateKeyboardNavigation,
  validateImageAccessibility,
  createAccessibilityTestSuite,
}
