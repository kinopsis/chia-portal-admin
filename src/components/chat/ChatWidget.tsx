// ChatWidget Component - Main AI Chatbot Interface
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ChatHistory from './ChatHistory'
import ChatInput from './ChatInput'
import { MessageCircle, X, Minimize2, Maximize2, HelpCircle } from 'lucide-react'
import { config } from '@/lib/config'

interface ChatWidgetProps {
  className?: string
  defaultOpen?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export function ChatWidget({ 
  className, 
  defaultOpen = false,
  position = 'bottom-right'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  // Initialize chat hook
  const {
    messages,
    isLoading,
    isTyping,
    error,
    isConnected,
    sendMessage,
    clearMessages,
    clearError,
    retryLastMessage,
    reconnect,
    sessionToken
  } = useChat({
    channel: 'web',
    maxMessages: 50,
    autoScroll: true
  })

  // Check if chatbot is enabled
  const isChatbotEnabled = config.features.ENABLE_AI_CHATBOT

  // Handle new messages notification
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        setHasNewMessage(true)
      }
    }
  }, [messages, isOpen])

  // Clear new message notification when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
    }
  }, [isOpen])

  // Handle feedback submission
  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'not_helpful', comment?: string) => {
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId,
          feedbackType: feedback,
          comment
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('Feedback submission failed:', errorData)
        // Don't throw error - allow visual feedback to work regardless
        return { success: false, error: errorData.error || 'Failed to submit feedback' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Don't throw error - allow visual feedback to work regardless
      return { success: false, error: 'Network error' }
    }
  }

  // Don't render if chatbot is disabled
  if (!isChatbotEnabled) {
    return null
  }

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <Card
          className={cn(
            'fixed z-50 w-96 h-[600px] shadow-2xl border-0 overflow-hidden',
            'animate-in slide-in-from-bottom-4 duration-300',
            positionClasses[position],
            isMinimized && 'h-12',
            className
          )}
          role="dialog"
          aria-label="Asistente Virtual del Municipio de Chía"
          aria-modal="false"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#009045] text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Asistente Virtual</h2>
                <p className="text-xs text-green-100">
                  {isConnected ? 'En línea' : 'Desconectado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Minimize/Maximize button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                aria-label={isMinimized ? 'Maximizar chat' : 'Minimizar chat'}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <div className="flex flex-col h-[calc(600px-64px)]">
              <ChatHistory
                messages={messages}
                isLoading={isLoading}
                isTyping={isTyping}
                error={error}
                isConnected={isConnected}
                onFeedback={handleFeedback}
                onRetry={retryLastMessage}
                onReconnect={reconnect}
                className="flex-1"
              />
              
              <ChatInput
                onSendMessage={sendMessage}
                disabled={isLoading || !isConnected}
                maxLength={1000}
              />
            </div>
          )}
        </Card>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed z-40 w-14 h-14 rounded-full shadow-lg bg-[#009045] hover:bg-[#009540] text-white',
            'animate-in zoom-in-50 duration-300 transition-all',
            'focus:ring-2 focus:ring-[#009045] focus:ring-offset-2',
            positionClasses[position],
            hasNewMessage && 'animate-pulse'
          )}
          aria-label="Abrir asistente virtual"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          
          {/* New message indicator */}
          {hasNewMessage && (
            <div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
              aria-label="Nuevo mensaje"
            >
              <span className="text-xs font-bold text-white">!</span>
            </div>
          )}
        </Button>
      )}

      {/* Help tooltip for first-time users */}
      {!isOpen && messages.length === 0 && (
        <div
          className={cn(
            'fixed z-30 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg',
            'animate-in fade-in-50 duration-500 delay-1000',
            position === 'bottom-right' && 'bottom-20 right-4',
            position === 'bottom-left' && 'bottom-20 left-4',
            position === 'bottom-center' && 'bottom-20 left-1/2 transform -translate-x-1/2'
          )}
          role="tooltip"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3 w-3" aria-hidden="true" />
            <span>¿Necesitas ayuda? ¡Pregúntame!</span>
          </div>
          <div 
            className={cn(
              'absolute w-2 h-2 bg-gray-900 transform rotate-45',
              position === 'bottom-right' && 'top-full right-6 -mt-1',
              position === 'bottom-left' && 'top-full left-6 -mt-1',
              position === 'bottom-center' && 'top-full left-1/2 -translate-x-1/2 -mt-1'
            )}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  )
}

export default ChatWidget
