// ChatTypingIndicator Component for AI Chatbot
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

interface ChatTypingIndicatorProps {
  className?: string
  message?: string
}

export function ChatTypingIndicator({ 
  className, 
  message = "El asistente está escribiendo..." 
}: ChatTypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg bg-gray-50 mr-8 transition-all duration-300 animate-in slide-in-from-bottom-2',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
        <Bot className="h-4 w-4" aria-hidden="true" />
      </div>

      {/* Typing content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900">
            Asistente Virtual
          </span>
          <span className="text-xs text-gray-500">
            ahora
          </span>
        </div>

        {/* Typing animation */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
              aria-hidden="true"
            />
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
              aria-hidden="true"
            />
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
              aria-hidden="true"
            />
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ChatTypingIndicator
