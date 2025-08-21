import React from 'react'
import { render, screen } from '@testing-library/react'
import { ChatWidget } from '@/components/chat/ChatWidget'

const base = {
  messages: [], sendMessage: jest.fn(), clearMessages: jest.fn(), clearError: jest.fn(), retryLastMessage: jest.fn(), reconnect: jest.fn(), sessionToken: 't'
}

jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    ...base,
    isLoading: false,
    isTyping: true,
    error: null,
    isConnected: true,
  })
}))

jest.mock('@/lib/config', () => ({ config: { features: { ENABLE_AI_CHATBOT: true } } }))

describe('ChatWidget ARIA live regions', () => {
  test('exposes aria-describedby and live typing status', async () => {
    render(<ChatWidget defaultOpen />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-describedby')

    // Instruction text and live status nodes should exist
    expect(screen.getByText(/escribe tu mensaje/i)).toBeInTheDocument()
    expect(screen.getByTestId('chat-live-status')).toBeInTheDocument()
  })
})

