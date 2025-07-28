/**
 * Responsive Testing Utilities
 * 
 * Utilities for testing responsive design across different breakpoints:
 * - Viewport simulation
 * - Breakpoint testing
 * - Touch target validation
 * - Visual regression helpers
 */

import { act } from '@testing-library/react'

/**
 * Breakpoint definitions matching our CSS system
 */
export const BREAKPOINTS = {
  mobile: {
        max: 639,
    name: 'mobile',
  },
  tablet: {
        max: 1023,
    name: 'tablet',
  },
  desktop: {
        max: 1920,
    name: 'desktop',
  },
} as const

/**
 * Common viewport sizes for testing
 */
export const VIEWPORT_SIZES = {
  // Mobile devices
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 12 Pro Max': { width: 428, height: 926 },
  'Samsung Galaxy S21': { width: 360, height: 800 },
  'Mobile Small': { width: 320, height: 568 },
  
  // Tablet devices
  'iPad': { width: 768, height: 1024 },
  'iPad Pro': { width: 1024, height: 1366 },
  'Surface Pro': { width: 912, height: 1368 },
  'Tablet Portrait': { width: 640, height: 960 },
  'Tablet Landscape': { width: 960, height: 640 },
  
  // Desktop sizes
  'Desktop Small': { width: 1024, height: 768 },
  'Desktop Medium': { width: 1280, height: 720 },
  'Desktop Large': { width: 1440, height: 900 },
  'Desktop XL': { width: 1920, height: 1080 },
  'Desktop 4K': { width: 2560, height: 1440 },
} as const

export type ViewportSize = keyof typeof VIEWPORT_SIZES
export type BreakpointName = keyof typeof BREAKPOINTS

/**
 * Set viewport size for testing
 */
export const setViewportSize = (width: number, height: number): void => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  
  // Trigger resize event
  act(() => {
    window.dispatchEvent(new Event('resize'))
  })
}

/**
 * Set viewport to predefined size
 */
export const setViewport = (size: ViewportSize): void => {
  const { width, height } = VIEWPORT_SIZES[size]
  setViewportSize(width, height)
}

/**
 * Get breakpoint for given width
 */
export const getBreakpoint = (width: number): BreakpointName => {
  if (width >= BREAKPOINTS.desktop.min) return 'desktop'
  if (width >= BREAKPOINTS.tablet.min) return 'tablet'
  return 'mobile'
}

/**
 * Test helper to run tests across multiple viewports
 */
export const testAcrossViewports = (
  testFn: (viewport: ViewportSize, breakpoint: BreakpointName) => void,
  viewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
): void => {
  viewports.forEach((viewport) => {
    const { width } = VIEWPORT_SIZES[viewport]
    const breakpoint = getBreakpoint(width)
    
    describe(`at ${viewport} (${width}px - ${breakpoint})`, () => {
      beforeEach(() => {
        setViewport(viewport)
      })
      
      testFn(viewport, breakpoint)
    })
  })
}

/**
 * Mock matchMedia for responsive testing
 */
export const mockMatchMedia = (width: number): void => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => {
      // Parse media query to determine if it matches
      const matches = (() => {
        if (query.includes('min-width: 1024px')) return width >= 1024
        if (query.includes('min-width: 640px')) return width >= 640
        if (query.includes('max-width: 639px')) return width <= 639
        if (query.includes('max-width: 1023px')) return width <= 1023
        if (query.includes('prefers-reduced-motion: reduce')) return false
        if (query.includes('prefers-color-scheme: dark')) return false
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
 * Validate touch target sizes (WCAG 2.1 SC 2.5.5)
 */
export const validateTouchTargets = (element: HTMLElement): {
  isValid: boolean
  violations: string[]
} => {
  const violations: string[] = []
  const minSize = 44 // 44px minimum touch target size
  
  // Find all interactive elements
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
  )
  
  interactiveElements.forEach((el) => {
    const rect = el.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(el as Element)
    
    const width = Math.max(rect.width, parseInt(computedStyle.minWidth) || 0)
    const height = Math.max(rect.height, parseInt(computedStyle.minHeight) || 0)
    
    if (width < minSize || height < minSize) {
      violations.push(
        `Element ${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ').join('.') : ''} ` +
        `has insufficient touch target size: ${width}x${height}px (minimum: ${minSize}x${minSize}px)`
      )
    }
  })
  
  return {
    isValid: violations.length === 0,
    violations,
  }
}

/**
 * Check if element is visible in viewport
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  )
}

/**
 * Get computed grid columns for an element
 */
export const getGridColumns = (element: HTMLElement): number => {
  const computedStyle = window.getComputedStyle(element)
  const gridTemplateColumns = computedStyle.gridTemplateColumns
  
  if (gridTemplateColumns === 'none') return 1
  
  // Count the number of column definitions
  const columns = gridTemplateColumns.split(' ').filter(col => col !== 'none')
  return columns.length
}

/**
 * Validate responsive grid layout
 */
export const validateGridLayout = (
  element: HTMLElement,
  expectedColumns: { mobile: number; tablet: number; desktop: number }
): { isValid: boolean; actual: number; expected: number } => {
  const width = window.innerWidth
  const breakpoint = getBreakpoint(width)
  const expected = expectedColumns[breakpoint]
  const actual = getGridColumns(element)
  
  return {
    isValid: actual === expected,
    actual,
    expected,
  }
}

/**
 * Check typography scaling
 */
export const validateTypographyScaling = (element: HTMLElement): {
  fontSize: string
  lineHeight: string
  isReadable: boolean
} => {
  const computedStyle = window.getComputedStyle(element)
  const fontSize = computedStyle.fontSize
  const lineHeight = computedStyle.lineHeight
  
  // Basic readability check (font size should be at least 16px on mobile)
  const fontSizeValue = parseInt(fontSize)
  const width = window.innerWidth
  const isReadable = width < 640 ? fontSizeValue >= 16 : fontSizeValue >= 14
  
  return {
    fontSize,
    lineHeight,
    isReadable,
  }
}

/**
 * Simulate touch events for mobile testing
 */
export const simulateTouch = {
  start: (element: HTMLElement, x: number = 0, y: number = 0) => {
    const touchEvent = new TouchEvent('touchstart', {
      touches: [new Touch({
        identifier: 1,
        target: element,
        clientX: x,
        clientY: y,
      })],
      bubbles: true,
      cancelable: true,
    })
    element.dispatchEvent(touchEvent)
  },
  
  move: (element: HTMLElement, x: number = 0, y: number = 0) => {
    const touchEvent = new TouchEvent('touchmove', {
      touches: [new Touch({
        identifier: 1,
        target: element,
        clientX: x,
        clientY: y,
      })],
      bubbles: true,
      cancelable: true,
    })
    element.dispatchEvent(touchEvent)
  },
  
  end: (element: HTMLElement) => {
    const touchEvent = new TouchEvent('touchend', {
      touches: [],
      bubbles: true,
      cancelable: true,
    })
    element.dispatchEvent(touchEvent)
  },
}

/**
 * Wait for CSS transitions to complete
 */
export const waitForTransition = (duration: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * Reset viewport to default for cleanup
 */
export const resetViewport = (): void => {
  setViewportSize(1024, 768)
}

/**
 * Create responsive test suite helper
 */
export const createResponsiveTestSuite = (
  suiteName: string,
  testFn: (viewport: ViewportSize, breakpoint: BreakpointName) => void,
  viewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
) => {
  describe(`${suiteName} - Responsive Tests`, () => {
    afterEach(() => {
      resetViewport()
    })
    
    testAcrossViewports(testFn, viewports)
  })
}

export default {
  BREAKPOINTS,
  VIEWPORT_SIZES,
  setViewportSize,
  setViewport,
  getBreakpoint,
  testAcrossViewports,
  mockMatchMedia,
  validateTouchTargets,
  isElementInViewport,
  getGridColumns,
  validateGridLayout,
  validateTypographyScaling,
  simulateTouch,
  waitForTransition,
  resetViewport,
  createResponsiveTestSuite,
}
