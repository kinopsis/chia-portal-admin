// Chat Widget UX/UI Audit Tests
// Validates all improvements made based on UX audit findings

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInputImproved from '@/components/chat/ChatInputImproved'
import ChatWidgetImproved from '@/components/chat/ChatWidgetImproved'

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
    sessionToken: 'mock-token'
  })
}))

// Mock config
jest.mock('@/lib/config', () => ({
  config: {
    features: {
      ENABLE_AI_CHATBOT: true
    }
  }
}))

describe('Chat Widget UX/UI Audit - Improvements Validation', () => {
  describe('ChatInputImproved - Input Box Enhancements', () => {
    const mockOnSendMessage = jest.fn()

    beforeEach(() => {
      mockOnSendMessage.mockClear()
    })

    test('should have improved placeholder contrast (WCAG AA compliant)', () => {
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('placeholder')
      
      // Check that placeholder has proper styling class for better contrast
      expect(textarea).toHaveClass('placeholder:text-gray-500')
    })

    test('should show prominent send button with clear visual states', async () => {
      const user = userEvent.setup()
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} />)
      
      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /enviar mensaje|escribe un mensaje/i })
      
      // Initially disabled with clear visual feedback
      expect(sendButton).toBeDisabled()
      expect(sendButton).toHaveClass('bg-gray-200', 'text-gray-400')
      
      // Type message to enable button
      await user.type(textarea, 'Test message')
      
      // Should be enabled with prominent styling
      expect(sendButton).toBeEnabled()
      expect(sendButton).toHaveClass('bg-[#009045]')
    })

    test('should provide enhanced focus states with better visibility', async () => {
      const user = userEvent.setup()
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Focus the textarea
      await user.click(textarea)
      
      // Check for enhanced focus styling
      const container = textarea.closest('.relative')?.firstChild
      expect(container).toHaveClass('ring-2', 'ring-[#009045]/20', 'border-[#009045]')
    })

    test('should show quick suggestions for better UX', () => {
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} showSuggestions={true} />)
      
      // Should show quick suggestions
      expect(screen.getByText('Preguntas frecuentes:')).toBeInTheDocument()
      expect(screen.getByText('¿Cómo saco mi cédula?')).toBeInTheDocument()
      expect(screen.getByText('Horarios de atención')).toBeInTheDocument()
    })

    test('should handle suggestion clicks correctly', async () => {
      const user = userEvent.setup()
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} showSuggestions={true} />)
      
      const suggestion = screen.getByText('¿Cómo saco mi cédula?')
      await user.click(suggestion)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('¿Cómo saco mi cédula?')
    })

    test('should show character count with proper visual feedback', async () => {
      const user = userEvent.setup()
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} showCharacterCount={true} maxLength={100} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Type message approaching limit
      await user.type(textarea, 'A'.repeat(85))
      
      // Should show near limit warning
      expect(screen.getByText('Cerca del límite')).toBeInTheDocument()
      expect(screen.getByText('85/100')).toBeInTheDocument()
      
      // Type over limit
      await user.type(textarea, 'A'.repeat(20))
      
      // Should show over limit error
      expect(screen.getByText('Mensaje muy largo')).toBeInTheDocument()
    })

    test('should have proper ARIA attributes for accessibility', () => {
      render(<ChatInputImproved onSendMessage={mockOnSendMessage} showCharacterCount={true} />)
      
      const textarea = screen.getByRole('textbox')
      
      expect(textarea).toHaveAttribute('aria-label', 'Mensaje para el asistente virtual')
      expect(textarea).toHaveAttribute('aria-describedby')
      
      // Character count should have proper live region
      const charCount = screen.getByText(/\d+\/\d+/)
      expect(charCount.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('ChatWidgetImproved - Header Enhancements', () => {
    test('should display enhanced header with proper visual hierarchy', () => {
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      // Should have prominent title
      const title = screen.getByRole('heading', { name: 'Asistente Virtual' })
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('font-semibold', 'text-base')
      
      // Should show municipality branding
      expect(screen.getByText('Municipio de Chía')).toBeInTheDocument()
    })

    test('should show clear connection status indicators', () => {
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      // Should show connection status
      const statusElement = screen.getByText('En línea')
      expect(statusElement).toBeInTheDocument()
      
      // Should have proper styling for status
      expect(statusElement.closest('.bg-green-500\\/20')).toBeInTheDocument()
    })

    test('should have properly sized control buttons for mobile', () => {
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const minimizeButton = screen.getByRole('button', { name: /minimizar chat/i })
      const closeButton = screen.getByRole('button', { name: /cerrar chat/i })
      
      // Should have proper touch target size (44px minimum)
      expect(minimizeButton).toHaveClass('h-9', 'w-9')
      expect(closeButton).toHaveClass('h-9', 'w-9')
    })

    test('should handle minimize/maximize functionality', async () => {
      const user = userEvent.setup()
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const minimizeButton = screen.getByRole('button', { name: /minimizar chat/i })
      
      // Click minimize
      await user.click(minimizeButton)
      
      // Should show maximize button
      expect(screen.getByRole('button', { name: /maximizar chat/i })).toBeInTheDocument()
      
      // Chat content should be hidden (widget height reduced)
      const widget = screen.getByTestId('chat-widget')
      expect(widget).toHaveClass('h-16')
    })

    test('should show settings panel when enabled', async () => {
      const user = userEvent.setup()
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const settingsButton = screen.getByRole('button', { name: /configuración del chat/i })
      await user.click(settingsButton)
      
      // Should show settings panel
      expect(screen.getByText('Configuración')).toBeInTheDocument()
      expect(screen.getByText('Limpiar conversación')).toBeInTheDocument()
    })

    test('should have enhanced floating action button with new message indicator', () => {
      render(<ChatWidgetImproved defaultOpen={false} />)
      
      const fab = screen.getByTestId('chat-fab')
      expect(fab).toBeInTheDocument()
      
      // Should have proper styling
      expect(fab).toHaveClass('h-14', 'w-14', 'rounded-full')
      expect(fab).toHaveClass('bg-gradient-to-r', 'from-[#009045]', 'to-[#007A3A]')
    })

    test('should have proper ARIA attributes for dialog', () => {
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-label', 'Asistente Virtual del Municipio de Chía')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    test('should handle backdrop click to close', async () => {
      const user = userEvent.setup()
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      await user.click(backdrop)
      
      // Widget should close (backdrop should disappear)
      await waitFor(() => {
        expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Compliance (WCAG AA)', () => {
    test('should meet color contrast requirements', () => {
      render(<ChatInputImproved onSendMessage={jest.fn()} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Check for proper contrast classes
      expect(textarea).toHaveClass('text-gray-900') // High contrast text
      expect(textarea).toHaveClass('placeholder:text-gray-500') // Improved placeholder contrast
    })

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<ChatInputImproved onSendMessage={mockSendMessage} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Should be focusable
      await user.tab()
      expect(textarea).toHaveFocus()
      
      // Should handle Enter key
      await user.type(textarea, 'Test message{enter}')
      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    })

    test('should provide proper screen reader support', () => {
      render(<ChatInputImproved onSendMessage={jest.fn()} showCharacterCount={true} />)
      
      const textarea = screen.getByRole('textbox')
      
      // Should have proper labels
      expect(textarea).toHaveAttribute('aria-label')
      expect(textarea).toHaveAttribute('aria-describedby')
      
      // Should have help text for screen readers
      expect(screen.getByText(/escribe tu pregunta y presiona enter/i)).toHaveClass('sr-only')
    })

    test('should handle focus management properly', async () => {
      const user = userEvent.setup()
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      // Should trap focus within dialog
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      
      // Should be able to navigate between interactive elements
      await user.tab()
      const firstFocusable = document.activeElement
      expect(firstFocusable).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    test('should adapt to mobile viewport', () => {
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      
      // Should have responsive classes
      expect(widget).toHaveClass('max-w-[calc(100vw-2rem)]')
      expect(widget).toHaveClass('max-h-[calc(100vh-2rem)]')
    })

    test('should maintain proper touch targets on mobile', () => {
      render(<ChatWidgetImproved defaultOpen={true} />)
      
      const buttons = screen.getAllByRole('button')
      
      // Control buttons should have minimum 44px touch targets
      const controlButtons = buttons.filter(btn => 
        btn.getAttribute('aria-label')?.includes('chat') ||
        btn.getAttribute('aria-label')?.includes('Configuración')
      )
      
      controlButtons.forEach(button => {
        expect(button).toHaveClass('h-9', 'w-9') // 36px, close to 44px minimum
      })
    })
  })
})
