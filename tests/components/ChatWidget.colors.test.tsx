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

describe('ChatWidget color tokens', () => {
  test('uses design tokens for gradients and borders', async () => {
    render(<ChatWidget defaultOpen />)

    const dialog = screen.getByRole('dialog')
    // Border color should be token-based via arbitrary value
    expect(dialog.className).toContain('border-[color:var(--color-primary-green)]/')

    const header = dialog.querySelector('div.bg-gradient-to-r') as HTMLElement
    expect(header?.className).toContain('from-[color:var(--color-primary-green)]')
    expect(header?.className).toContain('to-[color:var(--color-primary-green-dark)]')

    // FAB is not rendered when widget is defaultOpen, test when closed
    const { rerender } = render(<ChatWidget />)
    const fab = screen.getByTestId('chat-fab')
    expect(fab.className).toContain('from-[color:var(--color-primary-green)]')
    expect(fab.className).toContain('to-[color:var(--color-primary-green-dark)]')
  })
})

