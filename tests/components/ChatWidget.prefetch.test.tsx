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

describe('ChatWidget prefetch', () => {
  test('prefetches lazy components on FAB hover and idle', async () => {
    const user = userEvent.setup()

    const importSpy = jest.spyOn(global, 'import' as any)

    render(<ChatWidget />)

    // Idle prefetch after 2s
    jest.useFakeTimers()
    jest.advanceTimersByTime(2100)
    expect(importSpy).toHaveBeenCalled()

    // Additionally on hover
    const fab = screen.getByTestId('chat-fab')
    await user.hover(fab)
    expect(importSpy).toHaveBeenCalled()

    jest.useRealTimers()
    importSpy.mockRestore()
  })
})

