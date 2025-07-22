/**
 * ProgressIndicator Component
 * 
 * Provides visual feedback for long-running operations with
 * accessibility support and responsive design.
 * 
 * Features:
 * - Multiple progress types (linear, circular, steps)
 * - Determinate and indeterminate progress
 * - Accessibility-compliant with ARIA attributes
 * - Responsive sizing and touch-friendly
 * - Customizable colors and animations
 */

'use client'

import React from 'react'
import { clsx } from 'clsx'

export interface ProgressIndicatorProps {
  /** Progress type */
  type?: 'linear' | 'circular' | 'steps' | 'dots'
  /** Progress value (0-100) */
  value?: number
  /** Maximum value */
  max?: number
  /** Indeterminate progress (no specific value) */
  indeterminate?: boolean
  /** Size of the progress indicator */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  /** Show progress text */
  showText?: boolean
  /** Custom progress text */
  text?: string
  /** Progress label */
  label?: string
  /** Steps for step progress */
  steps?: Array<{
    label: string
    completed: boolean
    current?: boolean
  }>
  /** Additional CSS classes */
  className?: string
  /** Unique identifier */
  id?: string
}

/**
 * ProgressIndicator component for operation feedback
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'linear',
  value = 0,
  max = 100,
  indeterminate = false,
  size = 'md',
  color = 'primary',
  showText = false,
  text,
  label,
  steps = [],
  className,
  id,
}) => {
  // Calculate percentage
  const percentage = indeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100)

  // Get color classes
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary-green'
      case 'secondary':
        return 'bg-secondary-blue'
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-primary-green'
    }
  }

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          height: 'h-1',
          width: 'w-4 h-4',
          text: 'text-xs',
        }
      case 'md':
        return {
          height: 'h-2',
          width: 'w-6 h-6',
          text: 'text-sm',
        }
      case 'lg':
        return {
          height: 'h-3',
          width: 'w-8 h-8',
          text: 'text-base',
        }
      case 'xl':
        return {
          height: 'h-4',
          width: 'w-10 h-10',
          text: 'text-lg',
        }
      default:
        return {
          height: 'h-2',
          width: 'w-6 h-6',
          text: 'text-sm',
        }
    }
  }

  const sizeClasses = getSizeClasses()

  // Render linear progress
  const renderLinearProgress = () => (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className={clsx('font-medium text-gray-700', sizeClasses.text)}>
            {label}
          </span>
          {showText && (
            <span className={clsx('text-gray-500', sizeClasses.text)}>
              {text || `${Math.round(percentage)}%`}
            </span>
          )}
        </div>
      )}
      
      <div
        className={clsx(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses.height
        )}
      >
        <div
          className={clsx(
            'transition-all duration-300 ease-out rounded-full',
            getColorClasses(),
            sizeClasses.height,
            {
              'animate-pulse-soft': indeterminate,
              'reduced-motion:animate-none': true,
            }
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            transform: indeterminate ? 'translateX(-100%)' : 'none',
            animation: indeterminate ? 'slideRight 2s ease-in-out infinite' : undefined,
          }}
        />
      </div>
    </div>
  )

  // Render circular progress
  const renderCircularProgress = () => {
    const radius = 20
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          className={clsx(
            'transform -rotate-90',
            sizeClasses.width,
            {
              'animate-spin': indeterminate,
              'reduced-motion:animate-none': true,
            }
          )}
          viewBox="0 0 50 50"
        >
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            className={getColorClasses().replace('bg-', 'text-')}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: indeterminate ? circumference * 0.75 : strokeDashoffset,
              transition: 'stroke-dashoffset 0.3s ease',
            }}
          />
        </svg>
        
        {showText && !indeterminate && (
          <span
            className={clsx(
              'absolute inset-0 flex items-center justify-center font-medium',
              sizeClasses.text
            )}
          >
            {text || `${Math.round(percentage)}%`}
          </span>
        )}
      </div>
    )
  }

  // Render steps progress
  const renderStepsProgress = () => (
    <div className="w-full">
      {label && (
        <h3 className={clsx('font-medium text-gray-700 mb-4', sizeClasses.text)}>
          {label}
        </h3>
      )}
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'rounded-full border-2 flex items-center justify-center',
                  sizeClasses.width,
                  {
                    [getColorClasses()]: step.completed || step.current,
                    'border-current': step.completed || step.current,
                    'bg-white border-gray-300': !step.completed && !step.current,
                    'ring-2 ring-offset-2': step.current,
                  }
                )}
              >
                {step.completed ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span
                    className={clsx(
                      'text-xs font-medium',
                      step.current ? 'text-white' : 'text-gray-500'
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span className={clsx('mt-2 text-center', sizeClasses.text, 'max-w-20')}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2',
                  step.completed ? getColorClasses() : 'bg-gray-300'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  // Render dots progress
  const renderDotsProgress = () => (
    <div className="flex items-center justify-center space-x-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'rounded-full animate-bounce',
            getColorClasses(),
            size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  )

  // Render progress based on type
  const renderProgress = () => {
    switch (type) {
      case 'circular':
        return renderCircularProgress()
      case 'steps':
        return renderStepsProgress()
      case 'dots':
        return renderDotsProgress()
      case 'linear':
      default:
        return renderLinearProgress()
    }
  }

  return (
    <div
      id={id}
      className={clsx('w-full', className)}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || 'Progreso de la operación'}
      aria-live="polite"
    >
      {renderProgress()}
    </div>
  )
}

export default ProgressIndicator
