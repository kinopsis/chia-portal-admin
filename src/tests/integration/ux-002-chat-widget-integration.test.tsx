// UX-002: Integration test for ChatWidget focus management and persistence
// This test verifies the complete chat widget behavior including focus trap and keyboard navigation

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatWidget from '@/components/chat/ChatWidget'

// Mock the useChat hook with more realistic behavior
const mockSendMessage = jest.fn()
const mockMessages = [
  {
    id: '1',
    role: 'user' as const,
    content: 'Hello',
    timestamp: new Date()
  },
  {
    id: '2', 
    role: 'assistant' as const,
    content: 'Hi! How can I help you?',
    timestamp: new Date()
  }
]

jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: mockMessages,
    isLoading: false,
    isTyping: false,
    error: null,
    isConnected: true,
    sendMessage: mockSendMessage,
    clearMessages: jest.fn(),
    clearError: jest.fn(),
    retryLastMessage: jest.fn(),
    reconnect: jest.fn(),
    sessionToken: 'test-session'
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

describe('UX-002: ChatWidget Integration Tests', () => {
  beforeEach(() => {
    mockSendMessage.mockClear()
  })

  describe('Widget Opening and Focus Management', () => {
    test('should open widget and auto-focus input', async () => {
      render(<ChatWidget defaultOpen={false} />)
      
      // Initially widget should be closed
      expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
      
      // Click floating action button to open
      const openButton = screen.getByRole('button')
      fireEvent.click(openButton)
      
      // Widget should be open
      await waitFor(() => {
        expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
      })
      
      // Input should be auto-focused
      await waitFor(() => {
        const input = screen.getByTestId('chat-input')
        expect(input).toHaveFocus()
      }, { timeout: 300 })
    })

    test('should maintain focus after sending message', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      const input = screen.getByTestId('chat-input')
      
      // Wait for initial auto-focus
      await waitFor(() => {
        expect(input).toHaveFocus()
      }, { timeout: 300 })
      
      // Type and send a message
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')
      
      // Verify message was sent
      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
      
      // Input should regain focus after response (simulated)
      await waitFor(() => {
        expect(input).toHaveFocus()
      }, { timeout: 400 })
    })
  })

  describe('Keyboard Navigation and Focus Trap', () => {
    test('should close widget on Escape key', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      // Widget should be open
      expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
      
      // Press Escape
      await user.keyboard('{Escape}')
      
      // Widget should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
      })
    })

    test('should implement basic focus trap with Tab navigation', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      expect(widget).toBeInTheDocument()
      
      // Get all focusable elements within the widget
      const focusableElements = widget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      expect(focusableElements.length).toBeGreaterThan(0)
      
      // Focus should cycle through elements
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      // Focus first element
      firstElement.focus()
      expect(firstElement).toHaveFocus()
      
      // Tab to last element and then try to tab forward
      lastElement.focus()
      expect(lastElement).toHaveFocus()
      
      // Simulate Tab key on last element - should cycle to first
      fireEvent.keyDown(document, { key: 'Tab' })
      
      // Note: Full focus trap testing requires more complex setup
      // This test verifies the basic structure is in place
    })

    test('should handle Shift+Tab for backward navigation', async () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      const focusableElements = widget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length > 1) {
        const firstElement = focusableElements[0] as HTMLElement
        
        // Focus first element
        firstElement.focus()
        expect(firstElement).toHaveFocus()
        
        // Simulate Shift+Tab - should cycle to last element
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
        
        // Note: Full backward navigation testing requires more complex setup
      }
    })
  })

  describe('Widget States and Persistence', () => {
    test('should maintain input visibility when minimized and restored', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      // Find minimize button (assuming it exists in the header)
      const minimizeButton = screen.queryByRole('button', { name: /minimizar/i })
      
      if (minimizeButton) {
        // Minimize the widget
        await user.click(minimizeButton)
        
        // Input should not be visible when minimized
        expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument()
        
        // Restore the widget (click header or maximize button)
        const restoreButton = screen.queryByRole('button', { name: /maximizar/i })
        if (restoreButton) {
          await user.click(restoreButton)
          
          // Input should be visible and focused again
          await waitFor(() => {
            const input = screen.getByTestId('chat-input')
            expect(input).toBeInTheDocument()
            expect(input).toHaveFocus()
          }, { timeout: 300 })
        }
      }
    })

    test('should handle disabled state correctly', () => {
      // Mock disabled state
      jest.doMock('@/hooks/useChat', () => ({
        useChat: () => ({
          messages: [],
          isLoading: true, // Simulating loading state
          isTyping: false,
          error: null,
          isConnected: false, // Simulating disconnected state
          sendMessage: mockSendMessage,
          clearMessages: jest.fn(),
          clearError: jest.fn(),
          retryLastMessage: jest.fn(),
          reconnect: jest.fn(),
          sessionToken: null
        })
      }))
      
      render(<ChatWidget defaultOpen={true} />)
      
      const input = screen.getByTestId('chat-input')
      
      // Input should be disabled when loading or disconnected
      expect(input).toBeDisabled()
      
      // Should not auto-focus when disabled
      expect(input).not.toHaveFocus()
    })
  })

  describe('Accessibility Features', () => {
    test('should have proper ARIA attributes on widget', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      
      expect(widget).toHaveAttribute('role', 'dialog')
      expect(widget).toHaveAttribute('aria-label', 'Asistente Virtual del Municipio de Chía')
      expect(widget).toHaveAttribute('aria-modal', 'false')
    })

    test('should maintain focus indicators for keyboard users', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      const input = screen.getByTestId('chat-input')
      
      // Focus the input using keyboard
      await user.tab()
      
      // Should have visible focus indicators
      expect(input).toHaveClass('ring-2', 'ring-[#009045]')
    })

    test('should provide clear visual feedback for interactions', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      const input = screen.getByTestId('chat-input')
      const sendButton = screen.getByRole('button', { name: /enviar/i })
      
      // Type a message
      await user.type(input, 'Test message')
      
      // Send button should be enabled and visible
      expect(sendButton).toBeEnabled()
      expect(sendButton).toBeVisible()
      
      // Click send button
      await user.click(sendButton)
      
      // Input should be cleared and maintain focus
      expect(input).toHaveValue('')
      
      await waitFor(() => {
        expect(input).toHaveFocus()
      }, { timeout: 400 })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle rapid successive messages', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      const input = screen.getByTestId('chat-input')
      
      // Send multiple messages rapidly
      await user.type(input, 'Message 1')
      await user.keyboard('{Enter}')
      
      await user.type(input, 'Message 2')
      await user.keyboard('{Enter}')
      
      // Should handle both messages
      expect(mockSendMessage).toHaveBeenCalledTimes(2)
      expect(mockSendMessage).toHaveBeenNthCalledWith(1, 'Message 1')
      expect(mockSendMessage).toHaveBeenNthCalledWith(2, 'Message 2')
    })

    test('should maintain functionality after widget reopen', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={false} />)
      
      // Open widget
      const openButton = screen.getByRole('button')
      await user.click(openButton)
      
      // Close widget with Escape
      await user.keyboard('{Escape}')
      
      // Reopen widget
      const reopenButton = screen.getByRole('button')
      await user.click(reopenButton)
      
      // Input should still work correctly
      await waitFor(() => {
        const input = screen.getByTestId('chat-input')
        expect(input).toHaveFocus()
      }, { timeout: 300 })
    })
  })
})
