// ChatErrorBoundary - Error boundary specifically for ChatWidget
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ChatWidget Error:', error, errorInfo)
    
    // Log error to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `ChatWidget Error: ${error.message}`,
        fatal: false
      })
    }

    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 max-w-[calc(100vw-2rem)]">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Error en el Asistente Virtual
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  El asistente virtual ha encontrado un problema. Puedes intentar reiniciarlo.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={this.handleRetry}
                    size="sm"
                    className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reiniciar
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Recargar página
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Simple fallback component for when ChatWidget fails to load
export function ChatWidgetFallback() {
  return (
    <div className="fixed bottom-4 right-4 z-[9998]">
      <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center shadow-lg">
        <MessageCircle className="h-6 w-6 text-white" />
      </div>
    </div>
  )
}

export default ChatErrorBoundary
