/**
 * Color Contrast Validator for WCAG 2.1 AA Compliance
 * 
 * Validates color combinations against WCAG 2.1 AA standards:
 * - Normal text: 4.5:1 contrast ratio minimum
 * - Large text (18pt+ or 14pt+ bold): 3.0:1 contrast ratio minimum
 * - UI components: 3.0:1 contrast ratio minimum
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format (#RRGGBB)')
  }
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * WCAG 2.1 AA compliance levels
 */
export const WCAG_LEVELS = {
  AA_NORMAL: 4.5,    // Normal text
  AA_LARGE: 3.0,     // Large text (18pt+ or 14pt+ bold)
  AA_UI: 3.0,        // UI components and graphics
  AAA_NORMAL: 7.0,   // Enhanced contrast (AAA)
  AAA_LARGE: 4.5     // Enhanced contrast for large text (AAA)
} as const

/**
 * Validate color contrast against WCAG standards
 */
export interface ContrastValidationResult {
  ratio: number
  level: 'FAIL' | 'AA' | 'AAA'
  passes: {
    AA_normal: boolean
    AA_large: boolean
    AA_ui: boolean
    AAA_normal: boolean
    AAA_large: boolean
  }
}

export function validateContrast(
  foreground: string, 
  background: string
): ContrastValidationResult {
  const ratio = getContrastRatio(foreground, background)
  
  const passes = {
    AA_normal: ratio >= WCAG_LEVELS.AA_NORMAL,
    AA_large: ratio >= WCAG_LEVELS.AA_LARGE,
    AA_ui: ratio >= WCAG_LEVELS.AA_UI,
    AAA_normal: ratio >= WCAG_LEVELS.AAA_NORMAL,
    AAA_large: ratio >= WCAG_LEVELS.AAA_LARGE
  }
  
  let level: 'FAIL' | 'AA' | 'AAA' = 'FAIL'
  if (passes.AAA_normal) {
    level = 'AAA'
  } else if (passes.AA_normal) {
    level = 'AA'
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    passes
  }
}

/**
 * Portal color palette for validation
 */
export const PORTAL_COLORS = {
  // Primary colors (WCAG AA compliant - CORRECTED)
  primary: {
    yellow: '#8B7000',        // 4.76:1 contrast on white (CORRECTED)
    yellowAlt: '#7A6000',     // 6.0:1 contrast on white (CORRECTED)
    yellowDark: '#695000',    // 7.64:1 contrast on white (CORRECTED)
    green: '#006B35',         // 4.5:1 contrast on white
    greenAlt: '#005D2E',      // 5.2:1 contrast on white
    greenDark: '#004F27',     // 6.1:1 contrast on white
  },
  
  // Background colors
  background: {
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray900: '#0F172A',
  },
  
  // Text colors
  text: {
    primary: '#171717',
    secondary: '#374151',
    muted: '#6B7280',
    disabled: '#9CA3AF',
    white: '#FFFFFF',
  },
  
  // Service card colors
  service: {
    yellowBg: '#FEFCE8',
    yellowText: '#713F12',
    yellowButton: '#EAB308',
    grayBg: '#F8FAFC',
    grayText: '#334155',
    grayButton: '#64748B',
  }
} as const

/**
 * Validate all critical color combinations in the portal
 */
export function validatePortalColors(): Record<string, ContrastValidationResult> {
  const results: Record<string, ContrastValidationResult> = {}
  
  // Primary colors on white background
  results['Primary Yellow on White'] = validateContrast(
    PORTAL_COLORS.primary.yellow, 
    PORTAL_COLORS.background.white
  )
  
  results['Primary Green on White'] = validateContrast(
    PORTAL_COLORS.primary.green, 
    PORTAL_COLORS.background.white
  )
  
  // Text colors on backgrounds
  results['Primary Text on White'] = validateContrast(
    PORTAL_COLORS.text.primary, 
    PORTAL_COLORS.background.white
  )
  
  results['Secondary Text on White'] = validateContrast(
    PORTAL_COLORS.text.secondary, 
    PORTAL_COLORS.background.white
  )
  
  results['Muted Text on White'] = validateContrast(
    PORTAL_COLORS.text.muted, 
    PORTAL_COLORS.background.white
  )
  
  // Service card combinations
  results['Service Yellow Text on Yellow Background'] = validateContrast(
    PORTAL_COLORS.service.yellowText, 
    PORTAL_COLORS.service.yellowBg
  )
  
  results['Service Gray Text on Gray Background'] = validateContrast(
    PORTAL_COLORS.service.grayText, 
    PORTAL_COLORS.service.grayBg
  )
  
  // Dark mode combinations
  results['White Text on Dark Background'] = validateContrast(
    PORTAL_COLORS.text.white, 
    PORTAL_COLORS.background.gray900
  )
  
  return results
}

/**
 * Generate accessibility report for color combinations
 */
export function generateColorAccessibilityReport(): {
  summary: {
    total: number
    passing: number
    failing: number
    passRate: number
  }
  details: Array<{
    combination: string
    ratio: number
    level: string
    status: 'PASS' | 'FAIL'
    recommendation?: string
  }>
} {
  const results = validatePortalColors()
  const details = Object.entries(results).map(([combination, result]) => ({
    combination,
    ratio: result.ratio,
    level: result.level,
    status: result.level !== 'FAIL' ? 'PASS' as const : 'FAIL' as const,
    recommendation: result.level === 'FAIL' 
      ? `Increase contrast to at least ${WCAG_LEVELS.AA_NORMAL}:1 for normal text`
      : undefined
  }))
  
  const passing = details.filter(d => d.status === 'PASS').length
  const total = details.length
  
  return {
    summary: {
      total,
      passing,
      failing: total - passing,
      passRate: Math.round((passing / total) * 100)
    },
    details
  }
}

/**
 * Utility function to suggest better color alternatives
 */
export function suggestBetterColor(
  originalColor: string, 
  backgroundColor: string, 
  targetRatio: number = WCAG_LEVELS.AA_NORMAL
): string | null {
  const bgRgb = hexToRgb(backgroundColor)
  const origRgb = hexToRgb(originalColor)
  
  if (!bgRgb || !origRgb) return null
  
  // Simple approach: darken or lighten the original color
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
  
  // If background is light, darken the text color
  // If background is dark, lighten the text color
  const shouldDarken = bgLuminance > 0.5
  
  for (let factor = 0.1; factor <= 1; factor += 0.1) {
    const newRgb = {
      r: shouldDarken ? Math.floor(origRgb.r * (1 - factor)) : Math.min(255, Math.floor(origRgb.r * (1 + factor))),
      g: shouldDarken ? Math.floor(origRgb.g * (1 - factor)) : Math.min(255, Math.floor(origRgb.g * (1 + factor))),
      b: shouldDarken ? Math.floor(origRgb.b * (1 - factor)) : Math.min(255, Math.floor(origRgb.b * (1 + factor)))
    }
    
    const newHex = `#${newRgb.r.toString(16).padStart(2, '0')}${newRgb.g.toString(16).padStart(2, '0')}${newRgb.b.toString(16).padStart(2, '0')}`
    const ratio = getContrastRatio(newHex, backgroundColor)
    
    if (ratio >= targetRatio) {
      return newHex
    }
  }
  
  return null
}
