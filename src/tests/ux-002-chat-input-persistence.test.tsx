// UX-002: Test for chat input persistence and focus management
// This test verifies that the chat input remains visible and functional after responses

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '@/components/chat/ChatInput'
import ChatWidget from '@/components/chat/ChatWidget'

// Mock the useChat hook
jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [],
    isLoading: false,
    isTyping: false,
    error: null,
    isConnected: true,
    sendMessage: jest.fn(),
    clearMessages: jest.fn(),
    clearError: jest.fn(),
    retryLastMessage: jest.fn(),
    reconnect: jest.fn(),
    sessionToken: null
  })
}))

// Mock the config
jest.mock('@/lib/config', () => ({
  config: {
    features: {
      ENABLE_AI_CHATBOT: true
    }
  }
}))

describe('UX-002: Chat Input Persistence Tests', () => {
  describe('ChatInput Component', () => {
    const mockOnSendMessage = jest.fn()
    
    beforeEach(() => {
      mockOnSendMessage.mockClear()
    })

    test('should render input with correct attributes', () => {
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          autoFocus={true}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('data-chat-input', 'true')
      expect(input).toHaveAttribute('aria-label', 'Mensaje para el asistente virtual')
    })

    test('should auto-focus when autoFocus prop is true', async () => {
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          autoFocus={true}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      
      // Wait for auto-focus to take effect
      await waitFor(() => {
        expect(input).toHaveFocus()
      }, { timeout: 200 })
    })

    test('should not auto-focus when disabled', () => {
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          autoFocus={true}
          disabled={true}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      expect(input).not.toHaveFocus()
      expect(input).toBeDisabled()
    })

    test('should handle message submission and maintain focus flag', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          shouldFocusAfterResponse={true}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      const submitButton = screen.getByRole('button', { name: /enviar/i })
      
      // Type a message
      await user.type(input, 'Test message')
      expect(input).toHaveValue('Test message')
      
      // Submit the message
      await user.click(submitButton)
      
      // Verify message was sent and input cleared
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
      expect(input).toHaveValue('')
    })

    test('should handle keyboard submission (Enter)', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      
      // Type message and press Enter
      await user.type(input, 'Test message{enter}')
      
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
      expect(input).toHaveValue('')
    })

    test('should not submit empty or whitespace-only messages', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      const submitButton = screen.getByRole('button', { name: /enviar/i })
      
      // Try to submit empty message
      await user.click(submitButton)
      expect(mockOnSendMessage).not.toHaveBeenCalled()
      
      // Try to submit whitespace-only message
      await user.type(input, '   ')
      await user.click(submitButton)
      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    test('should show character count and limit', async () => {
      const user = userEvent.setup()
      const maxLength = 100
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          maxLength={maxLength}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      
      // Type a message
      await user.type(input, 'Test message')
      
      // Check character count is displayed (text is split across elements)
      const charCount = screen.getByText((content, element) => {
        return element?.textContent === '12/100'
      })
      expect(charCount).toBeInTheDocument()
    })

    test('should handle character limit exceeded', async () => {
      const user = userEvent.setup()
      const maxLength = 10
      
      render(
        <ChatInput 
          onSendMessage={mockOnSendMessage}
          maxLength={maxLength}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      const submitButton = screen.getByRole('button', { name: /enviar/i })
      
      // Type message that exceeds limit
      await user.type(input, 'This message is too long')
      
      // Submit button should be disabled
      expect(submitButton).toBeDisabled()
      
      // Character count should show over limit (text is split across elements)
      const charCount = screen.getByText((content, element) => {
        return element?.textContent === '24/10'
      })
      expect(charCount).toBeInTheDocument()
      expect(charCount).toHaveClass('text-red-600')
    })
  })

  describe('Focus Management Integration', () => {
    test('should maintain focus after simulated response', async () => {
      // This test simulates the focus behavior after an assistant response
      const TestComponent = () => {
        const [shouldFocus, setShouldFocus] = React.useState(false)
        const focusRef = React.useRef<(() => void) | null>(null)

        React.useEffect(() => {
          if (shouldFocus && focusRef.current) {
            setTimeout(() => {
              focusRef.current?.()
            }, 100)
          }
        }, [shouldFocus])

        return (
          <div>
            <button
              type="button"
              onClick={() => setShouldFocus(true)}
              data-testid="trigger-focus"
            >
              Trigger Focus
            </button>
            <ChatInput
              onSendMessage={jest.fn()}
              shouldFocusAfterResponse={true}
              autoFocus={false}
              onFocusRequest={focusRef}
            />
          </div>
        )
      }

      render(<TestComponent />)

      const input = screen.getByTestId('chat-input')
      const trigger = screen.getByTestId('trigger-focus')

      // Initially input should not be focused
      expect(input).not.toHaveFocus()

      // Trigger focus
      fireEvent.click(trigger)

      // Wait for focus to be applied
      await waitFor(() => {
        expect(input).toHaveFocus()
      }, { timeout: 400 })
    })
  })

  describe('Accessibility and Keyboard Navigation', () => {
    test('should have proper ARIA attributes', () => {
      render(
        <ChatInput 
          onSendMessage={jest.fn()}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      
      expect(input).toHaveAttribute('aria-label', 'Mensaje para el asistente virtual')
      expect(input).toHaveAttribute('aria-describedby', 'char-count message-help')
    })

    test('should handle Shift+Enter for new line', async () => {
      const user = userEvent.setup()

      render(
        <ChatInput
          onSendMessage={jest.fn()}
        />
      )

      const input = screen.getByTestId('chat-input')

      // Type first line
      await user.type(input, 'Line 1')

      // Press Shift+Enter for new line
      await user.keyboard('{Shift>}{Enter}{/Shift}')

      // Type second line
      await user.type(input, 'Line 2')

      expect(input).toHaveValue('Line 1\nLine 2')
    })

    test('should maintain focus visibility states', async () => {
      const user = userEvent.setup()
      
      render(
        <ChatInput 
          onSendMessage={jest.fn()}
        />
      )
      
      const input = screen.getByTestId('chat-input')
      
      // Focus the input
      await user.click(input)
      
      // Check focus styles are applied
      expect(input).toHaveClass('ring-2', 'ring-[#009045]', 'border-[#009045]')
      
      // Blur the input
      await user.tab()
      
      // Check focus styles are removed
      expect(input).not.toHaveClass('ring-2', 'ring-[#009045]')
    })
  })
})
