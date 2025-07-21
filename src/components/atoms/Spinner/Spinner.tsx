import React from 'react'
import { clsx } from 'clsx'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'primary', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    }

    const colorClasses = {
      primary: 'border-primary-green',
      secondary: 'border-primary-yellow',
      white: 'border-white',
      gray: 'border-gray-600',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'animate-spin rounded-full border-2 border-t-transparent',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      />
    )
  }
)

Spinner.displayName = 'Spinner'

export default Spinner
