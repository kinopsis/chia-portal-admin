import React from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'service-yellow' | 'service-gray' | 'service-blue' | 'service-green' | 'service-purple' | 'service-indigo'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  hover?: boolean | 'lift' | 'scale' | 'glow' | 'service'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  border?: boolean
  interactive?: boolean
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hover = false,
    rounded = 'xl',
    shadow = 'md',
    border = true,
    interactive = false,
    children,
    className,
    ...props
  }, ref) => {
    const baseClasses = 'transition-all duration-300 relative overflow-hidden'

    const variantClasses = {
      default: 'bg-white dark:bg-background-secondary text-gray-900 dark:text-text-primary',
      elevated: 'bg-white dark:bg-background-elevated text-gray-900 dark:text-text-primary',
      outlined: 'bg-white dark:bg-background-secondary text-gray-900 dark:text-text-primary',
      ghost: 'bg-gray-50 dark:bg-background-tertiary text-gray-900 dark:text-text-primary',

      // Service card variants with CSS custom properties
      'service-yellow': 'bg-[var(--service-yellow-bg)] border-[var(--service-yellow-border)] text-[var(--service-yellow-text)]',
      'service-gray': 'bg-[var(--service-gray-bg)] border-[var(--service-gray-border)] text-[var(--service-gray-text)]',
      'service-blue': 'bg-[var(--service-blue-bg)] border-[var(--service-blue-border)] text-[var(--service-blue-text)]',
      'service-green': 'bg-[var(--service-green-bg)] border-[var(--service-green-border)] text-[var(--service-green-text)]',
      'service-purple': 'bg-[var(--service-purple-bg)] border-[var(--service-purple-border)] text-[var(--service-purple-text)]',
      'service-indigo': 'bg-[var(--service-indigo-bg)] border-[var(--service-indigo-border)] text-[var(--service-indigo-text)]',
    }

    const paddingClasses = {
      none: '',
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
      '2xl': 'p-12',
    }

    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    }

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
    }

    const borderClasses = border
      ? 'border border-gray-200 dark:border-border-light'
      : ''

    // Enhanced hover effects
    const getHoverClasses = () => {
      if (!hover) return ''

      const baseHover = interactive ? 'cursor-pointer' : ''

      switch (hover) {
        case true:
        case 'lift':
          return clsx(baseHover, 'hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] dark:hover:border-border-medium dark:hover:shadow-2xl')
        case 'scale':
          return clsx(baseHover, 'hover:scale-105 dark:hover:border-border-medium')
        case 'glow':
          return clsx(baseHover, 'hover:shadow-2xl hover:shadow-primary-green/20 dark:hover:shadow-brand-green/20')
        case 'service':
          return clsx(
            baseHover,
            'hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]',
            'lg:hover:scale-105 lg:hover:-translate-y-2',
            'dark:hover:border-border-medium dark:hover:shadow-2xl',
            'reduced-motion:hover:transform-none'
          )
        default:
          return baseHover
      }
    }

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          roundedClasses[rounded],
          shadowClasses[shadow],
          borderClasses,
          getHoverClasses(),
          // Touch-friendly improvements
          interactive && 'min-h-touch-sm',
          // Reduced motion support
          'reduced-motion:transition-none',
          // Focus improvements for interactive cards
          interactive && 'focus-within:ring-2 focus-within:ring-primary-green focus-within:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
