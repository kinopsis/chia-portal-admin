'use client'

/**
 * ServiceFormErrorBoundary Component
 * 
 * Error boundary specifically for service creation/editing forms
 * Provides graceful error handling and recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/atoms'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRetry?: () => void
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ServiceFormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ServiceFormErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {this.props.fallbackTitle || 'Error en el Formulario'}
          </h3>
          
          <p className="text-red-700 text-center mb-6 max-w-md">
            {this.props.fallbackMessage || 
              'Ha ocurrido un error al procesar el formulario. Por favor, intenta de nuevo o contacta al administrador si el problema persiste.'
            }
          </p>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={this.handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de Nuevo
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Recargar Página
            </Button>
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer font-medium text-red-800 mb-2">
                Detalles del Error (Desarrollo)
              </summary>
              <div className="bg-red-100 p-4 rounded border text-sm">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <div className="mb-2">
                    <strong>Stack Trace:</strong>
                    <pre className="text-xs mt-1 overflow-auto max-h-40 bg-white p-2 rounded border">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                {this.state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="text-xs mt-1 overflow-auto max-h-40 bg-white p-2 rounded border">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ServiceFormErrorBoundary
