// ChatMessage Component for AI Chatbot
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage as ChatMessageType } from '@/hooks/useChat'
import { Bot, User, AlertTriangle, ExternalLink, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ChatMessageProps {
  message: ChatMessageType
  onFeedback?: (messageId: string, feedback: 'helpful' | 'not_helpful') => Promise<{ success: boolean; error?: string }>
  className?: string
}

export function ChatMessage({ message, onFeedback, className }: ChatMessageProps) {
  const [feedbackState, setFeedbackState] = React.useState<{
    helpful?: 'loading' | 'success' | 'error'
    not_helpful?: 'loading' | 'success' | 'error'
  }>({})

  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isAssistant = message.role === 'assistant'

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date)
  }

  // Get confidence color based on score
  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-neutral'
    if (confidence >= 0.8) return 'bg-success'
    if (confidence >= 0.6) return 'bg-warning'
    return 'bg-error'
  }

  // Get confidence text
  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Sin evaluar'
    if (confidence >= 0.8) return 'Alta confianza'
    if (confidence >= 0.6) return 'Confianza media'
    return 'Baja confianza'
  }

  // Render message content with links
  const renderContent = (content: string) => {
    // Simple link detection and replacement
    const linkRegex = /(https?:\/\/[^\s]+)/g
    const parts = content.split(linkRegex)

    return parts.map((part, index) => {
      if (linkRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 underline inline-flex items-center gap-1"
            aria-label={`Enlace externo: ${part}`}
          >
            {part}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )
      }
      return part
    })
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg transition-colors',
        isUser && 'bg-accent/5 ml-8',
        isAssistant && 'bg-background-secondary mr-8',
        isSystem && 'bg-warning/5 mx-4 border border-warning/20',
        className
      )}
      role="article"
      aria-label={`Mensaje de ${isUser ? 'usuario' : isAssistant ? 'asistente' : 'sistema'}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser && 'bg-accent text-white',
          isAssistant && 'bg-success text-white',
          isSystem && 'bg-warning text-white'
        )}
        aria-hidden="true"
      >
        {isUser && <User className="h-4 w-4" />}
        {isAssistant && <Bot className="h-4 w-4" />}
        {isSystem && <AlertTriangle className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-text-primary">
            {isUser && 'Tú'}
            {isAssistant && 'Asistente Virtual'}
            {isSystem && 'Sistema'}
          </span>

          <time
            className="text-xs text-text-muted"
            dateTime={message.timestamp.toISOString()}
          >
            {formatTime(message.timestamp)}
          </time>

          {/* Confidence indicator for assistant messages */}
          {isAssistant && message.confidence !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        getConfidenceColor(message.confidence)
                      )}
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      Nivel de confianza: {getConfidenceText(message.confidence)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getConfidenceText(message.confidence)} ({Math.round((message.confidence || 0) * 100)}%)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Escalation indicator */}
          {message.escalatedToHuman && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
              Escalado a funcionario
            </Badge>
          )}
        </div>

        {/* Message text */}
        <div className="text-sm text-text-primary whitespace-pre-wrap break-words">
          {renderContent(message.content)}
        </div>

        {/* Sources */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-border">
            <p className="text-xs text-text-secondary mb-1">Fuentes consultadas:</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Feedback buttons for assistant messages */}
        {isAssistant && onFeedback && (
          <div className="mt-3 pt-2 border-t border-border">
            <p className="text-xs text-text-secondary mb-2">¿Te fue útil esta respuesta?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={feedbackState.helpful === 'loading'}
                onClick={async () => {
                  setFeedbackState(prev => ({ ...prev, helpful: 'loading' }))
                  try {
                    const messageId = message.dbId || message.id
                    const result = await onFeedback(messageId, 'helpful')
                    setFeedbackState(prev => ({
                      ...prev,
                      helpful: result?.success ? 'success' : 'error'
                    }))
                  } catch (error) {
                    setFeedbackState(prev => ({ ...prev, helpful: 'error' }))
                  }
                }}
                className={cn(
                  "text-xs h-7 px-2 transition-all duration-200",
                  feedbackState.helpful === 'success' && "bg-success/10 border-success/50 text-success",
                  feedbackState.helpful === 'error' && "bg-error/10 border-error/50 text-error"
                )}
                aria-label="Marcar respuesta como útil"
              >
                {feedbackState.helpful === 'loading' ? (
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-text-muted border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : feedbackState.helpful === 'success' ? (
                  '✓ Útil'
                ) : feedbackState.helpful === 'error' ? (
                  '⚠ Error'
                ) : (
                  '👍 Útil'
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={feedbackState.not_helpful === 'loading'}
                onClick={async () => {
                  setFeedbackState(prev => ({ ...prev, not_helpful: 'loading' }))
                  try {
                    const messageId = message.dbId || message.id
                    const result = await onFeedback(messageId, 'not_helpful')
                    setFeedbackState(prev => ({
                      ...prev,
                      not_helpful: result?.success ? 'success' : 'error'
                    }))
                  } catch (error) {
                    setFeedbackState(prev => ({ ...prev, not_helpful: 'error' }))
                  }
                }}
                className={cn(
                  "text-xs h-7 px-2 transition-all duration-200",
                  feedbackState.not_helpful === 'success' && "bg-success/10 border-success/50 text-success",
                  feedbackState.not_helpful === 'error' && "bg-error/10 border-error/50 text-error"
                )}
                aria-label="Marcar respuesta como no útil"
              >
                {feedbackState.not_helpful === 'loading' ? (
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-text-muted border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : feedbackState.not_helpful === 'success' ? (
                  '✓ Registrado'
                ) : feedbackState.not_helpful === 'error' ? (
                  '⚠ Error'
                ) : (
                  '👎 No útil'
                )}
              </Button>
            </div>
            {(feedbackState.helpful === 'error' || feedbackState.not_helpful === 'error') && (
              <p className="text-xs text-error mt-1">
                No se pudo enviar el feedback, pero tu opinión es importante para nosotros.
              </p>
            )}
          </div>
        )}

        {/* Low confidence warning */}
        {isAssistant && message.confidence !== undefined && message.confidence < 0.7 && (
          <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
            <AlertTriangle className="h-3 w-3 inline mr-1" aria-hidden="true" />
            Esta respuesta tiene baja confianza. Para información más precisa,
            contacta directamente con la dependencia correspondiente al (601) 123-4567.
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
