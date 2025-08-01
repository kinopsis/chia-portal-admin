/**
 * Fuzzy Search Utilities for UX-007
 * Implements fuzzy matching with typo tolerance for intelligent search
 */

import { normalizeSpanishText } from './utils'

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching with typo tolerance
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity score between two strings (0-1)
 * Higher score means more similar
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(str1, str2)
  return (maxLength - distance) / maxLength
}

/**
 * Fuzzy search configuration
 */
export interface FuzzySearchConfig {
  threshold: number // Minimum similarity score (0-1)
  maxDistance: number // Maximum Levenshtein distance allowed
  caseSensitive: boolean
  normalizeAccents: boolean
}

/**
 * Default fuzzy search configuration optimized for Spanish content
 */
export const DEFAULT_FUZZY_CONFIG: FuzzySearchConfig = {
  threshold: 0.5, // 50% similarity required (more lenient for typos)
  maxDistance: 4, // Allow up to 4 character differences
  caseSensitive: false,
  normalizeAccents: true
}

/**
 * Fuzzy match result with score
 */
export interface FuzzyMatch<T = any> {
  item: T
  score: number
  matches: {
    field: string
    value: string
    score: number
  }[]
}

/**
 * Perform fuzzy search on a single string
 */
export function fuzzyMatch(
  query: string,
  target: string,
  config: Partial<FuzzySearchConfig> = {}
): { match: boolean; score: number } {
  const finalConfig = { ...DEFAULT_FUZZY_CONFIG, ...config }
  
  let normalizedQuery = query
  let normalizedTarget = target
  
  if (!finalConfig.caseSensitive) {
    normalizedQuery = normalizedQuery.toLowerCase()
    normalizedTarget = normalizedTarget.toLowerCase()
  }
  
  if (finalConfig.normalizeAccents) {
    normalizedQuery = normalizeSpanishText(normalizedQuery)
    normalizedTarget = normalizeSpanishText(normalizedTarget)
  }
  
  // Check for exact substring match first (highest score)
  if (normalizedTarget.includes(normalizedQuery)) {
    return { match: true, score: 1.0 }
  }
  
  // Calculate similarity score
  const similarity = calculateSimilarity(normalizedQuery, normalizedTarget)
  const distance = levenshteinDistance(normalizedQuery, normalizedTarget)

  // Be more lenient with longer words
  const adjustedThreshold = normalizedTarget.length > 8 ? finalConfig.threshold * 0.8 : finalConfig.threshold
  const adjustedMaxDistance = Math.max(finalConfig.maxDistance, Math.floor(normalizedTarget.length * 0.3))

  const match = similarity >= adjustedThreshold && distance <= adjustedMaxDistance
  
  return { match, score: similarity }
}

/**
 * Perform fuzzy search on an array of items
 */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  searchFields: (keyof T)[],
  config: Partial<FuzzySearchConfig> = {}
): FuzzyMatch<T>[] {
  if (!query.trim()) return []
  
  const results: FuzzyMatch<T>[] = []
  
  for (const item of items) {
    const matches: FuzzyMatch<T>['matches'] = []
    let maxScore = 0
    
    for (const field of searchFields) {
      const value = String(item[field] || '')
      if (!value) continue
      
      const { match, score } = fuzzyMatch(query, value, config)
      
      if (match) {
        matches.push({
          field: String(field),
          value,
          score
        })
        maxScore = Math.max(maxScore, score)
      }
    }
    
    if (matches.length > 0) {
      results.push({
        item,
        score: maxScore,
        matches
      })
    }
  }
  
  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Generate fuzzy search suggestions from a list of terms
 */
export function generateFuzzySuggestions(
  query: string,
  terms: string[],
  limit: number = 8,
  config: Partial<FuzzySearchConfig> = {}
): string[] {
  if (!query.trim()) return []
  
  const matches = terms
    .map(term => {
      const { match, score } = fuzzyMatch(query, term, config)
      return { term, match, score }
    })
    .filter(result => result.match)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(result => result.term)
  
  return matches
}

/**
 * Enhanced search with fuzzy matching for search suggestions
 */
export function enhancedSearchSuggestions(
  query: string,
  searchData: Array<{ nombre: string; descripcion?: string; tags?: string[] }>,
  limit: number = 8
): string[] {
  if (!query.trim() || query.length < 2) return []
  
  const suggestions = new Set<string>()
  const config = { ...DEFAULT_FUZZY_CONFIG, threshold: 0.5 } // Lower threshold for suggestions
  
  // Search in names
  for (const item of searchData) {
    const { match, score } = fuzzyMatch(query, item.nombre, config)
    if (match && score > 0.6) {
      suggestions.add(item.nombre)
    }
  }
  
  // Search in descriptions
  for (const item of searchData) {
    if (item.descripcion) {
      const words = item.descripcion.split(/\s+/)
      for (const word of words) {
        if (word.length > 3) {
          const { match, score } = fuzzyMatch(query, word, config)
          if (match && score > 0.7) {
            suggestions.add(word)
          }
        }
      }
    }
  }
  
  // Search in tags
  for (const item of searchData) {
    if (item.tags) {
      for (const tag of item.tags) {
        const { match, score } = fuzzyMatch(query, tag, config)
        if (match && score > 0.6) {
          suggestions.add(tag)
        }
      }
    }
  }
  
  return Array.from(suggestions).slice(0, limit)
}

/**
 * Cache for fuzzy search results to improve performance
 */
class FuzzySearchCache {
  private cache = new Map<string, any>()
  private maxSize = 100
  private ttl = 5 * 60 * 1000 // 5 minutes
  
  private getCacheKey(query: string, config: Partial<FuzzySearchConfig>): string {
    return `${query}:${JSON.stringify(config)}`
  }
  
  get<T>(query: string, config: Partial<FuzzySearchConfig>): T | null {
    const key = this.getCacheKey(query, config)
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data
    }
    
    this.cache.delete(key)
    return null
  }
  
  set<T>(query: string, config: Partial<FuzzySearchConfig>, data: T): void {
    const key = this.getCacheKey(query, config)
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  clear(): void {
    this.cache.clear()
  }
}

export const fuzzySearchCache = new FuzzySearchCache()
