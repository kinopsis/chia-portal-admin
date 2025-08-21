import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChatWidget } from '@/components/chat/ChatWidget'

jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [], isLoading: false, isTyping: false, error: null, isConnected: true,
    sendMessage: jest.fn(), clearMessages: jest.fn(), clearError: jest.fn(), retryLastMessage: jest.fn(), reconnect: jest.fn(), sessionToken: 't'
  })
}))

jest.mock('@/lib/config', () => ({ config: { features: { ENABLE_AI_CHATBOT: true } } }))

describe('ChatWidget reduced motion', () => {
  test('backdrop uses solid overlay when prefers-reduced-motion is enabled', async () => {
    const addEventListener = jest.fn()
    const removeEventListener = jest.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({ matches: query.includes('prefers-reduced-motion'), media: query, addEventListener, removeEventListener, addListener: jest.fn(), removeListener: jest.fn() })
    })

    render(<ChatWidget defaultOpen />)

    // The backdrop div should use solid overlay when reduced motion is enabled
    const backdrop = screen.getByTestId('chat-backdrop')
    expect(backdrop.className).toMatch(/bg-black\/50/)
  })
})

