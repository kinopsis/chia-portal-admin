'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/atoms'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
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
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Algo salió mal
          </h3>
          
          <p className="text-red-700 text-center mb-4 max-w-md">
            Ha ocurrido un error inesperado. Por favor, intenta recargar la página o contacta al soporte técnico si el problema persiste.
          </p>

          {this.props.showDetails && this.state.error && (
            <details className="mb-4 w-full max-w-md">
              <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                Ver detalles del error
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800 font-mono overflow-auto max-h-32">
                <div className="font-semibold mb-1">Error:</div>
                <div className="mb-2">{this.state.error.message}</div>
                {this.state.errorInfo && (
                  <>
                    <div className="font-semibold mb-1">Stack trace:</div>
                    <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                  </>
                )}
              </div>
            </details>
          )}

          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={this.handleRetry}
            >
              Reintentar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
