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
  const filteredOptions = options.filter((option) =>
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
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]

    onChange(newValues)
  }

  // Handle chip removal
  const handleChipRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value))
  }

  // Clear all selections
  const handleClearAll = () => {
    onChange([])
  }

  // Get selected option labels
  const getSelectedLabels = () => {
    return selectedValues.map((value) => {
      const option = options.find((opt) => opt.value === value)
      return option ? option.label : value
    })
  }

  const selectedLabels = getSelectedLabels()
  const hasSelections = selectedValues.length > 0

  return (
    <div className={cn('relative', className)} ref={dropdownRef} data-testid={testId}>
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
        {hasSelections && showCount && (
          <span className="ml-2 text-xs text-text-muted">
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
                'bg-success-light text-success-dark border border-success-dark/20',
                'hover:bg-success-dark/10 transition-colors duration-200',
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
                  className="ml-1 hover:text-success-dark focus:outline-none focus:text-success-dark"
                  aria-label={`Remover ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {selectedLabels.length > maxVisible && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-background-secondary text-text-secondary">
              +{selectedLabels.length - maxVisible} más
            </div>
          )}

          {hasSelections && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center px-2 py-1 text-xs text-text-muted hover:text-text-secondary focus:outline-none"
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
          'border border-border-medium rounded-lg bg-background',
          'hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green',
          'transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed bg-background-secondary',
          loading && 'opacity-50 cursor-wait',
          isOpen && 'border-primary-green ring-2 ring-primary-green'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="filter-trigger"
      >
        <span
          className={cn('block truncate', 'text-text-primary', !hasSelections && 'text-text-muted')}
        >
          {loading
            ? 'Cargando...'
            : hasSelections
              ? `${selectedValues.length} seleccionado${selectedValues.length !== 1 ? 's' : ''}`
              : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-text-muted transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && !loading && (
        <div
          className={cn(
            'absolute z-50 w-full mt-1 bg-background border border-border-medium rounded-lg shadow-lg',
            'max-h-60 overflow-hidden'
          )}
        >
          {/* Search Input */}
          {options.length > 5 && (
            <div className="p-3 border-b border-border-light">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar opciones..."
                className="w-full px-3 py-2 text-sm text-text-primary border border-border-medium rounded focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green placeholder-text-muted"
                data-testid="search-input"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted text-center">
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
                      'hover:bg-background-secondary focus:outline-none focus:bg-background-secondary',
                      'transition-colors duration-150 text-text-primary',
                      isSelected && 'bg-primary-green/10 text-primary-green-dark',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    data-testid={`option-${option.value}`}
                  >
                    <div className="flex items-center gap-3">
                      {allowMultiple && (
                        <div
                          className={cn(
                            'w-4 h-4 border-2 rounded flex items-center justify-center',
                            isSelected
                              ? 'border-primary-green bg-primary-green'
                              : 'border-border-medium'
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {showCount && option.count !== undefined && (
                      <span className="text-xs text-text-muted ml-2">({option.count})</span>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer with actions */}
          {allowMultiple && hasSelections && (
            <div className="p-3 border-t border-border-light bg-background-secondary">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">
                  {selectedValues.length} de {options.length} seleccionados
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-primary-green hover:text-primary-green hover:text-primary-green-dark focus:outline-none font-medium"
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
