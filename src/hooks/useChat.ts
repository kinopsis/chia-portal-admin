// Custom hook for AI Chat functionality
// Epic 4 - US-011: Configuración Base del Chatbot IA Multi-Canal

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from './useAuth'

export interface ChatMessage {
  id: string
  dbId?: string // Database ID for feedback purposes
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  confidence?: number
  sources?: string[]
  escalatedToHuman?: boolean
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  sessionToken: string | null
  isConnected: boolean
}

export interface UseChatOptions {
  channel?: 'web' | 'whatsapp'
  phoneNumber?: string
  maxMessages?: number
  autoScroll?: boolean
}

export interface UseChatReturn {
  // State
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
  error: string | null
  isConnected: boolean
  
  // Actions
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
  clearError: () => void
  retryLastMessage: () => Promise<void>
  
  // Session management
  sessionToken: string | null
  reconnect: () => Promise<void>
}

const STORAGE_KEY = 'chia-chat-session'
const MAX_RETRY_ATTEMPTS = 3
const TYPING_DELAY = 1000 // Simulate typing delay

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { user } = useAuth()
  const {
    channel = 'web',
    phoneNumber,
    maxMessages = 50,
    autoScroll = true
  } = options

  // State management
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isTyping: false,
    error: null,
    sessionToken: null,
    isConnected: true
  })

  // Refs for managing state
  const retryCountRef = useRef(0)
  const lastMessageRef = useRef<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize session token from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY)
    if (savedSession) {
      try {
        const { sessionToken, timestamp } = JSON.parse(savedSession)
        // Check if session is not older than 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setState(prev => ({ ...prev, sessionToken }))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (error) {
        console.error('Error parsing saved session:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Save session token to localStorage
  const saveSession = useCallback((sessionToken: string) => {
    const sessionData = {
      sessionToken,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
  }, [])

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Add message to state
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    setState(prev => {
      const newMessage: ChatMessage = {
        ...message,
        id: generateMessageId()
      }
      
      const updatedMessages = [...prev.messages, newMessage]
      
      // Limit messages to maxMessages
      if (updatedMessages.length > maxMessages) {
        updatedMessages.splice(0, updatedMessages.length - maxMessages)
      }
      
      return {
        ...prev,
        messages: updatedMessages
      }
    })
  }, [generateMessageId, maxMessages])

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Clear all messages
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }))
  }, [])

  // Send message to API
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!message.trim()) return

    const trimmedMessage = message.trim()
    lastMessageRef.current = trimmedMessage

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    // Add user message immediately
    addMessage({
      role: 'user',
      content: trimmedMessage,
      timestamp: new Date()
    })

    // Set loading state
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      isTyping: false, 
      error: null 
    }))

    try {
      const requestBody = {
        message: trimmedMessage,
        sessionToken: state.sessionToken,
        userId: user?.id,
        channel,
        phoneNumber
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      })

      const contentType = response.headers.get('content-type') || ''

      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({} as any))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        } else {
          const text = await response.text().catch(() => '')
          throw new Error(`HTTP ${response.status}: ${text?.slice(0, 200) || 'Non-JSON error response'}`)
        }
      }

      let data: any
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(`Invalid server response format: expected JSON, got text/html: ${text.slice(0, 120)}`)
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Save session token if new
      if (data.data.sessionToken && data.data.sessionToken !== state.sessionToken) {
        setState(prev => ({ ...prev, sessionToken: data.data.sessionToken }))
        saveSession(data.data.sessionToken)
      }

      // Simulate typing delay for better UX
      setState(prev => ({ ...prev, isLoading: false, isTyping: true }))
      
      await new Promise(resolve => setTimeout(resolve, TYPING_DELAY))

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        confidence: data.data.confidence,
        sources: data.data.sources,
        escalatedToHuman: data.data.escalateToHuman,
        dbId: data.data.messageId // Store database ID for feedback
      })

      // Reset retry count on success
      retryCountRef.current = 0

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }

      console.error('Error sending message:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isConnected: !errorMessage.includes('fetch')
      }))

      // Add error message for user feedback
      addMessage({
        role: 'system',
        content: `Error: ${errorMessage}. You can try sending your message again.`,
        timestamp: new Date()
      })

    } finally {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isTyping: false 
      }))
      abortControllerRef.current = null
    }
  }, [state.sessionToken, user?.id, channel, phoneNumber, addMessage, saveSession])

  // Retry last message
  const retryLastMessage = useCallback(async (): Promise<void> => {
    if (!lastMessageRef.current || retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
      return
    }

    retryCountRef.current++
    await sendMessage(lastMessageRef.current)
  }, [sendMessage])

  // Reconnect to chat service
  const reconnect = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isConnected: true, error: null }))
    
    // Try to fetch session info if we have a session token
    if (state.sessionToken) {
      try {
        const response = await fetch(`/api/chat?sessionToken=${state.sessionToken}`)
        const contentType = response.headers.get('content-type') || ''
        if (response.ok) {
          if (contentType.includes('application/json')) {
            const data = await response.json().catch(() => null)
            if (data && data.success && data.data?.messages) {
              const serverMessages: ChatMessage[] = data.data.messages.map((msg: any) => ({
                id: generateMessageId(),
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.created_at),
                confidence: msg.confidence_score
              }))
              setState(prev => ({ ...prev, messages: serverMessages }))
            }
          } else {
            const text = await response.text().catch(() => '')
            console.warn('Unexpected non-JSON response from /api/chat reconnect:', text.slice(0, 120))
          }
        } else {
          // Not ok: try to parse json error, otherwise log text
          if (contentType.includes('application/json')) {
            const err = await response.json().catch(() => null)
            console.warn('Reconnect failed:', err?.error || `HTTP ${response.status}`)
          } else {
            const text = await response.text().catch(() => '')
            console.warn('Reconnect failed (non-JSON):', `HTTP ${response.status}: ${text.slice(0, 120)}`)
          }
        }
      } catch (error) {
        console.error('Error reconnecting:', error)
      }
    }
  }, [state.sessionToken, generateMessageId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    // State
    messages: state.messages,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    isConnected: state.isConnected,
    
    // Actions
    sendMessage,
    clearMessages,
    clearError,
    retryLastMessage,
    
    // Session management
    sessionToken: state.sessionToken,
    reconnect
  }
}
