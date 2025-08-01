// ChatInput Improved - UX/UI Audit Implementation
// Addresses all identified usability and accessibility issues

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, AlertCircle, Mic, Paperclip, Smile } from 'lucide-react'

interface ChatInputImprovedProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
  autoFocus?: boolean
  shouldFocusAfterResponse?: boolean
  onFocusRequest?: () => void
  // New UX improvements
  showCharacterCount?: boolean
  showSuggestions?: boolean
  enableVoiceInput?: boolean
  enableAttachments?: boolean
}

export function ChatInputImproved({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu pregunta sobre trámites, servicios o información municipal...",
  maxLength = 1000,
  className,
  autoFocus = false,
  shouldFocusAfterResponse = true,
  onFocusRequest,
  showCharacterCount = true,
  showSuggestions = true,
  enableVoiceInput = false,
  enableAttachments = false
}: ChatInputImprovedProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Quick suggestions for better UX
  const quickSuggestions = [
    "¿Cómo saco mi cédula?",
    "Horarios de atención",
    "¿Dónde pago impuestos?",
    "Registro de empresa"
  ]

  // Auto-resize textarea with improved logic
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120)
      textarea.style.height = `${newHeight}px`
    }
  }, [message])

  // Enhanced focus management
  useEffect(() => {
    if (autoFocus && textareaRef.current && !disabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoFocus, disabled])

  // Focus after response with improved timing
  useEffect(() => {
    if (shouldFocusAfterResponse && !isComposing && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [shouldFocusAfterResponse, isComposing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    
    if (trimmedMessage && !disabled && !isOverLimit) {
      onSendMessage(trimmedMessage)
      setMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    textareaRef.current?.focus()
  }

  // Character count and validation
  const characterCount = message.length
  const isOverLimit = characterCount > maxLength
  const isNearLimit = characterCount > maxLength * 0.8
  const canSend = message.trim().length > 0 && !isOverLimit && !disabled

  return (
    <div className={cn('border-t border-gray-200 bg-white', className)}>
      {/* Quick Suggestions */}
      {showSuggestions && message.length === 0 && !isFocused && (
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs font-medium text-gray-600 mb-2">Preguntas frecuentes:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full border transition-all duration-200',
                  'bg-gray-50 border-gray-200 text-gray-700',
                  'hover:bg-[#009045] hover:text-white hover:border-[#009045]',
                  'focus:outline-none focus:ring-2 focus:ring-[#009045] focus:ring-offset-1',
                  'active:scale-95'
                )}
                disabled={disabled}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          {/* Main Input Container */}
          <div className={cn(
            'relative rounded-lg border-2 transition-all duration-200',
            'bg-white shadow-sm',
            // Enhanced focus states with better contrast
            isFocused && !isOverLimit && 'ring-2 ring-[#009045]/20 border-[#009045] shadow-md',
            // Improved default state with better visibility
            !isFocused && !isOverLimit && 'border-gray-300 hover:border-gray-400 hover:shadow-sm',
            // Clear error states
            isOverLimit && 'border-red-500 ring-2 ring-red-500/20 shadow-red-100',
            // Enhanced disabled state
            disabled && 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
          )}>
            
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'min-h-[44px] max-h-[120px] resize-none border-0 pr-16 pl-4 py-3',
                'bg-transparent text-gray-900 placeholder:text-gray-500',
                'focus:outline-none focus:ring-0 shadow-none',
                // Improved placeholder contrast (WCAG AA compliant)
                'placeholder:text-gray-500',
                // Better text sizing for readability
                'text-sm leading-relaxed'
              )}
              aria-label="Mensaje para el asistente virtual"
              aria-describedby={cn(
                showCharacterCount && "char-count",
                "message-help"
              )}
              maxLength={maxLength}
            />

            {/* Action Buttons Container */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Optional: Voice Input Button */}
              {enableVoiceInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-[#009045] hover:bg-[#009045]/10"
                  aria-label="Grabar mensaje de voz"
                  disabled={disabled}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}

              {/* Optional: Attachment Button */}
              {enableAttachments && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-[#009045] hover:bg-[#009045]/10"
                  aria-label="Adjuntar archivo"
                  disabled={disabled}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              )}

              {/* Send Button - Enhanced Design */}
              <Button
                type="submit"
                size="sm"
                disabled={!canSend}
                className={cn(
                  'h-8 w-8 p-0 rounded-md transition-all duration-200',
                  // Enhanced enabled state with better contrast
                  canSend && 'bg-[#009045] hover:bg-[#007A3A] text-white shadow-sm hover:shadow-md',
                  canSend && 'focus:outline-none focus:ring-2 focus:ring-[#009045] focus:ring-offset-2',
                  canSend && 'active:scale-95',
                  // Improved disabled state
                  !canSend && 'bg-gray-200 text-gray-400 cursor-not-allowed',
                  // Loading state
                  disabled && 'opacity-60'
                )}
                aria-label={canSend ? "Enviar mensaje" : "Escribe un mensaje para enviar"}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Character Count and Status */}
          {showCharacterCount && (
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2">
                {/* Status Indicator */}
                {isOverLimit && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">Mensaje muy largo</span>
                  </div>
                )}
                {isNearLimit && !isOverLimit && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">Cerca del límite</span>
                  </div>
                )}
              </div>

              {/* Character Counter */}
              <div
                id="char-count"
                className={cn(
                  'text-xs transition-colors duration-200',
                  isOverLimit && 'text-red-600 font-medium',
                  isNearLimit && !isOverLimit && 'text-amber-600',
                  !isNearLimit && 'text-gray-400'
                )}
                aria-live="polite"
              >
                {characterCount}/{maxLength}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div id="message-help" className="sr-only">
            Escribe tu pregunta y presiona Enter para enviar, o Shift+Enter para nueva línea.
            {isOverLimit && ` El mensaje excede el límite de ${maxLength} caracteres.`}
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChatInputImproved
