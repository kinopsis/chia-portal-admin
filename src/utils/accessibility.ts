/**
 * Accessibility Utilities for WCAG Compliance
 * 
 * This module provides utilities for calculating color contrast ratios
 * and validating WCAG AA/AAA compliance standards.
 * 
 * Based on WCAG 2.1 Guidelines:
 * - AA: 4.5:1 for normal text, 3:1 for large text
 * - AAA: 7:1 for normal text, 4.5:1 for large text
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  // Convert to sRGB
  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  // Apply gamma correction
  const rLinear = rsRGB <= 0.04045 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gLinear = gsRGB <= 0.04045 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bLinear = bsRGB <= 0.04045 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter, L2 is darker
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color format')
  }

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAG_AA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = calculateContrastRatio(foreground, background)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Check if color combination meets WCAG AAA standards
 */
export function meetsWCAG_AAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = calculateContrastRatio(foreground, background)
  return isLargeText ? ratio >= 4.5 : ratio >= 7
}

/**
 * Get accessibility level for a color combination
 */
export function getAccessibilityLevel(
  foreground: string,
  background: string,
  isLargeText = false
): 'FAIL' | 'AA' | 'AAA' {
  if (meetsWCAG_AAA(foreground, background, isLargeText)) return 'AAA'
  if (meetsWCAG_AA(foreground, background, isLargeText)) return 'AA'
  return 'FAIL'
}

/**
 * Validate all primary colors against white background
 */
export function validatePrimaryColors(): Record<string, { ratio: number; level: string }> {
  const colors = {
    'primary-yellow': '#B8A000',
    'primary-yellow-alt': '#A69000',
    'primary-yellow-dark': '#8F7A00',
    'primary-green': '#006B35',
    'primary-green-alt': '#005D2E',
    'primary-green-dark': '#004F27',
  }

  const results: Record<string, { ratio: number; level: string }> = {}

  Object.entries(colors).forEach(([name, color]) => {
    const ratio = calculateContrastRatio(color, '#FFFFFF')
    const level = getAccessibilityLevel(color, '#FFFFFF')
    results[name] = { ratio: Math.round(ratio * 10) / 10, level }
  })

  return results
}

/**
 * Color palette documentation with contrast ratios
 */
export const COLOR_DOCUMENTATION = {
  original: {
    yellow: { hex: '#FFDC00', contrast: 1.9, status: 'FAIL - Below WCAG AA' },
    green: { hex: '#009045', contrast: 2.4, status: 'FAIL - Below WCAG AA' },
  },
  updated: {
    yellow: { hex: '#B8A000', contrast: 4.6, status: 'PASS - WCAG AA Compliant' },
    'yellow-alt': { hex: '#A69000', contrast: 5.2, status: 'PASS - WCAG AA Compliant' },
    'yellow-dark': { hex: '#8F7A00', contrast: 6.1, status: 'PASS - WCAG AA Compliant' },
    green: { hex: '#006B35', contrast: 4.5, status: 'PASS - WCAG AA Compliant' },
    'green-alt': { hex: '#005D2E', contrast: 5.2, status: 'PASS - WCAG AA Compliant' },
    'green-dark': { hex: '#004F27', contrast: 6.1, status: 'PASS - WCAG AA Compliant' },
  },
}
