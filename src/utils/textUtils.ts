/**
 * Text utility functions for handling descriptions, truncation, and formatting
 */

/**
 * Truncate text to a specified number of words with ellipsis
 */
export function truncateText(text: string | null | undefined, maxWords: number = 25): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) {
    return text.trim()
  }
  
  return words.slice(0, maxWords).join(' ') + '...'
}

/**
 * Truncate text to a specified number of characters with ellipsis
 */
export function truncateByChars(text: string | null | undefined, maxChars: number = 150): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  const trimmed = text.trim()
  if (trimmed.length <= maxChars) {
    return trimmed
  }
  
  // Find the last space before the limit to avoid cutting words
  const truncated = trimmed.substring(0, maxChars)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxChars * 0.8) { // Only use space if it's not too far back
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Get a meaningful description from service data
 * Prioritizes descripcion field, falls back to formulario, then provides default
 */
export function getServiceDescription(item: any): string {
  // Try descripcion field first
  if (item.descripcion && typeof item.descripcion === 'string' && item.descripcion.trim()) {
    return item.descripcion.trim()
  }
  
  // Try originalData.descripcion
  if (item.originalData?.descripcion && typeof item.originalData.descripcion === 'string' && item.originalData.descripcion.trim()) {
    return item.originalData.descripcion.trim()
  }
  
  // Fall back to formulario for trámites
  if (item.tipo === 'tramite' && item.formulario && typeof item.formulario === 'string' && item.formulario.trim()) {
    return item.formulario.trim()
  }
  
  // Fall back to originalData.formulario
  if (item.originalData?.formulario && typeof item.originalData.formulario === 'string' && item.originalData.formulario.trim()) {
    return item.originalData.formulario.trim()
  }
  
  // Default descriptions based on type
  if (item.tipo === 'tramite') {
    return 'Trámite administrativo disponible para ciudadanos'
  } else if (item.tipo === 'opa') {
    return 'Servicio de atención al ciudadano disponible'
  }
  
  return 'Servicio municipal disponible'
}

/**
 * Check if text is meaningful (not just placeholder or empty)
 */
export function isMeaningfulText(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') {
    return false
  }
  
  const trimmed = text.trim().toLowerCase()
  
  // Check for empty or very short text
  if (trimmed.length < 10) {
    return false
  }
  
  // Check for common placeholder patterns
  const placeholders = [
    'sin descripción',
    'no disponible',
    'n/a',
    'pendiente',
    'por definir',
    'descripción pendiente',
    'sin información'
  ]
  
  return !placeholders.some(placeholder => trimmed.includes(placeholder))
}

/**
 * Format text for display with proper capitalization
 */
export function formatDisplayText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  return text
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Clean and normalize text for search purposes
 */
export function normalizeTextForSearch(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

/**
 * Extract keywords from text for search indexing
 */
export function extractKeywords(text: string | null | undefined, minLength: number = 3): string[] {
  if (!text || typeof text !== 'string') {
    return []
  }
  
  const normalized = normalizeTextForSearch(text)
  const words = normalized.split(' ')
  
  return words
    .filter(word => word.length >= minLength)
    .filter((word, index, array) => array.indexOf(word) === index) // Remove duplicates
    .sort()
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchTerms: string[]): string {
  if (!text || !searchTerms.length) {
    return text
  }
  
  let highlightedText = text
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi')
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>')
  })
  
  return highlightedText
}

export default {
  truncateText,
  truncateByChars,
  getServiceDescription,
  isMeaningfulText,
  formatDisplayText,
  normalizeTextForSearch,
  extractKeywords,
  highlightSearchTerms
}
