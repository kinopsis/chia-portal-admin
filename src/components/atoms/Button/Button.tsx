import React from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary: 'bg-primary-green hover:bg-primary-green-dark text-white focus:ring-primary-green',
      secondary:
        'bg-primary-yellow hover:bg-primary-yellow-dark text-gray-900 focus:ring-primary-yellow',
      outline:
        'border-2 border-primary-green text-primary-green hover:bg-primary-green hover:text-white focus:ring-primary-green',
      ghost: 'text-primary-green hover:bg-primary-green/10 focus:ring-primary-green',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
      error: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      neutral: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    }

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div
            className={clsx(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              iconSizeClasses[size]
            )}
          />
        ) : (
          <>
            {leftIcon && <span className={clsx('mr-2', iconSizeClasses[size])}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={clsx('ml-2', iconSizeClasses[size])}>{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
