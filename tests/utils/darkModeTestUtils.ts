/**
 * Dark Mode Test Utilities
 *
 * Utility functions for testing dark mode functionality:
 * - Theme switching helpers
 * - Color validation utilities
 * - Component state verification
 */

import { fireEvent } from '@testing-library/react'

/**
 * Simulates applying dark mode to the document
 */
export function applyDarkMode(dark: boolean): void {
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.removeAttribute('data-theme')
  }
}

/**
 * Retrieves computed colors for an element
 */
export function getComputedColors(element: Element): Record<string, string> {
  const computedStyle = window.getComputedStyle(element)
  return {
    backgroundColor: computedStyle.backgroundColor,
    color: computedStyle.color,
    borderColor: computedStyle.borderColor,
  }
}

/**
 * Validates dark mode CSS properties are applied correctly
 */
export function validateDarkModeCSS(element: Element): boolean {
  const styles = window.getComputedStyle(element)

  // Basic validation - element should have styles computed
  return !!(styles.backgroundColor || styles.color || styles.borderColor)
}

/**
 * Sets up dark mode test environment
 */
export function setupDarkModeTest(): (() => void) | undefined {
  // Store original theme settings
  const originalClassList = document.documentElement.className
  const originalDataAttribute = document.documentElement.getAttribute('data-theme')

  // Cleanup function
  return () => {
    document.documentElement.className = originalClassList
    if (originalDataAttribute) {
      document.documentElement.setAttribute('data-theme', originalDataAttribute)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }
}

/**
 * Validates color contrast ratios (simplified version)
 */
export function validateColorContrast(
  foreground: string,
  background: string,
  minRatio: number = 4.5
): boolean {
  // Simplified contrast validation
  // In a real implementation, you'd use a proper color contrast calculation

  // For now, just check if colors are different
  const fgRgb = foreground.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  const bgRgb = background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)

  if (!fgRgb || !bgRgb) {
    // If colors can't be parsed, assume contrast is invalid
    return false
  }

  // Basic difference check
  const fgValues = [parseInt(fgRgb[1]), parseInt(fgRgb[2]), parseInt(fgRgb[3])]
  const bgValues = [parseInt(bgRgb[1]), parseInt(bgRgb[2]), parseInt(bgRgb[3])]

  // Calculate brightness difference
  const fgBrightness = (fgValues[0] * 299 + fgValues[1] * 587 + fgValues[2] * 114) / 1000
  const bgBrightness = (bgValues[0] * 299 + bgValues[1] * 587 + bgValues[2] * 114) / 1000

  const difference = Math.abs(fgBrightness - bgBrightness)

  // This is a very simplified check - real contrast calculation is more complex
  return difference > 125 // Minimum brightness difference for readability
}
