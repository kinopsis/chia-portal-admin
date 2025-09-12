import React, { useId } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'search'
  fullWidth?: boolean
  'data-testid'?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      fullWidth = false,
      className,
      id,
      'data-testid': testId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId

    const baseClasses =
      'px-4 py-3 border rounded-lg transition-colors duration-200 placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 text-text-primary'

    const variantClasses = {
      default: error
        ? 'border-error focus:border-error focus:ring-error bg-background focus:bg-background'
        : `border-border-medium focus:border-primary-green focus:ring-primary-green bg-background focus:bg-background`,
      search: `border-border-medium focus:border-primary-green focus:ring-primary-green bg-background-secondary focus:bg-background`,
    }

    const widthClasses = fullWidth ? 'w-full' : 'w-auto'

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="mb-2 text-sm font-medium text-text-primary">
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-label="campo requerido">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text-muted w-5 h-5">
                {typeof leftIcon === 'function' ? leftIcon() : leftIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              widthClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            aria-invalid={!!error}
            aria-required={!!props.required}
            data-testid={testId}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-text-muted w-5 h-5">
                {typeof rightIcon === 'function' ? rightIcon() : rightIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
