/**
 * Text Normalization Utilities for Spanish Language Search
 * 
 * Handles accent/diacritic normalization to improve search functionality
 * for Spanish text, allowing searches like "estratificacion" to match "estratificación"
 */

// Mapping of accented characters to their base forms
const ACCENT_MAP: Record<string, string> = {
  // Lowercase vowels with accents
  'á': 'a',
  'à': 'a',
  'ä': 'a',
  'â': 'a',
  'ā': 'a',
  'ă': 'a',
  'ą': 'a',
  'é': 'e',
  'è': 'e',
  'ë': 'e',
  'ê': 'e',
  'ē': 'e',
  'ĕ': 'e',
  'ę': 'e',
  'í': 'i',
  'ì': 'i',
  'ï': 'i',
  'î': 'i',
  'ī': 'i',
  'ĭ': 'i',
  'į': 'i',
  'ó': 'o',
  'ò': 'o',
  'ö': 'o',
  'ô': 'o',
  'ō': 'o',
  'ŏ': 'o',
  'ő': 'o',
  'ú': 'u',
  'ù': 'u',
  'ü': 'u',
  'û': 'u',
  'ū': 'u',
  'ŭ': 'u',
  'ů': 'u',
  'ű': 'u',
  'ų': 'u',
  
  // Uppercase vowels with accents
  'Á': 'A',
  'À': 'A',
  'Ä': 'A',
  'Â': 'A',
  'Ā': 'A',
  'Ă': 'A',
  'Ą': 'A',
  'É': 'E',
  'È': 'E',
  'Ë': 'E',
  'Ê': 'E',
  'Ē': 'E',
  'Ĕ': 'E',
  'Ę': 'E',
  'Í': 'I',
  'Ì': 'I',
  'Ï': 'I',
  'Î': 'I',
  'Ī': 'I',
  'Ĭ': 'I',
  'Į': 'I',
  'Ó': 'O',
  'Ò': 'O',
  'Ö': 'O',
  'Ô': 'O',
  'Ō': 'O',
  'Ŏ': 'O',
  'Ő': 'O',
  'Ú': 'U',
  'Ù': 'U',
  'Ü': 'U',
  'Û': 'U',
  'Ū': 'U',
  'Ŭ': 'U',
  'Ů': 'U',
  'Ű': 'U',
  'Ų': 'U',
  
  // Spanish specific characters
  'ñ': 'n',
  'Ñ': 'N',
  'ç': 'c',
  'Ç': 'C',
  
  // Additional characters that might appear in government documents
  'ý': 'y',
  'Ý': 'Y',
  'ÿ': 'y',
  'Ÿ': 'Y',
}

/**
 * Normalizes text by removing accents and diacritics
 * 
 * @param text - The text to normalize
 * @returns The normalized text with accents removed
 * 
 * @example
 * normalizeText('estratificación') // returns 'estratificacion'
 * normalizeText('información') // returns 'informacion'
 * normalizeText('trámite') // returns 'tramite'
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // First, try using the native Intl.Collator approach for better performance
  try {
    // This approach uses Unicode normalization (NFD) to separate base characters from diacritics
    return text
      .normalize('NFD') // Decompose characters into base + combining marks
      .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
      .toLowerCase()
  } catch (error) {
    // Fallback to manual mapping if Intl.Collator is not available
    console.warn('Unicode normalization not available, using fallback method')
    return normalizeTextFallback(text)
  }
}

/**
 * Fallback normalization method using character mapping
 * Used when Unicode normalization is not available
 * 
 * @param text - The text to normalize
 * @returns The normalized text with accents removed
 */
function normalizeTextFallback(text: string): string {
  return text
    .split('')
    .map(char => ACCENT_MAP[char] || char)
    .join('')
    .toLowerCase()
}

/**
 * Normalizes text specifically for search operations
 * Includes additional cleanup for better search matching
 * 
 * @param text - The text to normalize for search
 * @returns The normalized and cleaned text
 * 
 * @example
 * normalizeForSearch('  Certificación de Residencia  ') 
 * // returns 'certificacion de residencia'
 */
export function normalizeForSearch(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return normalizeText(text)
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .replace(/[^\w\s]/g, '') // Remove punctuation and special characters
}

/**
 * Checks if a search query matches a target text using normalized comparison
 * 
 * @param query - The search query
 * @param target - The target text to search in
 * @param options - Search options
 * @returns True if the query matches the target
 * 
 * @example
 * searchMatches('estratificacion', 'Estratificación Socioeconómica') // returns true
 * searchMatches('tramite', 'Trámites y Servicios') // returns true
 */
export function searchMatches(
  query: string, 
  target: string, 
  options: {
    caseSensitive?: boolean
    wholeWord?: boolean
    fuzzy?: boolean
  } = {}
): boolean {
  if (!query || !target) {
    return false
  }

  const { caseSensitive = false, wholeWord = false, fuzzy = false } = options

  // Normalize both query and target
  const normalizedQuery = caseSensitive ? normalizeText(query) : normalizeForSearch(query)
  const normalizedTarget = caseSensitive ? normalizeText(target) : normalizeForSearch(target)

  if (wholeWord) {
    // Match whole words only
    const regex = new RegExp(`\\b${escapeRegExp(normalizedQuery)}\\b`, 'i')
    return regex.test(normalizedTarget)
  }

  if (fuzzy) {
    // Simple fuzzy matching - allow for small differences
    return fuzzyMatch(normalizedQuery, normalizedTarget)
  }

  // Standard substring matching
  return normalizedTarget.includes(normalizedQuery)
}

/**
 * Escapes special regex characters in a string
 * 
 * @param string - The string to escape
 * @returns The escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Simple fuzzy matching algorithm
 * Allows for small differences between query and target
 * 
 * @param query - The search query
 * @param target - The target text
 * @returns True if fuzzy match is found
 */
function fuzzyMatch(query: string, target: string): boolean {
  if (query.length === 0) return true
  if (target.length === 0) return false

  // Simple fuzzy matching: allow up to 20% character differences
  const maxDistance = Math.floor(query.length * 0.2)
  return levenshteinDistance(query, target) <= maxDistance
}

/**
 * Calculates the Levenshtein distance between two strings
 * 
 * @param a - First string
 * @param b - Second string
 * @returns The edit distance between the strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Common Spanish words and their variations for testing
 */
export const SPANISH_TEST_WORDS = {
  'tramite': ['trámite', 'tramites', 'trámites'],
  'informacion': ['información', 'informaciones'],
  'certificacion': ['certificación', 'certificaciones'],
  'construccion': ['construcción', 'construcciones'],
  'estratificacion': ['estratificación'],
  'residencia': ['residencia', 'residencias'],
  'funcionamiento': ['funcionamiento'],
  'licencia': ['licencia', 'licencias'],
  'permiso': ['permiso', 'permisos'],
  'solicitud': ['solicitud', 'solicitudes'],
  'documentacion': ['documentación'],
  'autorizacion': ['autorización', 'autorizaciones'],
  'notificacion': ['notificación', 'notificaciones'],
  'verificacion': ['verificación', 'verificaciones'],
  'validacion': ['validación', 'validaciones']
} as const

/**
 * Tests the normalization function with common Spanish words
 * Useful for development and debugging
 * 
 * @returns Test results
 */
export function testNormalization(): { passed: number; failed: number; results: Array<{ word: string; normalized: string; expected: string; passed: boolean }> } {
  const results = []
  let passed = 0
  let failed = 0

  for (const [expected, variations] of Object.entries(SPANISH_TEST_WORDS)) {
    for (const word of variations) {
      const normalized = normalizeForSearch(word)
      const testPassed = normalized === expected
      
      results.push({
        word,
        normalized,
        expected,
        passed: testPassed
      })

      if (testPassed) {
        passed++
      } else {
        failed++
      }
    }
  }

  return { passed, failed, results }
}
