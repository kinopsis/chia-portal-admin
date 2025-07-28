// ChatInput Component for AI Chatbot
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, AlertCircle } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  className?: string
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Escribe tu pregunta sobre trámites, servicios o información municipal...",
  maxLength = 1000,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Character count and validation
  const characterCount = message.length
  const isOverLimit = characterCount > maxLength
  const isNearLimit = characterCount > maxLength * 0.8

  return (
    <div className={cn('border-t border-gray-200 bg-white', className)}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none pr-12 transition-all duration-200',
              'border-2 bg-white text-gray-900 placeholder:text-gray-400',
              'focus:outline-none focus:ring-0 shadow-sm',
              // Enhanced focus states with municipal colors
              isFocused && !isOverLimit && 'ring-2 ring-[#009045] border-[#009045] shadow-md',
              // Improved default and hover states for better visibility
              !isFocused && !isOverLimit && 'border-gray-400 hover:border-gray-500 hover:shadow-sm',
              // Error states
              isOverLimit && 'border-red-500 focus:ring-red-500 focus:border-red-500 shadow-red-100',
              // Disabled state with better contrast
              disabled && 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-300'
            )}
            aria-label="Mensaje para el asistente virtual"
            aria-describedby="char-count message-help"
          />

          {/* Send button */}
          <Button
            type="submit"
            size="sm"
            disabled={disabled || !message.trim() || isOverLimit}
            className={cn(
              'absolute right-2 bottom-2 h-8 w-8 p-0 transition-all duration-200',
              message.trim() && !disabled && !isOverLimit
                ? 'bg-[#009045] hover:bg-[#009540] text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-[#009045] focus:ring-offset-1 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm'
            )}
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Character count and help text */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <div id="message-help" className="text-gray-500">
            {disabled ? (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                Enviando mensaje...
              </span>
            ) : (
              'Presiona Enter para enviar, Shift+Enter para nueva línea'
            )}
          </div>
          
          <div
            id="char-count"
            className={cn(
              'font-medium',
              isOverLimit && 'text-red-600',
              isNearLimit && !isOverLimit && 'text-yellow-600',
              !isNearLimit && 'text-gray-500'
            )}
            aria-live="polite"
          >
            {characterCount}/{maxLength}
          </div>
        </div>

        {/* Error message for over limit */}
        {isOverLimit && (
          <div 
            className="mt-2 text-xs text-red-600 flex items-center gap-1"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            El mensaje excede el límite de {maxLength} caracteres
          </div>
        )}

        {/* Quick suggestions */}
        {!message && !disabled && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-2">Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {[
                '¿Cómo saco mi cédula?',
                '¿Dónde pago impuestos?',
                'Horarios de atención',
                '¿Cómo registro mi empresa?'
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="text-xs h-6 px-2 text-gray-600 hover:text-gray-800"
                  aria-label={`Usar sugerencia: ${suggestion}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default ChatInput
