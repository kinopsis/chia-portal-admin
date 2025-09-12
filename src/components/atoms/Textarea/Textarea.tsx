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
      'px-4 py-3 border rounded-lg transition-colors duration-200 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 bg-background text-text-primary'

    const variantClasses = {
      default: error
        ? 'border-error focus:border-error focus:ring-error'
        : 'border-border focus:border-primary-green focus:ring-primary-green',
      outlined: error
        ? 'border-2 border-error focus:border-error focus:ring-error'
        : 'border-2 border-border focus:border-primary-green focus:ring-primary-green',
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
          <label htmlFor={textareaId} className="mb-2 text-sm font-medium text-text-primary">
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
              <p className="text-sm text-error">{error}</p>
            ) : helperText ? (
              <p className="text-sm text-text-muted">{helperText}</p>
            ) : null}
          </div>

          {showCharCount && maxLength && (
            <div className="ml-2">
              <span
                className={clsx(
                  'text-xs',
                  currentLength > maxLength * 0.9 ? 'text-accent' : 'text-text-muted',
                  currentLength >= maxLength ? 'text-error font-medium' : ''
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
