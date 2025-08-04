'use client'

/**
 * ToggleSwitch Component
 * 
 * A modern, accessible toggle switch for activating/deactivating services
 * with smooth animations, loading states, and optional confirmation dialogs.
 * 
 * Features:
 * - Smooth animations and micro-interactions
 * - Loading states with spinner
 * - Optional confirmation dialog
 * - Full keyboard accessibility
 * - Screen reader support
 * - Multiple sizes and variants
 * - Customizable colors and labels
 */

import React, { useState, useCallback } from 'react'
import { clsx } from 'clsx'

export interface ToggleSwitchProps {
  /** Current checked state */
  checked: boolean
  /** Callback when state changes */
  onChange: (checked: boolean) => void
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger'
  /** Optional label text */
  label?: string
  /** Helper text shown below the switch */
  helperText?: string
  /** Require confirmation before changing state */
  confirmationRequired?: boolean
  /** Custom confirmation message */
  confirmationMessage?: string
  /** Additional CSS classes */
  className?: string
  /** Test ID for testing */
  'data-testid'?: string
}

const sizeClasses = {
  sm: {
    switch: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
    text: 'text-sm'
  },
  md: {
    switch: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
    text: 'text-base'
  },
  lg: {
    switch: 'h-7 w-14',
    thumb: 'h-6 w-6',
    translate: 'translate-x-7',
    text: 'text-lg'
  }
}

const variantClasses = {
  default: {
    on: 'bg-primary-green',
    off: 'bg-gray-200',
    thumb: 'bg-white'
  },
  success: {
    on: 'bg-green-500',
    off: 'bg-gray-200',
    thumb: 'bg-white'
  },
  warning: {
    on: 'bg-yellow-500',
    off: 'bg-gray-200',
    thumb: 'bg-white'
  },
  danger: {
    on: 'bg-red-500',
    off: 'bg-gray-200',
    thumb: 'bg-white'
  }
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  label,
  helperText,
  confirmationRequired = false,
  confirmationMessage,
  className,
  'data-testid': testId,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingState, setPendingState] = useState<boolean | null>(null)

  const sizeConfig = sizeClasses[size]
  const variantConfig = variantClasses[variant]

  const handleToggle = useCallback(() => {
    if (loading || disabled) return

    const newState = !checked

    if (confirmationRequired) {
      setPendingState(newState)
      setShowConfirmation(true)
    } else {
      onChange(newState)
    }
  }, [checked, onChange, loading, disabled, confirmationRequired])

  const handleConfirm = useCallback(() => {
    if (pendingState !== null) {
      onChange(pendingState)
      setPendingState(null)
    }
    setShowConfirmation(false)
  }, [pendingState, onChange])

  const handleCancel = useCallback(() => {
    setPendingState(null)
    setShowConfirmation(false)
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }, [handleToggle])

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex items-center space-x-3">
        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label || `Toggle switch ${checked ? 'on' : 'off'}`}
          disabled={loading || disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          data-testid={testId}
          className={clsx(
            // Base styles
            'relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-2',
            sizeConfig.switch,
            
            // State-based colors
            checked ? variantConfig.on : variantConfig.off,
            
            // Interactive states
            {
              'opacity-50 cursor-not-allowed': disabled,
              'cursor-pointer hover:shadow-md': !disabled && !loading,
              'cursor-wait': loading
            }
          )}
        >
          {/* Thumb */}
          <span
            className={clsx(
              'inline-block rounded-full transition-all duration-300 ease-in-out transform',
              sizeConfig.thumb,
              variantConfig.thumb,
              {
                [sizeConfig.translate]: checked,
                'translate-x-0.5': !checked
              }
            )}
          >
            {/* Loading Spinner */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={clsx(
                  'animate-spin rounded-full border-2 border-gray-300 border-t-gray-600',
                  size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
                )} />
              </div>
            )}
          </span>
        </button>

        {/* Label */}
        {label && (
          <label 
            className={clsx(
              'font-medium text-gray-900 cursor-pointer select-none',
              sizeConfig.text,
              { 'opacity-50': disabled }
            )}
            onClick={!disabled && !loading ? handleToggle : undefined}
          >
            {label}
          </label>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className={clsx(
          'mt-1 text-gray-500',
          size === 'sm' ? 'text-xs' : 'text-sm',
          { 'opacity-50': disabled }
        )}>
          {helperText}
        </p>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Confirmar cambio
            </h3>
            <p className="text-gray-600 mb-4">
              {confirmationMessage || 
                `¿Estás seguro de que deseas ${pendingState ? 'activar' : 'desactivar'} este elemento?`
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={clsx(
                  'px-4 py-2 text-white rounded-md transition-colors',
                  pendingState 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {pendingState ? 'Activar' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToggleSwitch
