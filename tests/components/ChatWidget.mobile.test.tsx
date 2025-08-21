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

describe('ChatWidget mobile layout', () => {
  beforeAll(() => {
    // Simulate mobile viewport via jsdom doesn't change CSS, but we can validate classNames
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({ matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(), addListener: jest.fn(), removeListener: jest.fn() })
    })
  })

  test('uses near-fullscreen dimensions on mobile', async () => {
    render(<ChatWidget defaultOpen />)
    const dialog = screen.getByRole('dialog')
    const cls = dialog.className
    expect(cls).toMatch(/w-\[calc\(100vw-1rem\)\]/)
    expect(cls).toMatch(/h-\[calc\(100vh-2rem\)\]/)
    expect(screen.getByTestId('chat-safe-area-spacer')).toBeInTheDocument()
  })
})

