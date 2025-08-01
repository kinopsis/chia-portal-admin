// ChatWidget Improved - Enhanced UX/UI Implementation
// Addresses header design, accessibility, and visual hierarchy issues

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ChatHistory from './ChatHistory'
import ChatInput from './ChatInput'
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Settings, 
  Wifi, 
  WifiOff,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
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
}: ChatWidgetImprovedProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Focus management
  const focusInputRef = useRef<(() => void) | null>(null)

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
    if (messages.length > 0 && !isOpen) {
      setHasNewMessage(true)
    }
  }, [messages.length, isOpen])

  // Clear new message notification when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
    }
  }, [isOpen])

  // Enhanced feedback submission
  const handleFeedback = async (messageId: string, feedback: 'helpful' | 'not_helpful', comment?: string) => {
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
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
        return { success: false, error: errorData.error || 'Failed to submit feedback' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Get connection status details
  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        text: 'Desconectado',
        color: 'text-red-200',
        bgColor: 'bg-red-500/20'
      }
    }
    
    if (isLoading || isTyping) {
      return {
        icon: Clock,
        text: 'Escribiendo...',
        color: 'text-blue-200',
        bgColor: 'bg-blue-500/20'
      }
    }

    return {
      icon: CheckCircle,
      text: 'En línea',
      color: 'text-green-200',
      bgColor: 'bg-green-500/20'
    }
  }

  const connectionStatus = getConnectionStatus()

  // Don't render if chatbot is disabled
  if (!isChatbotEnabled) {
    return null
  }

  // Position classes with responsive adjustments
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-6'
  }

  return (
    <>
      {/* Enhanced Backdrop with blur effect */}
      {isOpen && (
        <div
          className={cn(
            'fixed inset-0 z-[9998]',
            'bg-black/40 backdrop-blur-sm',
            'animate-in fade-in duration-300',
            'transition-all ease-out'
          )}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          data-testid="chat-backdrop"
        />
      )}

      {/* Enhanced Chat Widget */}
      {isOpen && (
        <Card
          className={cn(
            'fixed z-[9999] overflow-hidden',
            // Enhanced background and contrast
            'bg-white/98 backdrop-blur-md',
            'border border-[#009045]/20 shadow-2xl',
            'ring-1 ring-black/5',
            'animate-in slide-in-from-bottom-4 duration-300',
            'w-96 h-[600px]', // Default desktop size
            'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]', // Responsive constraints
            'sm:w-96 sm:h-[600px]', // Maintain size on larger screens
            positionClasses[position],
            isMinimized && 'h-16', // Increased minimized height for better header visibility
            className
          )}
          role="dialog"
          aria-label="Asistente Virtual del Municipio de Chía"
          aria-modal="true"
          data-chat-widget="true"
          data-testid="chat-widget"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div className={cn(
            'flex items-center justify-between px-4 py-3',
            'bg-gradient-to-r from-[#009045] to-[#007A3A]',
            'text-white shadow-lg',
            // Better height for touch targets
            'min-h-[64px]'
          )}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Enhanced Avatar/Icon */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'bg-white/20 backdrop-blur-sm border border-white/30',
                'shadow-sm'
              )}>
                <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              
              {/* Enhanced Title and Status */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base leading-tight truncate">
                  Asistente Virtual
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs',
                    'transition-all duration-200',
                    connectionStatus.bgColor
                  )}>
                    <connectionStatus.icon className={cn('h-3 w-3', connectionStatus.color)} />
                    <span className={connectionStatus.color}>
                      {connectionStatus.text}
                    </span>
                  </div>
                  
                  {/* Municipality Branding */}
                  <span className="text-xs text-green-100 truncate">
                    Municipio de Chía
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Control Buttons */}
            <div className="flex items-center gap-1 ml-2">
              {/* Settings button (optional) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  'h-9 w-9 p-0 text-white/80 hover:text-white',
                  'hover:bg-white/20 focus:bg-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'transition-all duration-200'
                )}
                aria-label="Configuración del chat"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              {/* Minimize/Maximize button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className={cn(
                  'h-9 w-9 p-0 text-white/80 hover:text-white',
                  'hover:bg-white/20 focus:bg-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'transition-all duration-200'
                )}
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
                className={cn(
                  'h-9 w-9 p-0 text-white/80 hover:text-white',
                  'hover:bg-red-500/20 focus:bg-red-500/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'transition-all duration-200'
                )}
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel (if enabled) */}
          {showSettings && !isMinimized && (
            <div className="bg-gray-50 border-b border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Configuración</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  className="w-full text-xs"
                  disabled={messages.length === 0}
                >
                  Limpiar conversación
                </Button>
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearError}
                    className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Limpiar errores
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Chat content */}
          {!isMinimized && (
            <div className={cn(
              'flex flex-col bg-white/95',
              showSettings ? 'h-[calc(600px-64px-80px)]' : 'h-[calc(600px-64px)]'
            )}>
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
                autoFocus={true}
                shouldFocusAfterResponse={true}
                onFocusRequest={focusInputRef}
                showCharacterCount={true}
                showSuggestions={true}
                enableVoiceInput={false}
                enableAttachments={false}
              />
            </div>
          )}
        </Card>
      )}

      {/* Enhanced Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed z-[9999] h-14 w-14 rounded-full shadow-lg',
            'bg-gradient-to-r from-[#009045] to-[#007A3A]',
            'hover:from-[#007A3A] hover:to-[#006B35]',
            'text-white border-2 border-white/20',
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-xl',
            'focus:outline-none focus:ring-4 focus:ring-[#009045]/30',
            'active:scale-95',
            positionClasses[position],
            // Pulse animation for new messages
            hasNewMessage && 'animate-pulse'
          )}
          aria-label="Abrir asistente virtual"
          data-testid="chat-fab"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {/* New message indicator */}
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
            )}
          </div>
        </Button>
      )}
    </>
  )
}

export default ChatWidget
