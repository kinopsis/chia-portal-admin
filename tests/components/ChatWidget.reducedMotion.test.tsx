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

    // The backdrop div is the sibling of Card with fixed inset-0 and should not include backdrop-blur when reduced motion
    const backdrop = screen.getByText((_, el) => el?.className?.includes('fixed inset-0') ?? false)
    expect(backdrop?.className).toMatch(/bg-black\/50/)
  })
})

