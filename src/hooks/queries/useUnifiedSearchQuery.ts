// React Query hook for unified search with debouncing and caching
// Optimizes search performance with intelligent caching and background updates

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { unifiedSearchService } from '@/services/unifiedSearch'
import type { UnifiedSearchFilters, UnifiedSearchResponse } from '@/services/unifiedSearch'
import { useDebounce } from '@/hooks/useDebounce'

// Query key factory for unified search
export const searchKeys = {
  all: ['search'] as const,
  unified: (filters: UnifiedSearchFilters) => [...searchKeys.all, 'unified', filters] as const,
  suggestions: (query: string) => [...searchKeys.all, 'suggestions', query] as const,
  stats: () => [...searchKeys.all, 'stats'] as const,
}

export function useUnifiedSearchQuery(
  filters: UnifiedSearchFilters,
  options?: {
    enabled?: boolean
    debounceMs?: number
  }
) {
  const { enabled = true, debounceMs = 300 } = options || {}
  
  // Debounce the search query to avoid excessive API calls
  const debouncedQuery = useDebounce(filters.query || '', debounceMs)
  
  // Create debounced filters
  const debouncedFilters = useMemo(() => ({
    ...filters,
    query: debouncedQuery
  }), [filters, debouncedQuery])

  // Only enable query if we have meaningful search criteria or want to show all results
  const shouldFetch = enabled && (
    debouncedQuery.length >= 2 || // At least 2 characters for text search
    debouncedQuery.length === 0 || // Empty query to show all results
    filters.tipo ||
    filters.dependencia ||
    filters.estado
  )

  return useQuery({
    queryKey: searchKeys.unified(debouncedFilters),
    queryFn: () => unifiedSearchService.search(debouncedFilters),
    enabled: shouldFetch,
    // Keep search results fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Cache search results for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Don't retry search queries as aggressively
    retry: 1,
    // Don't refetch on window focus for search results
    refetchOnWindowFocus: false,
    // Provide empty results as placeholder
    placeholderData: {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      success: true
    } as UnifiedSearchResponse,
  })
}

// Hook for search suggestions with aggressive caching
export function useSearchSuggestionsQuery(query: string) {
  const debouncedQuery = useDebounce(query, 200) // Faster debounce for suggestions

  return useQuery({
    queryKey: searchKeys.suggestions(debouncedQuery),
    queryFn: () => unifiedSearchService.getSearchSuggestions(debouncedQuery, 5),
    enabled: debouncedQuery.length >= 2,
    // Keep suggestions fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache suggestions for 15 minutes
    gcTime: 15 * 60 * 1000,
    // Don't retry suggestions
    retry: false,
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Provide empty array as placeholder
    placeholderData: [],
  })
}

// Hook for search statistics
export function useSearchStatsQuery() {
  return useQuery({
    queryKey: searchKeys.stats(),
    queryFn: () => unifiedSearchService.getSearchStats(),
    // Keep stats fresh for 10 minutes
    staleTime: 10 * 60 * 1000,
    // Cache stats for 30 minutes
    gcTime: 30 * 60 * 1000,
    // Retry on error
    retry: 2,
    // Refetch on window focus for fresh stats
    refetchOnWindowFocus: true,
    // Provide default stats as placeholder
    placeholderData: {
      totalTramites: 0,
      totalOpas: 0,
      totalFaqs: 0,
      totalActive: 0
    },
  })
}

// Hook for paginated search with optimized caching
export function usePaginatedSearchQuery(
  baseFilters: Omit<UnifiedSearchFilters, 'page' | 'limit'>,
  page: number = 1,
  limit: number = 10
) {
  const filters = useMemo(() => ({
    ...baseFilters,
    page,
    limit
  }), [baseFilters, page, limit])

  return useUnifiedSearchQuery(filters, {
    enabled: true,
    debounceMs: 300
  })
}

// Hook for infinite scroll search (for future implementation)
export function useInfiniteSearchQuery(
  baseFilters: Omit<UnifiedSearchFilters, 'page' | 'limit'>,
  limit: number = 10
) {
  // This would use useInfiniteQuery for infinite scroll
  // Implementation would depend on specific UI requirements
  return useUnifiedSearchQuery({
    ...baseFilters,
    page: 1,
    limit
  })
}
