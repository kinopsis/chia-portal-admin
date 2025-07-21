import React from 'react'
import { Button } from '@/components/atoms'
import { clsx } from 'clsx'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'outline' | 'ghost'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'outline' | 'ghost'
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'p-12',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
    },
  }

  const classes = sizeClasses[size]

  const defaultIcon = (
    <svg
      className={clsx(classes.icon, 'text-gray-400')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  )

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        classes.container,
        className
      )}
      role="status"
      aria-label="Estado vacío"
    >
      {/* Icon */}
      <div className="mb-4">{icon || defaultIcon}</div>

      {/* Title */}
      <h3 className={clsx('font-semibold text-gray-900 mb-2', classes.title)}>{title}</h3>

      {/* Description */}
      {description && (
        <p className={clsx('text-gray-600 mb-6 max-w-md', classes.description)}>{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outline'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
