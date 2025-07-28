// ChatFeedback Component for AI Chatbot
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ThumbsUp, ThumbsDown, MessageSquare, X, Check } from 'lucide-react'

interface ChatFeedbackProps {
  messageId: string
  onFeedback: (messageId: string, feedback: 'helpful' | 'not_helpful', comment?: string) => void
  className?: string
}

export function ChatFeedback({ messageId, onFeedback, className }: ChatFeedbackProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'not_helpful' | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle simple feedback (thumbs up/down)
  const handleSimpleFeedback = async (feedback: 'helpful' | 'not_helpful') => {
    if (feedbackGiven) return // Prevent multiple feedback

    setIsSubmitting(true)
    try {
      await onFeedback(messageId, feedback)
      setFeedbackGiven(feedback)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle feedback with comment
  const handleCommentFeedback = async (feedback: 'helpful' | 'not_helpful') => {
    if (feedbackGiven) return

    setIsSubmitting(true)
    try {
      await onFeedback(messageId, feedback, comment.trim() || undefined)
      setFeedbackGiven(feedback)
      setShowCommentDialog(false)
      setComment('')
    } catch (error) {
      console.error('Error submitting feedback with comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If feedback already given, show confirmation
  if (feedbackGiven) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-gray-600', className)}>
        <Check className="h-3 w-3 text-green-600" aria-hidden="true" />
        <span>
          Gracias por tu retroalimentación
          {feedbackGiven === 'helpful' ? ' positiva' : '. Trabajaremos para mejorar'}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-gray-600">¿Te fue útil esta respuesta?</span>
      
      {/* Helpful button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSimpleFeedback('helpful')}
        disabled={isSubmitting}
        className="h-7 px-2 text-xs hover:bg-green-50 hover:border-green-300"
        aria-label="Marcar respuesta como útil"
      >
        <ThumbsUp className="h-3 w-3 mr-1" aria-hidden="true" />
        Útil
      </Button>

      {/* Not helpful button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleSimpleFeedback('not_helpful')}
        disabled={isSubmitting}
        className="h-7 px-2 text-xs hover:bg-red-50 hover:border-red-300"
        aria-label="Marcar respuesta como no útil"
      >
        <ThumbsDown className="h-3 w-3 mr-1" aria-hidden="true" />
        No útil
      </Button>

      {/* Comment dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
            aria-label="Agregar comentario a la retroalimentación"
          >
            <MessageSquare className="h-3 w-3 mr-1" aria-hidden="true" />
            Comentar
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Comparte tu opinión
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Tu comentario nos ayuda a mejorar el asistente virtual para todos los ciudadanos.
            </p>
            
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos qué podríamos mejorar o qué información te faltó..."
              className="min-h-[100px] resize-none"
              maxLength={500}
              aria-label="Comentario sobre la respuesta del asistente"
            />
            
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500 caracteres
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCommentFeedback('helpful')}
                disabled={isSubmitting}
                className="flex-1 hover:bg-green-50 hover:border-green-300"
              >
                <ThumbsUp className="h-3 w-3 mr-1" aria-hidden="true" />
                Útil con comentario
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCommentFeedback('not_helpful')}
                disabled={isSubmitting}
                className="flex-1 hover:bg-red-50 hover:border-red-300"
              >
                <ThumbsDown className="h-3 w-3 mr-1" aria-hidden="true" />
                No útil con comentario
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCommentDialog(false)
                setComment('')
              }}
              className="w-full"
              disabled={isSubmitting}
            >
              <X className="h-3 w-3 mr-1" aria-hidden="true" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ChatFeedback
