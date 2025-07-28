// Chat Components Export
// Epic 4 - US-012: Interfaz de Usuario del Chatbot Web

export { default as ChatWidget } from './ChatWidget'
export { default as ChatMessage } from './ChatMessage'
export { default as ChatInput } from './ChatInput'
export { default as ChatHistory } from './ChatHistory'
export { default as ChatTypingIndicator } from './ChatTypingIndicator'
export { default as ChatFeedback } from './ChatFeedback'

// Re-export types from useChat hook
export type { ChatMessage as ChatMessageType, UseChatReturn, UseChatOptions } from '@/hooks/useChat'
