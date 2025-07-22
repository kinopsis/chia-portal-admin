'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MagnifyingGlassIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { Button, Input, SkeletonLoader, ResponsiveContainer } from '@/components/atoms'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchSuggestionsQuery } from '@/hooks/queries/useUnifiedSearchQuery'
import { searchAnalyticsService } from '@/services/searchAnalytics'
import { clsx } from 'clsx'

// Enhanced suggestion interface for intelligent autocomplete
export interface SearchSuggestion {
  text: string
  type: 'recent' | 'popular' | 'contextual' | 'smart'
  category?: 'tramite' | 'opa' | 'faq' | 'general'
  count?: number
  icon?: React.ReactNode
}

export interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onClear?: () => void
  suggestions?: string[] // Legacy support - will be converted to SearchSuggestion[]
  showSuggestions?: boolean
  isLoading?: boolean
  className?: string
  // New intelligent search props
  enableSmartSuggestions?: boolean
  debounceMs?: number
  maxSuggestions?: number
  source?: string // For analytics tracking
  showPopularSearches?: boolean
  showRecentSearches?: boolean
  onSuggestionClick?: (suggestion: string, type: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar...',
  onSearch,
  onClear,
  suggestions = [],
  showSuggestions = false,
  isLoading = false,
  className,
  // New intelligent search props with defaults
  enableSmartSuggestions = true,
  debounceMs = 500, // Sprint 2.1 requirement: 500ms debounce
  maxSuggestions = 8,
  source = 'homepage',
  showPopularSearches = true,
  showRecentSearches = true,
  onSuggestionClick,
}) => {
  const [query, setQuery] = useState('')
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null)

  // Refs for managing focus and keyboard navigation
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounce query for smart suggestions (500ms as per Sprint 2.1 requirements)
  const debouncedQuery = useDebounce(query, debounceMs)

  // Smart suggestions query with React Query integration
  const {
    data: smartSuggestions = [],
    isLoading: suggestionsLoading,
    error: suggestionsError
  } = useSearchSuggestionsQuery(debouncedQuery)

  // Enhanced search submission with analytics tracking
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()

    if (trimmedQuery && onSearch) {
      // Calculate search duration for performance analytics
      const searchDuration = searchStartTime ? Date.now() - searchStartTime : undefined

      // Track search analytics
      try {
        await searchAnalyticsService.trackSearch(
          trimmedQuery,
          0, // Will be updated when results are received
          source,
          searchDuration
        )
      } catch (error) {
        console.warn('Failed to track search:', error)
      }

      onSearch(trimmedQuery)
      setShowSuggestionsDropdown(false)
      setSelectedSuggestionIndex(-1)
    }
  }, [query, onSearch, source, searchStartTime])

  // Enhanced input change handler with smart suggestions
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSearchStartTime(Date.now()) // Track when user starts typing
    setSelectedSuggestionIndex(-1)

    // Show suggestions dropdown based on conditions
    const shouldShowSuggestions = (
      (value.length > 0 && showSuggestions) ||
      (enableSmartSuggestions && value.length >= 1)
    )

    setShowSuggestionsDropdown(shouldShowSuggestions)
  }, [showSuggestions, enableSmartSuggestions])

  // Enhanced suggestion click with analytics
  const handleSuggestionClick = useCallback(async (suggestion: string, suggestionType: string = 'manual', index: number = -1) => {
    setQuery(suggestion)
    setShowSuggestionsDropdown(false)
    setSelectedSuggestionIndex(-1)

    // Track suggestion click analytics
    try {
      await searchAnalyticsService.trackSuggestionClick(
        query,
        suggestion,
        index,
        source
      )
    } catch (error) {
      console.warn('Failed to track suggestion click:', error)
    }

    // Notify parent component
    if (onSuggestionClick) {
      onSuggestionClick(suggestion, suggestionType)
    }

    // Execute search immediately
    if (onSearch) {
      onSearch(suggestion)
    }
  }, [query, source, onSuggestionClick, onSearch])

  // Enhanced clear handler
  const handleClear = useCallback(() => {
    setQuery('')
    setShowSuggestionsDropdown(false)
    setSelectedSuggestionIndex(-1)
    setSearchStartTime(null)

    if (onClear) {
      onClear()
    }

    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [onClear])

  // Combine all suggestion sources into unified list
  const combinedSuggestions: SearchSuggestion[] = React.useMemo(() => {
    const allSuggestions: SearchSuggestion[] = []

    // Add smart suggestions from API (highest priority)
    if (enableSmartSuggestions && smartSuggestions.length > 0) {
      smartSuggestions.slice(0, Math.floor(maxSuggestions * 0.6)).forEach(suggestion => {
        allSuggestions.push({
          text: suggestion,
          type: 'smart',
          icon: <ArrowTrendingUpIcon className="w-4 h-4 text-primary-green" />
        })
      })
    }

    // Add legacy suggestions (medium priority)
    if (suggestions.length > 0) {
      suggestions.slice(0, Math.floor(maxSuggestions * 0.3)).forEach(suggestion => {
        // Avoid duplicates
        if (!allSuggestions.some(s => s.text.toLowerCase() === suggestion.toLowerCase())) {
          allSuggestions.push({
            text: suggestion,
            type: 'contextual',
            icon: <ClockIcon className="w-4 h-4 text-gray-400" />
          })
        }
      })
    }

    // Add popular searches if enabled and space available
    if (showPopularSearches && allSuggestions.length < maxSuggestions) {
      const remainingSlots = maxSuggestions - allSuggestions.length
      // This would be populated from analytics service in real implementation
      const popularSearches = ['certificados', 'licencias', 'pagos', 'permisos']
        .filter(term =>
          term.toLowerCase().includes(query.toLowerCase()) &&
          !allSuggestions.some(s => s.text.toLowerCase() === term.toLowerCase())
        )
        .slice(0, remainingSlots)

      popularSearches.forEach(term => {
        allSuggestions.push({
          text: term,
          type: 'popular',
          icon: <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />
        })
      })
    }

    return allSuggestions.slice(0, maxSuggestions)
  }, [smartSuggestions, suggestions, query, maxSuggestions, enableSmartSuggestions, showPopularSearches])

  // Keyboard navigation for suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestionsDropdown || !combinedSuggestions.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < combinedSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : combinedSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          const selectedSuggestion = combinedSuggestions[selectedSuggestionIndex]
          handleSuggestionClick(selectedSuggestion.text, selectedSuggestion.type, selectedSuggestionIndex)
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestionsDropdown(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }, [showSuggestionsDropdown, combinedSuggestions, selectedSuggestionIndex, handleSuggestionClick, handleSubmit])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsDropdown(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <ResponsiveContainer
      layout="stack"
      className={clsx('relative w-full max-w-2xl', className)}
      touchOptimized={true}
    >
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          leftIcon={<MagnifyingGlassIcon />}
          variant="search"
          fullWidth
          className="pr-24"
          aria-expanded={showSuggestionsDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-describedby={showSuggestionsDropdown ? 'search-suggestions' : undefined}
          role="combobox"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-400 no-touch:hover:text-gray-600 min-h-touch-sm min-w-touch-sm"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading || suggestionsLoading}
            disabled={!query.trim()}
            className="min-h-touch-sm"
          >
            Buscar
          </Button>
        </div>
      </form>

      {/* Enhanced Intelligent Suggestions Dropdown */}
      {showSuggestionsDropdown && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          aria-label="Sugerencias de búsqueda"
        >
          {/* Loading State */}
          {suggestionsLoading && enableSmartSuggestions && (
            <div className="p-mobile-sm xs:p-4">
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLoader
                    key={index}
                    variant="text"
                    responsive={true}
                    className="h-8"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {suggestionsError && (
            <div className="p-mobile-sm xs:p-4 text-sm text-gray-500 text-center">
              <span>No se pudieron cargar las sugerencias</span>
            </div>
          )}

          {/* Suggestions List */}
          {!suggestionsLoading && combinedSuggestions.length > 0 && (
            <div className="py-2">
              {combinedSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion.text, suggestion.type, index)}
                  className={clsx(
                    'w-full px-mobile-sm xs:px-4 py-mobile-xs xs:py-2 text-left flex items-center gap-3',
                    'no-touch:hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                    'transition-colors duration-150 min-h-touch-sm',
                    selectedSuggestionIndex === index && 'bg-primary-green/10 border-l-2 border-primary-green',
                    index === 0 && 'rounded-t-lg',
                    index === combinedSuggestions.length - 1 && 'rounded-b-lg'
                  )}
                  aria-label={`Buscar ${suggestion.text}`}
                >
                  {/* Suggestion Icon */}
                  <div className="flex-shrink-0">
                    {suggestion.icon}
                  </div>

                  {/* Suggestion Text */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm xs:text-base font-medium text-gray-900 truncate">
                      {suggestion.text}
                    </div>
                    {suggestion.type === 'popular' && suggestion.count && (
                      <div className="text-xs text-gray-500">
                        {suggestion.count} búsquedas recientes
                      </div>
                    )}
                  </div>

                  {/* Suggestion Type Badge */}
                  <div className="flex-shrink-0">
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      suggestion.type === 'smart' && 'bg-primary-green/10 text-primary-green',
                      suggestion.type === 'popular' && 'bg-orange-100 text-orange-700',
                      suggestion.type === 'contextual' && 'bg-blue-100 text-blue-700',
                      suggestion.type === 'recent' && 'bg-gray-100 text-gray-700'
                    )}>
                      {suggestion.type === 'smart' && 'Inteligente'}
                      {suggestion.type === 'popular' && 'Popular'}
                      {suggestion.type === 'contextual' && 'Sugerido'}
                      {suggestion.type === 'recent' && 'Reciente'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Suggestions State */}
          {!suggestionsLoading && combinedSuggestions.length === 0 && query.length >= 2 && (
            <div className="p-mobile-sm xs:p-4 text-sm text-gray-500 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>No se encontraron sugerencias</span>
              </div>
              <p className="text-xs">
                Presiona Enter para buscar "{query}"
              </p>
            </div>
          )}

          {/* Search Tips for Empty Query */}
          {query.length < 2 && showPopularSearches && (
            <div className="p-mobile-sm xs:p-4">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Búsquedas populares:
              </div>
              <div className="flex flex-wrap gap-2">
                {['certificados', 'licencias', 'pagos', 'permisos'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSuggestionClick(term, 'popular')}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full no-touch:hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ResponsiveContainer>
  )
}

export default SearchBar
