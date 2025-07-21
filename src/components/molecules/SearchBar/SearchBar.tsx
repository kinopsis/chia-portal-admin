'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Button, Input } from '@/components/atoms'
import { clsx } from 'clsx'

export interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onClear?: () => void
  suggestions?: string[]
  showSuggestions?: boolean
  isLoading?: boolean
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar...',
  onSearch,
  onClear,
  suggestions = [],
  showSuggestions = false,
  isLoading = false,
  className,
}) => {
  const [query, setQuery] = useState('')
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSearch) {
      onSearch(query.trim())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestionsDropdown(value.length > 0 && showSuggestions)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestionsDropdown(false)
    if (onSearch) {
      onSearch(suggestion)
    }
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestionsDropdown(false)
    if (onClear) {
      onClear()
    }
  }

  return (
    <div className={clsx('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          leftIcon={<MagnifyingGlassIcon />}
          variant="search"
          fullWidth
          className="pr-24"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!query.trim()}
          >
            Buscar
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="text-sm text-gray-700">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular Searches */}
      {showSuggestions && suggestions.length > 0 && !query && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-600">Búsquedas populares:</span>
          {suggestions.slice(0, 4).map((term, index) => (
            <button
              key={index}
              type="button"
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => handleSuggestionClick(term)}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
