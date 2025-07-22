'use client'

// Smart Search Hook for intelligent search functionality
// Integrates debouncing, analytics, and contextual suggestions

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import { useSearchSuggestionsQuery } from './queries/useUnifiedSearchQuery'
import { searchAnalyticsService } from '@/services/searchAnalytics'

// Smart search configuration interface
export interface SmartSearchConfig {
  debounceMs?: number
  maxSuggestions?: number
  source?: string
  enableAnalytics?: boolean
  enableSmartSuggestions?: boolean
  minQueryLength?: number
}

// Smart search state interface
export interface SmartSearchState {
  query: string
  debouncedQuery: string
  suggestions: string[]
  isLoading: boolean
  error: string | null
  hasSearched: boolean
  searchStartTime: number | null
}

// Smart search actions interface
export interface SmartSearchActions {
  setQuery: (query: string) => void
  search: (query?: string) => Promise<void>
  selectSuggestion: (suggestion: string, type?: string, index?: number) => Promise<void>
  clear: () => void
  trackSearch: (query: string, resultCount: number, duration?: number) => Promise<void>
}

// Default configuration
const DEFAULT_CONFIG: Required<SmartSearchConfig> = {
  debounceMs: 500,
  maxSuggestions: 8,
  source: 'default',
  enableAnalytics: true,
  enableSmartSuggestions: true,
  minQueryLength: 2
}

/**
 * Smart Search Hook
 * Provides intelligent search functionality with debouncing, analytics, and contextual suggestions
 * 
 * @param onSearch - Callback function when search is executed
 * @param config - Configuration options for smart search
 * @returns Object with search state and actions
 */
export function useSmartSearch(
  onSearch: (query: string) => void | Promise<void>,
  config: SmartSearchConfig = {}
): SmartSearchState & SmartSearchActions {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])
  
  // Internal state
  const [query, setQueryInternal] = useState('')
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced query for API calls
  const debouncedQuery = useDebounce(query, finalConfig.debounceMs)

  // Smart suggestions from API
  const {
    data: smartSuggestions = [],
    isLoading: suggestionsLoading,
    error: suggestionsError
  } = useSearchSuggestionsQuery(debouncedQuery, {
    enabled: finalConfig.enableSmartSuggestions && debouncedQuery.length >= finalConfig.minQueryLength
  })

  // Combined suggestions with fallbacks
  const suggestions = useMemo(() => {
    const allSuggestions: string[] = []
    
    // Add smart suggestions from API
    if (smartSuggestions.length > 0) {
      allSuggestions.push(...smartSuggestions.slice(0, Math.floor(finalConfig.maxSuggestions * 0.8)))
    }
    
    // Add contextual fallback suggestions if needed
    if (allSuggestions.length < finalConfig.maxSuggestions) {
      const contextualSuggestions = getContextualSuggestions(finalConfig.source, query)
      const remainingSlots = finalConfig.maxSuggestions - allSuggestions.length
      
      contextualSuggestions
        .filter(suggestion => 
          !allSuggestions.includes(suggestion) &&
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, remainingSlots)
        .forEach(suggestion => allSuggestions.push(suggestion))
    }
    
    return allSuggestions
  }, [smartSuggestions, finalConfig.maxSuggestions, finalConfig.source, query])

  // Set query with search start time tracking
  const setQuery = useCallback((newQuery: string) => {
    setQueryInternal(newQuery)
    setSearchStartTime(Date.now())
    setError(null)
    
    if (newQuery.length === 0) {
      setHasSearched(false)
    }
  }, [])

  // Execute search with analytics tracking
  const search = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query
    const trimmedQuery = queryToSearch.trim()
    
    if (!trimmedQuery) return

    try {
      setError(null)
      setHasSearched(true)

      // Calculate search duration
      const searchDuration = searchStartTime ? Date.now() - searchStartTime : undefined

      // Track search analytics if enabled
      if (finalConfig.enableAnalytics) {
        await searchAnalyticsService.trackSearch(
          trimmedQuery,
          0, // Will be updated when results are received
          finalConfig.source,
          searchDuration
        )
      }

      // Execute the search callback
      await onSearch(trimmedQuery)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la búsqueda'
      setError(errorMessage)
      console.error('Search error:', err)
    }
  }, [query, searchStartTime, finalConfig.enableAnalytics, finalConfig.source, onSearch])

  // Select suggestion with analytics tracking
  const selectSuggestion = useCallback(async (
    suggestion: string, 
    type: string = 'smart', 
    index: number = -1
  ) => {
    try {
      setError(null)

      // Track suggestion click if analytics enabled
      if (finalConfig.enableAnalytics) {
        await searchAnalyticsService.trackSuggestionClick(
          query,
          suggestion,
          index,
          finalConfig.source
        )
      }

      // Update query and execute search
      setQueryInternal(suggestion)
      await search(suggestion)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al seleccionar sugerencia'
      setError(errorMessage)
      console.error('Suggestion selection error:', err)
    }
  }, [query, finalConfig.enableAnalytics, finalConfig.source, search])

  // Clear search state
  const clear = useCallback(() => {
    setQueryInternal('')
    setSearchStartTime(null)
    setHasSearched(false)
    setError(null)
  }, [])

  // Track search with result count (for external use)
  const trackSearch = useCallback(async (
    searchQuery: string, 
    resultCount: number, 
    duration?: number
  ) => {
    if (finalConfig.enableAnalytics) {
      try {
        await searchAnalyticsService.trackSearch(
          searchQuery,
          resultCount,
          finalConfig.source,
          duration
        )
      } catch (err) {
        console.warn('Failed to track search:', err)
      }
    }
  }, [finalConfig.enableAnalytics, finalConfig.source])

  // Update error state when suggestions error changes
  useEffect(() => {
    if (suggestionsError) {
      setError('Error al cargar sugerencias')
    }
  }, [suggestionsError])

  return {
    // State
    query,
    debouncedQuery,
    suggestions,
    isLoading: suggestionsLoading,
    error,
    hasSearched,
    searchStartTime,
    
    // Actions
    setQuery,
    search,
    selectSuggestion,
    clear,
    trackSearch
  }
}

/**
 * Get contextual suggestions based on source and query
 */
function getContextualSuggestions(source: string, query: string): string[] {
  const contextualSuggestions: Record<string, string[]> = {
    homepage: [
      'certificados', 'licencias', 'pagos', 'permisos', 'impuestos',
      'predial', 'industria y comercio', 'construcción', 'funcionamiento'
    ],
    tramites_page: [
      'certificado residencia', 'licencia construcción', 'permiso funcionamiento',
      'certificado estratificación', 'licencia ambiental', 'permiso ocupación'
    ],
    dependencias_page: [
      'planeación', 'hacienda', 'salud', 'ambiente', 'obras públicas',
      'desarrollo social', 'gobierno', 'control interno'
    ],
    pqrs_page: [
      'queja', 'reclamo', 'sugerencia', 'petición', 'consulta',
      'información', 'solicitud', 'denuncia'
    ],
    default: [
      'certificados', 'licencias', 'pagos', 'permisos', 'consultas'
    ]
  }

  const suggestions = contextualSuggestions[source] || contextualSuggestions.default
  
  // Filter suggestions based on query if provided
  if (query.length >= 2) {
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
  }
  
  return suggestions
}

export default useSmartSearch
