import React from 'react'
import { clsx } from 'clsx'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', children, className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full'

    const variantClasses = {
      success: 'bg-success/10 text-success dark:bg-success/20 dark:text-success',
      warning: 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning',
      error: 'bg-error/10 text-error dark:bg-error/20 dark:text-error',
      info: 'bg-info/10 text-info dark:bg-info/20 dark:text-info',
      neutral: 'bg-neutral/10 text-neutral dark:bg-neutral/20 dark:text-neutral',
      primary: 'bg-primary-green/10 text-primary-green',
      secondary: 'bg-primary-yellow/10 text-primary-yellow',
    }

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    }

    return (
      <span
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
