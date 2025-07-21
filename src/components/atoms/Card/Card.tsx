import React from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hover = false, children, className, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-300'

    const variantClasses = {
      default: 'bg-white border border-gray-100 shadow-soft',
      elevated: 'bg-white shadow-medium',
      outlined: 'bg-white border-2 border-gray-200',
      ghost: 'bg-gray-50',
    }

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    const hoverClasses = hover ? 'hover:shadow-strong hover:-translate-y-1 cursor-pointer' : ''

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
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
