'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      size = 'md',
      variant = 'default',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id || generatedId

    const baseClasses =
      'border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white'

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    }

    const variantClasses = {
      default: error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-primary-green focus:ring-primary-green',
      outlined: error
        ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-2 border-gray-300 focus:border-primary-green focus:ring-primary-green',
    }

    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={selectId} className="mb-2 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              baseClasses,
              sizeClasses[size],
              variantClasses[variant],
              widthClasses,
              'appearance-none pr-10',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Helper text or error */}
        {(error || helperText) && (
          <div className="mt-1">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
