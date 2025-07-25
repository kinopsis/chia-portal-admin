/**
 * Accessibility Utilities
 * 
 * Utilities for improving accessibility including:
 * - ARIA attributes management
 * - Keyboard navigation
 * - Screen reader support
 * - Focus management
 * - Color contrast checking
 */

/**
 * Generate unique IDs for ARIA attributes
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ARIA attributes helpers
 */
export const aria = {
  /**
   * Create ARIA labelledby attribute
   */
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),

  /**
   * Create ARIA describedby attribute
   */
  describedBy: (id: string) => ({ 'aria-describedby': id }),

  /**
   * Create ARIA expanded attribute
   */
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),

  /**
   * Create ARIA selected attribute
   */
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),

  /**
   * Create ARIA checked attribute
   */
  checked: (isChecked: boolean | 'mixed') => ({ 'aria-checked': isChecked }),

  /**
   * Create ARIA disabled attribute
   */
  disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled }),

  /**
   * Create ARIA hidden attribute
   */
  hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),

  /**
   * Create ARIA live region attributes
   */
  live: (politeness: 'polite' | 'assertive' | 'off' = 'polite') => ({
    'aria-live': politeness,
    'aria-atomic': 'true',
  }),

  /**
   * Create ARIA controls attribute
   */
  controls: (id: string) => ({ 'aria-controls': id }),

  /**
   * Create ARIA owns attribute
   */
  owns: (id: string) => ({ 'aria-owns': id }),

  /**
   * Create ARIA current attribute
   */
  current: (current: 'page' | 'step' | 'location' | 'date' | 'time' | boolean) => ({
    'aria-current': current,
  }),
}

/**
 * Keyboard navigation utilities
 */
export const keyboard = {
  /**
   * Handle arrow key navigation
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: {
      loop?: boolean
      orientation?: 'horizontal' | 'vertical' | 'both'
    } = {}
  ): number => {
    const { loop = true, orientation = 'both' } = options
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex + 1
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1
          }
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex - 1
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0
          }
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex + 1
          if (newIndex >= items.length) {
            newIndex = loop ? 0 : items.length - 1
          }
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex - 1
          if (newIndex < 0) {
            newIndex = loop ? items.length - 1 : 0
          }
        }
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
    }

    return newIndex
  },

  /**
   * Handle tab trapping within a container
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  },

  /**
   * Check if key is activation key (Enter or Space)
   */
  isActivationKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' '
  },
}

/**
 * Focus management utilities
 */
export const focus = {
  /**
   * Set focus with optional delay
   */
  set: (element: HTMLElement, delay: number = 0): void => {
    if (delay > 0) {
      setTimeout(() => element.focus(), delay)
    } else {
      element.focus()
    }
  },

  /**
   * Save and restore focus
   */
  saveAndRestore: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement
    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus()
      }
    }
  },

  /**
   * Find first focusable element
   */
  findFirst: (container: HTMLElement): HTMLElement | null => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    return focusableElements[0] || null
  },

  /**
   * Check if element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ]
    return focusableSelectors.some(selector => element.matches(selector))
  },
}

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Announce message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },

  /**
   * Create screen reader only text
   */
  onlyText: (text: string): React.ReactElement => {
    return React.createElement('span', { className: 'sr-only' }, text)
  },
}

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    // This is a simplified version - in production, you'd want a more robust color parser
    const hex1 = color1.replace('#', '')
    const hex2 = color2.replace('#', '')

    const r1 = parseInt(hex1.substr(0, 2), 16)
    const g1 = parseInt(hex1.substr(2, 2), 16)
    const b1 = parseInt(hex1.substr(4, 2), 16)

    const r2 = parseInt(hex2.substr(0, 2), 16)
    const g2 = parseInt(hex2.substr(2, 2), 16)
    const b2 = parseInt(hex2.substr(4, 2), 16)

    const lum1 = colorContrast.getLuminance(r1, g1, b1)
    const lum2 = colorContrast.getLuminance(r2, g2, b2)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsWCAG: (
    color1: string,
    color2: string,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean => {
    const ratio = colorContrast.getContrastRatio(color1, color2)
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5
    }
  },
}

/**
 * Reduced motion utilities
 */
export const reducedMotion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReduced: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Apply animation only if motion is not reduced
   */
  conditionalAnimation: (
    element: HTMLElement,
    animation: string,
    fallback?: string
  ): void => {
    if (reducedMotion.prefersReduced()) {
      if (fallback) {
        element.style.animation = fallback
      }
    } else {
      element.style.animation = animation
    }
  },
}

/**
 * Initialize accessibility features
 */
export const initializeAccessibility = (): void => {
  if (typeof window === 'undefined') return

  // Add focus-visible polyfill behavior
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-navigation')
    }
  })

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation')
  })

  // Add reduced motion class
  if (reducedMotion.prefersReduced()) {
    document.documentElement.classList.add('reduce-motion')
  }

  // Monitor for changes in motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  })
}

export default {
  generateId,
  aria,
  keyboard,
  focus,
  screenReader,
  colorContrast,
  reducedMotion,
  initializeAccessibility,
}
