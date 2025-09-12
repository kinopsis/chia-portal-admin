// ChatWidget Improved - Enhanced UX/UI Implementation
// Addresses header design, accessibility, and visual hierarchy issues

'use client'

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/useChat'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
const ChatHistoryLazy = lazy(() => import('./ChatHistory'))
const ChatInputLazy = lazy(() => import('./ChatInput'))
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
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Focus management
  const focusInputRef = useRef<(() => void) | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

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

  // Prefers-reduced-motion detection
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(!!mq.matches)
    apply()
    if (mq.addEventListener) mq.addEventListener('change', apply)
    else mq.addListener(apply)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply)
      else mq.removeListener(apply)
    }
  }, [])

  // Idle prefetch of lazy components after 2s
  useEffect(() => {
    const t = setTimeout(() => {
      import('./ChatHistory')
      import('./ChatInput')
    }, 2000)
    return () => clearTimeout(t)
  }, [])

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

  // Initial focus and focus restore management
  useEffect(() => {
    if (isOpen) {
      // Defer to ensure elements are in DOM
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 0)
    } else {
      // Restore focus to the FAB or previously focused element
      setTimeout(() => {
        if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
          previouslyFocusedRef.current.focus()
        } else {
          const fab = document.querySelector('[data-testid="chat-fab"]') as HTMLElement | null
          fab?.focus?.()
        }
      }, 0)
    }
  }, [isOpen])

  // Escape-to-close global handler while dialog is open
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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
        color: 'text-error',
        bgColor: 'bg-error/20'
      }
    }

    if (isLoading || isTyping) {
      return {
        icon: Clock,
        text: 'Escribiendo...',
        color: 'text-accent',
        bgColor: 'bg-accent/20'
      }
    }

    return {
      icon: CheckCircle,
      text: 'En línea',
      color: 'text-success',
      bgColor: 'bg-success/20'
    }
  }

  const connectionStatus = getConnectionStatus()
  const liveStatusText = isTyping ? 'Escribiendo…' : connectionStatus.text

  // Focus trap handler for Tab navigation within the dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const dialogEl = dialogRef.current
    if (!dialogEl) return
    const focusable = dialogEl.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const focusables = Array.from(focusable).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    )
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

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
            reducedMotion ? 'bg-black/50' : 'bg-black/40 backdrop-blur-sm',
            reducedMotion ? '' : 'animate-in fade-in duration-300',
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
            'fixed z-[9999] overflow-hidden flex flex-col',
            // Enhanced background and contrast
            'bg-white/98 backdrop-blur-md',
            'border border-[color:var(--color-primary-green)]/20 shadow-2xl',
            'ring-1 ring-black/5',
            reducedMotion ? '' : 'animate-in slide-in-from-bottom-4 duration-300',
            // Mobile near-fullscreen sheet with safe-area support
            'w-[calc(100vw-1rem)] h-[calc(100vh-2rem)]',
            'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
            // Tablet/Desktop sizes
            'md:w-96 md:h-[600px]',
            positionClasses[position],
            isMinimized && 'h-16', // Increased minimized height for better header visibility
            className
          )}
          role="dialog"
          aria-labelledby="chat-widget-title"
          aria-describedby="chat-widget-instructions chat-live-status"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          ref={dialogRef}
          onFocus={(e) => {
            if (!previouslyFocusedRef.current) {
              previouslyFocusedRef.current = e.relatedTarget as HTMLElement | null
            }
          }}
          data-chat-widget="true"
          data-testid="chat-widget"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Header */}
          <div data-testid="chat-header" className={cn(
            'flex items-center justify-between px-4',
            isMinimized ? 'h-16 py-0' : 'py-3',
            'bg-gradient-to-r from-[color:var(--color-primary-green)] to-[color:var(--color-primary-green-dark)]',
            'text-white shadow-lg',
            // Keep header always visible
            'sticky top-0 z-10',
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
                <h2 id="chat-widget-title" className="font-semibold text-base leading-tight truncate">
                  Asistente Virtual
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs',
                    'transition-all duration-200',
                    connectionStatus.bgColor
                  )}>
                    <connectionStatus.icon aria-hidden="true" className={cn('h-3 w-3', connectionStatus.color)} />
                    <span className={connectionStatus.color}>
                      {connectionStatus.text}
                    </span>
                  </div>
                  
                  {/* Municipality Branding */}
                  <span className="text-xs opacity-80 truncate">
                    Municipio de Chía
                  </span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Control Buttons */}
            <div className="flex items-center gap-1 ml-2">
              {/* Settings button (optional) */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  'h-11 w-11 p-0 text-white/80 hover:text-white',
                  'hover:bg-white/20 focus:bg-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'transition-all duration-200'
                )}
                aria-label="Configuración del chat"
              >
                <Settings aria-hidden="true" className="h-4 w-4" />
              </Button>
              
              {/* Minimize/Maximize button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className={cn(
                  'h-11 w-11 p-0 text-white/80 hover:text-white',
                  'hover:bg-white/20 focus:bg-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'transition-all duration-200'
                )}
                aria-label={isMinimized ? 'Maximizar chat' : 'Minimizar chat'}
              >
                {isMinimized ? (
                  <Maximize2 aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Minimize2 aria-hidden="true" className="h-4 w-4" />
                )}
              </Button>
              
              {/* Close button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'h-11 w-11 p-0 text-white/80 hover:text-white',
                  'hover:bg-error/20 focus:bg-error/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  'transition-all duration-200'
                )}
                aria-label="Cerrar chat"
                ref={closeButtonRef}
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Settings Panel (if enabled) */}
          {showSettings && !isMinimized && (
            <div className="bg-background-secondary border-b border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-text-primary">Configuración</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="h-11 w-11 p-0 text-text-muted hover:text-text-primary"
                  aria-label="Cerrar configuración"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
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
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearError}
                    className="w-full text-xs text-error border-error/50 hover:bg-error/10"
                  >
                    Limpiar errores
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Chat content */}
          {!isMinimized && (
            <div data-testid="chat-content" className={cn(
              'flex flex-col bg-background flex-1 min-h-0',
              'overflow-hidden'
            )}>
              <p id="chat-widget-instructions" className="sr-only">Escribe tu mensaje y presiona Enter para enviar. Usa Tab para navegar por los controles y Escape para cerrar el chat.</p>
              <div id="chat-live-status" data-testid="chat-live-status" aria-live="polite" role="status" className="sr-only">{liveStatusText}</div>
              <Suspense fallback={<div role="status" aria-live="polite" className="p-3 text-sm">Cargando…</div>}>
                <ChatHistoryLazy
                  messages={messages}
                  isLoading={isLoading}
                  isTyping={isTyping}
                  error={error}
                  isConnected={isConnected}
                  onFeedback={handleFeedback}
                  onRetry={retryLastMessage}
                  onReconnect={reconnect}
                  className="flex-1 min-h-0 overflow-y-auto"
                />
                <ChatInputLazy
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
              </Suspense>
              {/* Safe-area spacer for notches */}
              <div aria-hidden="true" data-testid="chat-safe-area-spacer" className="h-[env(safe-area-inset-bottom)]" />
            </div>
          )}
        </Card>
      )}

      {/* Enhanced Floating Action Button */}
      {!isOpen && (
        <Button
          type="button"
          onMouseEnter={() => { import('./ChatHistory'); import('./ChatInput') }}
          onFocus={() => { import('./ChatHistory'); import('./ChatInput') }}
          onClick={() => {
            previouslyFocusedRef.current = document.activeElement as HTMLElement
            setIsOpen(true)
          }}
          className={cn(
            'fixed z-[9999] h-14 w-14 rounded-full shadow-lg',
            'bg-gradient-to-r from-[color:var(--color-primary-green)] to-[color:var(--color-primary-green-dark)]',
            'hover:from-[color:var(--color-primary-green-dark)] hover:to-[color:var(--color-primary-green)]',
            'text-white border-2 border-white/20',
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-xl',
            'focus:outline-none focus:ring-4 focus:ring-[color:var(--color-primary-green)]/30',
            'active:scale-95',
            positionClasses[position],
            hasNewMessage && 'animate-pulse'
          )}
          aria-label="Abrir asistente virtual"
          data-testid="chat-fab"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
            {/* New message indicator */}
            {hasNewMessage && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-error rounded-full border-2 border-white animate-ping" />
            )}
          </div>
        </Button>
      )}
    </>
  )
}

export default ChatWidget
