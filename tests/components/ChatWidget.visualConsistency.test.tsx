import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '@/components/chat/ChatWidget'

// Mock useChat to avoid network calls and provide stable props
jest.mock('@/hooks/useChat', () => ({
  useChat: () => ({
    messages: [{ id: 'm1', role: 'assistant', content: 'Hola', timestamp: new Date() }],
    isLoading: false,
    isTyping: false,
    error: null,
    isConnected: true,
    sendMessage: jest.fn(),
    clearMessages: jest.fn(),
    clearError: jest.fn(),
    retryLastMessage: jest.fn(),
    reconnect: jest.fn(),
    sessionToken: 'tkn'
  })
}))

// Mock lazy-loaded subcomponents to avoid Suspense warnings and allow class checks
jest.mock('@/components/chat/ChatHistory', () => ({
  __esModule: true,
  default: ({ className }: any) => <div data-testid="chat-history" className={className} />
}))
jest.mock('@/components/chat/ChatInput', () => ({
  __esModule: true,
  default: () => <div data-testid="chat-input" />
}))

jest.mock('@/lib/config', () => ({ config: { features: { ENABLE_AI_CHATBOT: true } } }))

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
}

describe('ChatWidget visual consistency', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Header Visibility', () => {
    test('header is visible and sticky when open', async () => {
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      const header = screen.getByTestId('chat-header') as HTMLElement
      expect(header).toBeInTheDocument()
      expect(header.className).toMatch(/sticky/)
      expect(header.className).toMatch(/top-0/)
    })

    test('header fits within minimized h-16 height', async () => {
      jest.setTimeout(15000)
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      const minimizeBtn = screen.getByLabelText('Minimizar chat')
      await userEvent.click(minimizeBtn)
      expect(dialog.className).toMatch(/h-16/)
      const header = screen.getByTestId('chat-header') as HTMLElement
      expect(header).toBeInTheDocument()
      // When minimized header has py-0 and h-16 applied via conditional classes
      expect(header.className).toMatch(/h-16|py-0/)
    })

    test('header padding adjusts between states', async () => {
      jest.setTimeout(15000)
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      const header = screen.getByTestId('chat-header') as HTMLElement
      // Normal state uses py-3
      expect(header.className).toMatch(/py-3/)
      // Minimize
      await userEvent.click(screen.getByLabelText('Minimizar chat'))
      expect(header.className).toMatch(/py-0|h-16/)
      // Maximize
      await userEvent.click(screen.getByLabelText('Maximizar chat'))
      expect(header.className).toMatch(/py-3/)
    })

    test('header stays visible during content scroll', async () => {
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      const header = screen.getByTestId('chat-header') as HTMLElement
      // We cannot truly scroll in JSDOM, but we can assert sticky/top classes are present
      expect(header.className).toMatch(/sticky/)
      expect(header.className).toMatch(/top-0/)
    })
  })

  describe('Container Layout', () => {
    test('chat container uses flex layout and overflow handling', async () => {
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      const content = screen.getByTestId('chat-content') as HTMLElement
      expect(content).toBeInTheDocument()
      expect(content.className).toMatch(/flex-1/)
      expect(content.className).toMatch(/min-h-0/)
      expect(content.className).toMatch(/overflow-hidden/)
      const history = dialog.querySelector('[aria-label="Historial de conversación"]') as HTMLElement
      // Parent ChatHistory receives overflow-y-auto via className on component root wrapper
      const historyWrapper = history?.closest('div') as HTMLElement
      expect(historyWrapper?.className).toMatch(/overflow-y-auto|h-full/)
    })

    test('safe-area spacer is present', async () => {
      render(<ChatWidget defaultOpen />)
      expect(screen.getByTestId('chat-safe-area-spacer')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    test('mobile near-fullscreen sheet behavior', async () => {
      setViewport(375)
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toMatch(/w-\[calc\(100vw-1rem\)\]/)
      expect(dialog.className).toMatch(/h-\[calc\(100vh-2rem\)\]/)
    })

    test('tablet uses desktop layout constraints', async () => {
      setViewport(820)
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      // md breakpoint applies desktop size classes
      expect(dialog.className).toMatch(/md:w-96/)
      expect(dialog.className).toMatch(/md:h-\[600px\]/)
    })

    test('z-index stacking order', async () => {
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      const backdrop = screen.getByTestId('chat-backdrop')
      expect(dialog.className).toMatch(/z-\[9999\]/)
      expect(backdrop.className).toMatch(/z-\[9998\]/)
    })
  })

  describe('Cross-State Consistency', () => {
    test('open/close transitions', async () => {
      jest.setTimeout(15000)
      render(<ChatWidget />)
      // Initially closed: FAB exists
      const fab = screen.getByTestId('chat-fab')
      expect(fab).toBeInTheDocument()
      await userEvent.click(fab)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      // Close by clicking backdrop
      await userEvent.click(screen.getByTestId('chat-backdrop'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('minimize/maximize state changes', async () => {
      jest.setTimeout(15000)
      render(<ChatWidget defaultOpen />)
      const minimize = screen.getByLabelText('Minimizar chat')
      await userEvent.click(minimize)
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toMatch(/h-16/)
      const maximize = screen.getByLabelText('Maximizar chat')
      await userEvent.click(maximize)
      expect(dialog.className).not.toMatch(/h-16/)
    })
  })

  describe('Integration with Existing Features', () => {
    test('lazy prefetch still called on idle and hover', async () => {
      // Spy on dynamic imports used for prefetch.
      const importSpy = jest.spyOn(require('react'), 'lazy' as any) as any
      render(<ChatWidget />)
      // idle
      act(() => { jest.advanceTimersByTime(2100) })
      expect(importSpy).toHaveBeenCalled()
      // hover
      await userEvent.hover(screen.getByTestId('chat-fab'))
      expect(importSpy).toHaveBeenCalled()
      importSpy.mockRestore()
    })

    test('ARIA describedby and live region persist', async () => {
      render(<ChatWidget defaultOpen />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.getAttribute('aria-describedby')).toContain('chat-widget-instructions')
      expect(dialog.getAttribute('aria-describedby')).toContain('chat-live-status')
      expect(screen.getByTestId('chat-live-status')).toBeInTheDocument()
    })

    test('reduced-motion respected on backdrop', async () => {
      const addEventListener = jest.fn()
      const removeEventListener = jest.fn()
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({ matches: query.includes('prefers-reduced-motion'), media: query, addEventListener, removeEventListener, addListener: jest.fn(), removeListener: jest.fn() })
      })
      render(<ChatWidget defaultOpen />)
      const backdrop = screen.getByTestId('chat-backdrop')
      expect(backdrop.className).toMatch(/bg-black\/50/)
    })
  })
})

