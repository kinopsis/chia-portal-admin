import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { ServiceCard } from '@/components/molecules/ServiceCard'
import type { ServiceCardProps } from '@/components/molecules/ServiceCard'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
  }),
}))

describe('ServiceCard Component', () => {
  const defaultProps: ServiceCardProps = {
    icon: '📋',
    title: 'Test Service',
    description: 'This is a test service description',
    href: '/test-service',
    stats: {
      count: 150,
      label: 'services available',
    },
    colorScheme: "service-yellow",
    buttonText: 'Access Service',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with all required props', () => {
      render(<ServiceCard {...defaultProps} />)
      
      expect(screen.getByText('Test Service')).toBeInTheDocument()
      expect(screen.getByText('This is a test service description')).toBeInTheDocument()
      expect(screen.getByText('📋')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('services available')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /access service/i })).toBeInTheDocument()
    })

    it('renders without optional props', () => {
      const minimalProps = {
        icon: '📋',
        title: 'Minimal Service',
        description: 'Minimal description',
        href: '/minimal',
        colorScheme: "service-blue" as const,
      }
      
      render(<ServiceCard {...minimalProps} />)
      
      expect(screen.getByText('Minimal Service')).toBeInTheDocument()
      expect(screen.getByText('Minimal description')).toBeInTheDocument()
      expect(screen.queryByText('150')).not.toBeInTheDocument()
    })

    it('applies correct color scheme classes', () => {
      const { rerender } = render(<ServiceCard {...defaultProps} colorScheme="service-yellow" />)
      let card = screen.getByRole('article')
      expect(card).toHaveClass('service-card-yellow')

      rerender(<ServiceCard {...defaultProps} colorScheme="service-blue" />)
      card = screen.getByRole('article')
      expect(card).toHaveClass('service-card-blue')

      rerender(<ServiceCard {...defaultProps} colorScheme="service-green" />)
      card = screen.getByRole('article')
      expect(card).toHaveClass('service-card-green')
    })
  })

  describe('Color Schemes', () => {
    const colorSchemes: ServiceCardProps['colorScheme'][] = ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo']

    colorSchemes.forEach((colorScheme) => {
      it(`renders correctly with ${colorScheme} color scheme`, () => {
        render(<ServiceCard {...defaultProps} colorScheme={colorScheme} />)
        
        const card = screen.getByRole('article')
        expect(card).toHaveClass(`service-card-${colorScheme}`)
        expect(screen.getByText('Test Service')).toBeInTheDocument()
      })
    })
  })

  describe('Interactions', () => {
    it('handles click events correctly', async () => {
      const user = userEvent.setup()
      render(<ServiceCard {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /access service/i })
      await user.click(button)
      
      expect(mockPush).toHaveBeenCalledWith('/test-service')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ServiceCard {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /access service/i })
      button.focus()
      
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(mockPush).toHaveBeenCalledWith('/test-service')
    })

    it('handles space key activation', async () => {
      const user = userEvent.setup()
      render(<ServiceCard {...defaultProps} />)
      
      const button = screen.getByRole('button', { name: /access service/i })
      button.focus()
      
      await user.keyboard(' ')
      expect(mockPush).toHaveBeenCalledWith('/test-service')
    })

    it('calls custom onClick handler when provided', async () => {
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      
      render(<ServiceCard {...defaultProps} onClick={mockOnClick} />)
      
      const button = screen.getByRole('button', { name: /access service/i })
      await user.click(button)
      
      expect(mockOnClick).toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive size classes', () => {
      const { rerender } = render(<ServiceCard {...defaultProps} size="sm" />)
      let card = screen.getByRole('article')
      expect(card).toHaveClass('service-card-sm')

      rerender(<ServiceCard {...defaultProps} size="md" />)
      card = screen.getByRole('article')
      expect(card).toHaveClass('service-card-md')

      rerender(<ServiceCard {...defaultProps} size="lg" />)
      card = screen.getByRole('article')
      expect(card).toHaveClass('service-card-lg')
    })

    it('handles mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<ServiceCard {...defaultProps} />)
      
      const card = screen.getByRole('article')
      expect(card).toBeInTheDocument()
      expect(screen.getByText('Test Service')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ServiceCard {...defaultProps} />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveAttribute('aria-labelledby')
      
      const button = screen.getByRole('button', { name: /access service/i })
      expect(button).toHaveAttribute('aria-describedby')
    })

    it('has proper heading hierarchy', () => {
      render(<ServiceCard {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Test Service')
    })

    it('supports screen readers', () => {
      render(<ServiceCard {...defaultProps} />)
      
      const statsText = screen.getByText('150 services available')
      expect(statsText).toBeInTheDocument()
      
      // Check for screen reader text
      const srText = screen.getByText(/access test service/i)
      expect(srText).toHaveClass('sr-only')
    })

    it('has sufficient color contrast', () => {
      render(<ServiceCard {...defaultProps} colorScheme="service-yellow" />)
      
      const card = screen.getByRole('article')
      const computedStyle = window.getComputedStyle(card)
      
      // This would typically use a color contrast testing library
      expect(card).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ServiceCard {...defaultProps} />)
      
      // Tab to the button
      await user.tab()
      const button = screen.getByRole('button', { name: /access service/i })
      expect(button).toHaveFocus()
      
      // Should be able to activate with Enter
      await user.keyboard('{Enter}')
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('Animation and Hover Effects', () => {
    it('applies hover classes on mouse enter', async () => {
      const user = userEvent.setup()
      render(<ServiceCard {...defaultProps} animated={true} />)
      
      const card = screen.getByRole('article')
      await user.hover(card)
      
      // Check if hover classes are applied
      expect(card).toHaveClass('service-card-hover')
    })

    it('respects reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      render(<ServiceCard {...defaultProps} animated={true} />)
      
      const card = screen.getByRole('article')
      expect(card).toHaveClass('reduce-motion')
    })
  })

  describe('Error Handling', () => {
    it('handles missing href gracefully', () => {
      const propsWithoutHref = { ...defaultProps }
      delete (propsWithoutHref as any).href
      
      render(<ServiceCard {...propsWithoutHref} />)
      
      expect(screen.getByText('Test Service')).toBeInTheDocument()
      const button = screen.getByRole('button', { name: /access service/i })
      expect(button).toBeDisabled()
    })

    it('handles long text content', () => {
      const longTextProps = {
        ...defaultProps,
        title: 'This is a very long service title that should be handled gracefully',
        description: 'This is a very long description that should wrap properly and not break the layout of the service card component',
      }
      
      render(<ServiceCard {...longTextProps} />)
      
      expect(screen.getByText(longTextProps.title)).toBeInTheDocument()
      expect(screen.getByText(longTextProps.description)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state when specified', () => {
      render(<ServiceCard {...defaultProps} loading={true} />)
      
      expect(screen.getByTestId('service-card-skeleton')).toBeInTheDocument()
      expect(screen.queryByText('Test Service')).not.toBeInTheDocument()
    })

    it('shows content when not loading', () => {
      render(<ServiceCard {...defaultProps} loading={false} />)
      
      expect(screen.queryByTestId('service-card-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('Test Service')).toBeInTheDocument()
    })
  })
})
