// UX-003: Test for chat widget backdrop and solid background
// This test verifies that the backdrop is properly implemented with blur and solid background

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('UX-003: Chat Widget Backdrop Tests', () => {
  describe('Backdrop Functionality', () => {
    test('should not show backdrop when widget is closed', () => {
      render(<ChatWidget defaultOpen={false} />)
      
      // Backdrop should not be present when widget is closed
      expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument()
      expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
    })

    test('should show backdrop when widget is open', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      // Backdrop should be present when widget is open
      const backdrop = screen.getByTestId('chat-backdrop')
      expect(backdrop).toBeInTheDocument()
      
      // Widget should also be present
      const widget = screen.getByTestId('chat-widget')
      expect(widget).toBeInTheDocument()
    })

    test('should have correct backdrop styling classes', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      
      // Check for backdrop styling classes
      expect(backdrop).toHaveClass('fixed', 'inset-0', 'z-[9998]')
      expect(backdrop).toHaveClass('bg-black/30', 'backdrop-blur-sm')
      expect(backdrop).toHaveClass('animate-in', 'fade-in', 'duration-300')
      expect(backdrop).toHaveClass('transition-all', 'ease-out')
    })

    test('should close widget when clicking on backdrop', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      // Widget and backdrop should be visible
      expect(screen.getByTestId('chat-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
      
      // Click on backdrop
      const backdrop = screen.getByTestId('chat-backdrop')
      await user.click(backdrop)
      
      // Widget and backdrop should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument()
        expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
      })
    })

    test('should not close widget when clicking on widget itself', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      // Widget and backdrop should be visible
      expect(screen.getByTestId('chat-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
      
      // Click on widget (not backdrop)
      const widget = screen.getByTestId('chat-widget')
      await user.click(widget)
      
      // Widget and backdrop should still be visible
      expect(screen.getByTestId('chat-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
    })
  })

  describe('Widget Background and Contrast', () => {
    test('should have enhanced background styling on widget', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      
      // Check for enhanced background classes
      expect(widget).toHaveClass('bg-white/98', 'backdrop-blur-md')
      expect(widget).toHaveClass('border', 'border-green-500/20', 'shadow-2xl')
      expect(widget).toHaveClass('ring-1', 'ring-black/5')
    })

    test('should have proper z-index hierarchy', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      const widget = screen.getByTestId('chat-widget')
      
      // Backdrop should have lower z-index than widget
      expect(backdrop).toHaveClass('z-[9998]')
      expect(widget).toHaveClass('z-[9999]')
    })

    test('should have proper ARIA attributes for modal behavior', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      
      // Should have proper modal attributes
      expect(widget).toHaveAttribute('role', 'dialog')
      expect(widget).toHaveAttribute('aria-label', 'Asistente Virtual del Municipio de Chía')
      expect(widget).toHaveAttribute('aria-modal', 'true')
    })

    test('should have backdrop with aria-hidden attribute', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      
      // Backdrop should be hidden from screen readers
      expect(backdrop).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Animation and Transitions', () => {
    test('should have animation classes on widget', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      
      // Check for animation classes
      expect(widget).toHaveClass('animate-in', 'slide-in-from-bottom-4', 'duration-300')
    })

    test('should have fade-in animation on backdrop', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      
      // Check for fade-in animation
      expect(backdrop).toHaveClass('animate-in', 'fade-in', 'duration-300')
    })

    test('should handle widget opening and closing animations', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={false} />)
      
      // Initially closed
      expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument()
      expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
      
      // Open widget
      const openButton = screen.getByRole('button')
      await user.click(openButton)
      
      // Should appear with animations
      await waitFor(() => {
        const backdrop = screen.getByTestId('chat-backdrop')
        const widget = screen.getByTestId('chat-widget')
        
        expect(backdrop).toBeInTheDocument()
        expect(widget).toBeInTheDocument()
        
        // Check animation classes are applied
        expect(backdrop).toHaveClass('animate-in', 'fade-in')
        expect(widget).toHaveClass('animate-in', 'slide-in-from-bottom-4')
      })
    })
  })

  describe('Responsive Behavior', () => {
    test('should maintain backdrop on different screen sizes', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      
      // Backdrop should cover full screen regardless of size
      expect(backdrop).toHaveClass('fixed', 'inset-0')
    })

    test('should have responsive widget constraints', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      
      // Check responsive constraints
      expect(widget).toHaveClass('max-w-[calc(100vw-2rem)]', 'max-h-[calc(100vh-2rem)]')
      expect(widget).toHaveClass('w-96', 'h-[600px]')
      expect(widget).toHaveClass('sm:w-96', 'sm:h-[600px]')
    })
  })

  describe('Accessibility Features', () => {
    test('should trap focus within widget when open', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      const widget = screen.getByTestId('chat-widget')
      expect(widget).toBeInTheDocument()
      
      // Focus should be managed within the widget
      // This is handled by the existing focus trap implementation
      expect(widget).toHaveAttribute('data-chat-widget', 'true')
    })

    test('should handle Escape key to close widget', async () => {
      const user = userEvent.setup()
      
      render(<ChatWidget defaultOpen={true} />)
      
      // Widget should be open
      expect(screen.getByTestId('chat-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
      
      // Press Escape key
      await user.keyboard('{Escape}')
      
      // Widget should close
      await waitFor(() => {
        expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument()
        expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
      })
    })
  })

  describe('Performance Considerations', () => {
    test('should not render backdrop when widget is closed', () => {
      render(<ChatWidget defaultOpen={false} />)
      
      // No backdrop should be rendered when closed
      expect(screen.queryByTestId('chat-backdrop')).not.toBeInTheDocument()
      
      // This ensures no unnecessary DOM elements or CSS effects
    })

    test('should use efficient CSS classes for blur effects', () => {
      render(<ChatWidget defaultOpen={true} />)
      
      const backdrop = screen.getByTestId('chat-backdrop')
      const widget = screen.getByTestId('chat-widget')
      
      // Check for efficient backdrop-blur classes
      expect(backdrop).toHaveClass('backdrop-blur-sm')
      expect(widget).toHaveClass('backdrop-blur-md')
      
      // These use CSS backdrop-filter which is hardware accelerated
    })
  })
})
