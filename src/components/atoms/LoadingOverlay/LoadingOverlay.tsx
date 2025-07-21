import React from 'react'
import { Spinner } from '@/components/atoms'
import { clsx } from 'clsx'

export interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  progress?: number
  showProgress?: boolean
  backdrop?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Cargando...',
  progress,
  showProgress = false,
  backdrop = true,
  size = 'md',
  className,
  children,
}) => {
  if (!isVisible) {
    return <>{children}</>
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const spinnerSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  }

  return (
    <div className={clsx('relative', className)}>
      {children}
      
      {/* Overlay */}
      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center z-50',
          backdrop && 'bg-white/80 backdrop-blur-sm'
        )}
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <div className="flex flex-col items-center space-y-3 p-6">
          {/* Spinner */}
          <Spinner size={spinnerSizes[size]} />
          
          {/* Message */}
          <div className={clsx('text-gray-700 font-medium text-center', sizeClasses[size])}>
            {message}
          </div>
          
          {/* Progress bar */}
          {showProgress && typeof progress === 'number' && (
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-green h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progreso: ${progress}%`}
              />
              <div className="text-xs text-gray-600 mt-1 text-center">
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay
