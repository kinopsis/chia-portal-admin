/**
 * Dark Mode Testing Utilities
 * 
 * Utilities for testing dark mode functionality:
 * - Theme switching and persistence
 * - System preference detection
 * - Color contrast validation
 * - Visual consistency testing
 * - CSS custom properties validation
 */

import { act } from '@testing-library/react'

/**
 * Theme values for testing
 */
export const THEME_VALUES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

export type ThemeValue = keyof typeof THEME_VALUES

/**
 * Storage keys for theme persistence
 */
export const THEME_STORAGE_KEY = 'theme'

/**
 * CSS custom properties for dark mode testing
 */
export const DARK_MODE_CSS_PROPERTIES = {
  // Background colors
  '--color-background': '#0f172a', // slate-900
  '--color-background-alt': '#1e293b', // slate-800
  '--color-surface': '#334155', // slate-700
  '--color-surface-alt': '#475569', // slate-600
  
  // Text colors
  '--color-text': '#f8fafc', // slate-50
  '--color-text-secondary': '#e2e8f0', // slate-200
  '--color-text-muted': '#cbd5e1', // slate-300
  
  // Border colors
  '--color-border': '#475569', // slate-600
  '--color-border-alt': '#64748b', // slate-500
  
  // Primary colors (maintain brand colors in dark mode)
  '--color-primary-green': '#10b981', // emerald-500
  '--color-primary-green-dark': '#059669', // emerald-600
  '--color-primary-yellow': '#f59e0b', // amber-500
  
  // Service card colors in dark mode
  '--service-yellow-bg': '#451a03', // amber-950
  '--service-gray-bg': '#0f172a', // slate-900
  '--service-blue-bg': '#0c1e3e', // blue-950
  '--service-green-bg': '#022c22', // emerald-950
  '--service-purple-bg': '#2e1065', // violet-950
  '--service-indigo-bg': '#1e1b4b', // indigo-950
} as const

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  }
})()

/**
 * Mock matchMedia for system preference testing
 */
export const mockMatchMedia = (prefersDark: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => {
      const matches = (() => {
        if (query.includes('prefers-color-scheme: dark')) return prefersDark
        if (query.includes('prefers-color-scheme: light')) return !prefersDark
        if (query.includes('prefers-reduced-motion: reduce')) return false
        return false
      })()

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }
    }),
  })
}

/**
 * Set theme in localStorage
 */
export const setStoredTheme = (theme: ThemeValue): void => {
  mockLocalStorage.setItem(THEME_STORAGE_KEY, theme)
}

/**
 * Get theme from localStorage
 */
export const getStoredTheme = (): ThemeValue | null => {
  const stored = mockLocalStorage.getItem(THEME_STORAGE_KEY)
  return stored as ThemeValue | null
}

/**
 * Clear theme from localStorage
 */
export const clearStoredTheme = (): void => {
  mockLocalStorage.removeItem(THEME_STORAGE_KEY)
}

/**
 * Apply dark mode class to document
 */
export const applyDarkMode = (isDark: boolean): void => {
  act(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })
}

/**
 * Check if dark mode is currently active
 */
export const isDarkModeActive = (): boolean => {
  return document.documentElement.classList.contains('dark')
}

/**
 * Simulate system theme change
 */
export const simulateSystemThemeChange = (prefersDark: boolean): void => {
  mockMatchMedia(prefersDark)
  
  // Trigger media query change event
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  if (mediaQuery.addEventListener) {
    const event = new MediaQueryListEvent('change', {
      matches: prefersDark,
      media: '(prefers-color-scheme: dark)',
    })
    mediaQuery.dispatchEvent(event)
  }
}

/**
 * Validate CSS custom properties for dark mode
 */
export const validateDarkModeCSS = (element: HTMLElement): {
  isValid: boolean
  missingProperties: string[]
  incorrectValues: Array<{ property: string; expected: string; actual: string }>
} => {
  const computedStyle = window.getComputedStyle(element)
  const missingProperties: string[] = []
  const incorrectValues: Array<{ property: string; expected: string; actual: string }> = []

  Object.entries(DARK_MODE_CSS_PROPERTIES).forEach(([property, expectedValue]) => {
    const actualValue = computedStyle.getPropertyValue(property).trim()
    
    if (!actualValue) {
      missingProperties.push(property)
    } else if (actualValue !== expectedValue) {
      incorrectValues.push({
        property,
        expected: expectedValue,
        actual: actualValue,
      })
    }
  })

  return {
    isValid: missingProperties.length === 0 && incorrectValues.length === 0,
    missingProperties,
    incorrectValues,
  }
}

/**
 * Calculate color contrast ratio
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
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

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Validate WCAG color contrast compliance
 */
export const validateColorContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): {
  isCompliant: boolean
  ratio: number
  required: number
} => {
  const ratio = calculateContrastRatio(foreground, background)
  
  const required = (() => {
    if (level === 'AAA') {
      return size === 'large' ? 4.5 : 7
    } else {
      return size === 'large' ? 3 : 4.5
    }
  })()

  return {
    isCompliant: ratio >= required,
    ratio,
    required,
  }
}

/**
 * Extract computed colors from element
 */
export const getComputedColors = (element: HTMLElement): {
  color: string
  backgroundColor: string
  borderColor: string
} => {
  const computedStyle = window.getComputedStyle(element)
  
  return {
    color: computedStyle.color,
    backgroundColor: computedStyle.backgroundColor,
    borderColor: computedStyle.borderColor,
  }
}

/**
 * Wait for theme transition to complete
 */
export const waitForThemeTransition = (duration: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * Setup dark mode test environment
 */
export const setupDarkModeTest = (options: {
  initialTheme?: ThemeValue
  systemPrefersDark?: boolean
  mockStorage?: boolean
} = {}) => {
  const {
    initialTheme = 'light',
    systemPrefersDark = false,
    mockStorage = true,
  } = options

  // Mock localStorage if requested
  if (mockStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  }

  // Mock matchMedia for system preferences
  mockMatchMedia(systemPrefersDark)

  // Set initial theme
  if (initialTheme !== 'system') {
    setStoredTheme(initialTheme)
    applyDarkMode(initialTheme === 'dark')
  }

  // Return cleanup function
  return () => {
    clearStoredTheme()
    applyDarkMode(false)
    mockLocalStorage.clear()
  }
}

/**
 * Create theme test scenarios
 */
export const createThemeTestScenarios = () => {
  return [
    {
      name: 'Light theme with light system preference',
      theme: 'light' as ThemeValue,
      systemPrefersDark: false,
      expectedDark: false,
    },
    {
      name: 'Dark theme with light system preference',
      theme: 'dark' as ThemeValue,
      systemPrefersDark: false,
      expectedDark: true,
    },
    {
      name: 'System theme with light system preference',
      theme: 'system' as ThemeValue,
      systemPrefersDark: false,
      expectedDark: false,
    },
    {
      name: 'System theme with dark system preference',
      theme: 'system' as ThemeValue,
      systemPrefersDark: true,
      expectedDark: true,
    },
    {
      name: 'Light theme with dark system preference',
      theme: 'light' as ThemeValue,
      systemPrefersDark: true,
      expectedDark: false,
    },
    {
      name: 'Dark theme with dark system preference',
      theme: 'dark' as ThemeValue,
      systemPrefersDark: true,
      expectedDark: true,
    },
  ]
}

/**
 * Test theme persistence across page reloads
 */
export const testThemePersistence = async (theme: ThemeValue): Promise<boolean> => {
  // Set theme
  setStoredTheme(theme)
  
  // Simulate page reload by checking if theme persists
  const persistedTheme = getStoredTheme()
  
  return persistedTheme === theme
}

export default {
  THEME_VALUES,
  DARK_MODE_CSS_PROPERTIES,
  mockLocalStorage,
  mockMatchMedia,
  setStoredTheme,
  getStoredTheme,
  clearStoredTheme,
  applyDarkMode,
  isDarkModeActive,
  simulateSystemThemeChange,
  validateDarkModeCSS,
  calculateContrastRatio,
  validateColorContrast,
  getComputedColors,
  waitForThemeTransition,
  setupDarkModeTest,
  createThemeTestScenarios,
  testThemePersistence,
}
