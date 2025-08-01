// UX-004: Interactive Filter Chips Component
// Replaces basic select dropdowns with modern chip-based multi-selection

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X, Check } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
  count?: number
  disabled?: boolean
}

export interface FilterChipsProps {
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  maxVisible?: number
  allowMultiple?: boolean
  className?: string
  showCount?: boolean
  'data-testid'?: string
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  loading = false,
  maxVisible = 3,
  allowMultiple = true,
  className,
  showCount = true,
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle option selection
  const handleOptionSelect = (value: string) => {
    if (!allowMultiple) {
      onChange([value])
      setIsOpen(false)
      setSearchQuery('')
      return
    }

    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    
    onChange(newValues)
  }

  // Handle chip removal
  const handleChipRemove = (value: string) => {
    onChange(selectedValues.filter(v => v !== value))
  }

  // Clear all selections
  const handleClearAll = () => {
    onChange([])
  }

  // Get selected option labels
  const getSelectedLabels = () => {
    return selectedValues.map(value => {
      const option = options.find(opt => opt.value === value)
      return option ? option.label : value
    })
  }

  const selectedLabels = getSelectedLabels()
  const hasSelections = selectedValues.length > 0

  return (
    <div className={cn('relative', className)} ref={dropdownRef} data-testid={testId}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {hasSelections && showCount && (
          <span className="ml-2 text-xs text-gray-500">
            ({selectedValues.length} seleccionado{selectedValues.length !== 1 ? 's' : ''})
          </span>
        )}
      </label>

      {/* Selected Chips Display */}
      {hasSelections && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLabels.slice(0, maxVisible).map((label, index) => (
            <div
              key={selectedValues[index]}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm',
                'bg-green-100 text-green-800 border border-green-200',
                'hover:bg-green-200 transition-colors duration-200',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              data-testid={`selected-chip-${selectedValues[index]}`}
            >
              <span className="truncate max-w-32">{label}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChipRemove(selectedValues[index])
                  }}
                  className="ml-1 hover:text-green-900 focus:outline-none focus:text-green-900"
                  aria-label={`Remover ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          
          {selectedLabels.length > maxVisible && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
              +{selectedLabels.length - maxVisible} más
            </div>
          )}
          
          {hasSelections && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center px-2 py-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
              data-testid="clear-all-button"
            >
              Limpiar todo
            </button>
          )}
        </div>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 text-left',
          'border border-gray-300 rounded-lg bg-white',
          'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500',
          'transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          loading && 'opacity-50 cursor-wait',
          isOpen && 'border-green-500 ring-2 ring-green-500'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="filter-trigger"
      >
        <span className={cn(
          'block truncate',
          !hasSelections && 'text-gray-500'
        )}>
          {loading ? 'Cargando...' : hasSelections ? `${selectedValues.length} seleccionado${selectedValues.length !== 1 ? 's' : ''}` : placeholder}
        </span>
        <ChevronDown className={cn(
          'h-5 w-5 text-gray-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && !loading && (
        <div className={cn(
          'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg',
          'max-h-60 overflow-hidden'
        )}>
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-3 border-b border-gray-200">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar opciones..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                data-testid="search-input"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchQuery ? 'No se encontraron opciones' : 'No hay opciones disponibles'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-left text-sm',
                      'hover:bg-gray-50 focus:outline-none focus:bg-gray-50',
                      'transition-colors duration-150',
                      isSelected && 'bg-green-50 text-green-900',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    data-testid={`option-${option.value}`}
                  >
                    <div className="flex items-center gap-3">
                      {allowMultiple && (
                        <div className={cn(
                          'w-4 h-4 border-2 rounded flex items-center justify-center',
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {showCount && option.count !== undefined && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({option.count})
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer with actions */}
          {allowMultiple && hasSelections && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {selectedValues.length} de {options.length} seleccionados
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-green-600 hover:text-green-700 focus:outline-none font-medium"
                  data-testid="footer-clear-button"
                >
                  Limpiar todo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
