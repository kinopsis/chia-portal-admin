import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '@/components/chat/ChatWidget'

jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [], isLoading: false, isTyping: false, error: null, isConnected: true,
    sendMessage: jest.fn(), clearMessages: jest.fn(), clearError: jest.fn(), retryLastMessage: jest.fn(), reconnect: jest.fn(), sessionToken: 't'
  })
}))

jest.mock('@/lib/config', () => ({ config: { features: { ENABLE_AI_CHATBOT: true } } }))

describe('ChatWidget header and container visibility', () => {
  test('header is always visible when open', async () => {
    render(<ChatWidget defaultOpen />)

    const dialog = screen.getByRole('dialog')
    const header = dialog.querySelector('div.bg-gradient-to-r') as HTMLElement
    expect(header).toBeInTheDocument()
    expect(header.className).toMatch(/sticky/) // sticky header
  })

  test('minimized state shows header and hides content', async () => {
    render(<ChatWidget defaultOpen />)
    const dialog = screen.getByRole('dialog')

    // minimize
    const minimize = screen.getByLabelText('Minimizar chat')
    await userEvent.click(minimize)

    // header exists
    const header = dialog.querySelector('div.bg-gradient-to-r') as HTMLElement
    expect(header).toBeInTheDocument()
    expect(dialog.className).toMatch(/h-16/)

    // content should be absent when minimized
    expect(screen.queryByTestId('chat-safe-area-spacer')).not.toBeInTheDocument()
  })
})

