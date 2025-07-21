'use client'

import React, { useId } from 'react'
import { clsx } from 'clsx'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  variant?: 'default' | 'outlined'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  showCharCount?: boolean
  maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'default',
      resize = 'vertical',
      showCharCount = false,
      maxLength,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    const currentLength = typeof value === 'string' ? value.length : 0

    const baseClasses =
      'px-4 py-3 border rounded-lg transition-colors duration-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0'

    const variantClasses = {
      default: error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-primary-green focus:ring-primary-green',
      outlined: error
        ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-2 border-gray-300 focus:border-primary-green focus:ring-primary-green',
    }

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }

    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={textareaId} className="mb-2 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              resizeClasses[resize],
              widthClasses,
              className
            )}
            maxLength={maxLength}
            value={value}
            {...props}
          />
        </div>

        {/* Helper text, error, or character count */}
        <div className="mt-1 flex justify-between items-center">
          <div className="flex-1">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : helperText ? (
              <p className="text-sm text-gray-500">{helperText}</p>
            ) : null}
          </div>

          {showCharCount && maxLength && (
            <div className="ml-2">
              <span
                className={clsx(
                  'text-xs',
                  currentLength > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500',
                  currentLength >= maxLength ? 'text-red-600' : ''
                )}
              >
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
