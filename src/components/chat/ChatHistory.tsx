// ChatHistory Component for AI Chatbot
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage as ChatMessageType } from '@/hooks/useChat'
import ChatMessage from './ChatMessage'
import ChatTypingIndicator from './ChatTypingIndicator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react'

interface ChatHistoryProps {
  messages: ChatMessageType[]
  isLoading?: boolean
  isTyping?: boolean
  error?: string | null
  isConnected?: boolean
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful', comment?: string) => void
  onRetry?: () => void
  onReconnect?: () => void
  className?: string
  autoScroll?: boolean
}

export function ChatHistory({
  messages,
  isLoading = false,
  isTyping = false,
  error = null,
  isConnected = true,
  onFeedback,
  onRetry,
  onReconnect,
  className,
  autoScroll = true
}: ChatHistoryProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      // Check if scrollIntoView is available (not available in test environments)
      if (typeof messagesEndRef.current.scrollIntoView === 'function') {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        })
      } else {
        // Fallback for test environments
        const scrollArea = scrollAreaRef.current
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight
        }
      }
    }
  }, [messages, isTyping, autoScroll])

  // Handle feedback submission
  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'not_helpful', comment?: string) => {
    if (onFeedback) {
      try {
        const result = await onFeedback(messageId, feedback, comment)
        // Visual feedback will be handled by ChatMessage component
        return result
      } catch (error) {
        console.error('Error submitting feedback:', error)
        // Return error result for visual feedback
        return { success: false, error: 'Failed to submit feedback' }
      }
    }
    return { success: false, error: 'No feedback handler available' }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Connection status */}
      {!isConnected && (
        <div className="flex items-center justify-between p-3 bg-error/10 border-b border-error/20 text-error">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Sin conexión</span>
          </div>
          {onReconnect && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              className="h-7 px-2 text-xs border-error/50 hover:bg-error/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
              Reconectar
            </Button>
          )}
        </div>
      )}

      {/* Messages area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4"
        aria-label="Historial de conversación"
      >
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="h-8 w-8 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                ¡Hola! Soy tu asistente virtual
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Estoy aquí para ayudarte con información sobre trámites, servicios municipales,
                horarios de atención y preguntas frecuentes del municipio de Chía.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onFeedback={message.role === 'assistant' ? handleFeedback : undefined}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && <ChatTypingIndicator />}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error mb-1">
                  Error en la conversación
                </p>
                <p className="text-sm text-error/80 mb-3">
                  {error}
                </p>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="h-7 px-3 text-xs border-error/50 hover:bg-error/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !isTyping && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-text-muted">
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="text-sm">Procesando...</span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      </ScrollArea>

      {/* Footer info */}
      <div className="px-4 py-2 border-t border-border bg-background-secondary">
        <p className="text-xs text-text-muted text-center">
          Asistente Virtual del Municipio de Chía •
          Para emergencias llama al 123 •
          Atención presencial: Lunes a Viernes 8:00 AM - 5:00 PM
        </p>
      </div>
    </div>
  )
}

export default ChatHistory
