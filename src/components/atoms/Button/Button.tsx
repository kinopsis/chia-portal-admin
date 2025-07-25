import React from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'service-yellow' | 'service-gray' | 'service-blue' | 'service-green' | 'service-purple' | 'service-indigo'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = 'lg',
      shadow = 'none',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none dark:disabled:bg-background-tertiary dark:disabled:text-text-disabled dark:disabled:border-border-light relative overflow-hidden'

    const variantClasses = {
      primary: 'bg-primary-green hover:bg-primary-green-dark text-white focus:ring-primary-green shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-brand-green dark:hover:bg-brand-green-hover dark:text-text-primary',
      secondary: 'bg-primary-yellow hover:bg-primary-yellow-dark text-gray-900 focus:ring-primary-yellow shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-brand-yellow dark:hover:bg-brand-yellow-hover dark:text-gray-900',
      outline: 'border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white focus:ring-primary-green shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:border-brand-green dark:text-brand-green dark:hover:bg-brand-green dark:hover:text-text-primary',
      ghost: 'text-primary-green hover:bg-primary-green/10 focus:ring-primary-green transition-all duration-200 dark:text-brand-green dark:hover:bg-brand-green/10',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-error dark:hover:bg-red-600 dark:text-text-primary',
      info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-info dark:hover:bg-blue-600 dark:text-text-primary',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-success dark:hover:bg-green-600 dark:text-text-primary',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-warning dark:hover:bg-yellow-600 dark:text-text-primary',
      error: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-error dark:hover:bg-red-600 dark:text-text-primary',
      neutral: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 dark:bg-background-tertiary dark:hover:bg-background-elevated dark:text-text-primary',

      // Service card specific variants
      'service-yellow': 'bg-[var(--service-yellow-button)] hover:bg-[var(--service-yellow-button-hover)] text-white focus:ring-yellow-500',
      'service-gray': 'bg-[var(--service-gray-button)] hover:bg-[var(--service-gray-button-hover)] text-white focus:ring-gray-500',
      'service-blue': 'bg-[var(--service-blue-button)] hover:bg-[var(--service-blue-button-hover)] text-white focus:ring-blue-500',
      'service-green': 'bg-[var(--service-green-button)] hover:bg-[var(--service-green-button-hover)] text-white focus:ring-green-500',
      'service-purple': 'bg-[var(--service-purple-button)] hover:bg-[var(--service-purple-button-hover)] text-white focus:ring-purple-500',
      'service-indigo': 'bg-[var(--service-indigo-button)] hover:bg-[var(--service-indigo-button-hover)] text-white focus:ring-indigo-500',
    }

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs min-h-[1.75rem]',
      sm: 'px-3 py-1.5 text-sm min-h-[2rem]',
      md: 'px-4 py-2 text-base min-h-[2.5rem]',
      lg: 'px-6 py-3 text-lg min-h-[3rem]',
      xl: 'px-8 py-4 text-xl min-h-[3.5rem]',
    }

    const iconSizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }

    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    }

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          roundedClasses[rounded],
          shadowClasses[shadow],
          fullWidth && 'w-full',
          // Touch-friendly sizing on mobile
          'touch:min-h-touch-sm touch:min-w-touch-sm',
          // Reduced motion support
          'reduced-motion:transition-none',
          // Focus improvements for accessibility
          'focus-visible:ring-2 focus-visible:ring-offset-2',
          className
        )}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading ? 'true' : 'false'}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div
              className={clsx(
                'animate-spin rounded-full border-2 border-current border-t-transparent',
                iconSizeClasses[size]
              )}
              aria-hidden="true"
            />
            {loadingText && (
              <span className="ml-2 sr-only">
                {loadingText}
              </span>
            )}
          </div>
        ) : (
          <>
            {leftIcon && (
              <span
                className={clsx('mr-2 flex-shrink-0', iconSizeClasses[size])}
                aria-hidden="true"
              >
                {leftIcon}
              </span>
            )}
            <span className="truncate">{children}</span>
            {rightIcon && (
              <span
                className={clsx('ml-2 flex-shrink-0', iconSizeClasses[size])}
                aria-hidden="true"
              >
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
