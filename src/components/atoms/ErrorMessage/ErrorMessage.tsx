/**
 * ErrorMessage Component
 * 
 * Provides contextual and actionable error messages with proper
 * accessibility support and user-friendly guidance.
 * 
 * Features:
 * - Multiple error types (validation, network, system, etc.)
 * - Actionable error messages with retry buttons
 * - Accessibility-compliant with ARIA attributes
 * - Responsive design with touch-friendly actions
 * - Auto-dismiss functionality
 */

'use client'

import React, { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/atoms'

export interface ErrorMessageProps {
  /** Error message text */
  message: string
  /** Error type */
  type?: 'validation' | 'network' | 'system' | 'permission' | 'generic'
  /** Error severity */
  severity?: 'error' | 'warning' | 'info'
  /** Show retry button */
  showRetry?: boolean
  /** Retry function */
  onRetry?: () => void
  /** Show dismiss button */
  showDismiss?: boolean
  /** Dismiss function */
  onDismiss?: () => void
  /** Auto dismiss after milliseconds */
  autoDismiss?: number
  /** Additional context or help text */
  context?: string
  /** Suggested actions */
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'primary' | 'secondary'
  }>
  /** Additional CSS classes */
  className?: string
  /** Unique identifier for the error */
  id?: string
}

/**
 * ErrorMessage component for user-friendly error handling
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'generic',
  severity = 'error',
  showRetry = false,
  onRetry,
  showDismiss = true,
  onDismiss,
  autoDismiss,
  context,
  actions = [],
  className,
  id,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)

  // Auto dismiss functionality
  useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoDismiss)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss])

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  // Handle retry
  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  // Get icon based on severity and type
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="w-5 h-5 xs:w-6 xs:h-6 text-red-500 flex-shrink-0" aria-hidden="true" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 xs:w-6 xs:h-6 text-yellow-500 flex-shrink-0" aria-hidden="true" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 xs:w-6 xs:h-6 text-blue-500 flex-shrink-0" aria-hidden="true" />
      default:
        return <XCircleIcon className="w-5 h-5 xs:w-6 xs:h-6 text-red-500 flex-shrink-0" aria-hidden="true" />
    }
  }

  // Get contextual message based on error type
  const getContextualMessage = () => {
    if (context) return context

    switch (type) {
      case 'network':
        return 'Verifica tu conexión a internet e intenta nuevamente.'
      case 'validation':
        return 'Por favor, revisa los datos ingresados y corrige los errores.'
      case 'permission':
        return 'No tienes permisos suficientes para realizar esta acción.'
      case 'system':
        return 'Ha ocurrido un error interno. Nuestro equipo ha sido notificado.'
      default:
        return 'Si el problema persiste, contacta al soporte técnico.'
    }
  }

  // Get background color based on severity
  const getBackgroundColor = () => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-red-50 border-red-200'
    }
  }

  // Get text color based on severity
  const getTextColor = () => {
    switch (severity) {
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-red-800'
    }
  }

  if (!isVisible) return null

  return (
    <div
      id={id}
      className={clsx(
        'rounded-lg border p-mobile-sm xs:p-mobile-md sm:p-4 animate-slide-down',
        getBackgroundColor(),
        className
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        {getIcon()}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Main message */}
          <h3 className={clsx('text-sm xs:text-base font-medium', getTextColor())}>
            {message}
          </h3>

          {/* Context message */}
          <p className={clsx('mt-1 text-xs xs:text-sm', getTextColor(), 'opacity-80')}>
            {getContextualMessage()}
          </p>

          {/* Actions */}
          {(showRetry || actions.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {/* Retry button */}
              {showRetry && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="min-h-touch-sm text-xs xs:text-sm"
                  aria-label="Reintentar operación"
                >
                  <ArrowPathIcon 
                    className={clsx(
                      'w-4 h-4 mr-1',
                      isRetrying && 'animate-spin'
                    )} 
                    aria-hidden="true" 
                  />
                  {isRetrying ? 'Reintentando...' : 'Reintentar'}
                </Button>
              )}

              {/* Custom actions */}
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={action.action}
                  className="min-h-touch-sm text-xs xs:text-sm"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="min-h-touch-sm min-w-touch-sm p-1 -mr-1 -mt-1 flex-shrink-0"
            aria-label="Cerrar mensaje de error"
          >
            <XMarkIcon className="w-4 h-4 xs:w-5 xs:h-5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage

/**
 * Preset configurations for common error scenarios
 */
export const ErrorPresets = {
  // Network connection error
  networkError: {
    type: 'network' as const,
    severity: 'error' as const,
    showRetry: true,
    message: 'Error de conexión',
  },
  
  // Form validation error
  validationError: {
    type: 'validation' as const,
    severity: 'warning' as const,
    showRetry: false,
    message: 'Datos inválidos',
  },
  
  // Permission denied error
  permissionError: {
    type: 'permission' as const,
    severity: 'error' as const,
    showRetry: false,
    message: 'Acceso denegado',
  },
  
  // System error
  systemError: {
    type: 'system' as const,
    severity: 'error' as const,
    showRetry: true,
    message: 'Error del sistema',
  },
} as const
