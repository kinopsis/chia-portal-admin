import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { HeroSection } from '@/components/organisms/HeroSection'
import type { HeroSectionProps } from '@/components/organisms/HeroSection'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))


describe('HeroSection Component', () => {
  const defaultProps: HeroSectionProps = {
    title: 'Test Hero Title',
    subtitle: 'Test hero subtitle description',
    searchPlaceholder: 'Search for services...',
    backgroundVariant: 'gradient',
    enableSearch: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with all required props', () => {
      render(<HeroSection {...defaultProps} />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Hero Title')
      expect(screen.getByText('Test hero subtitle description')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search for services...')).toBeInTheDocument()
    })

    it('renders with default props', () => {
      render(<HeroSection />)
      
      expect(screen.getByText('Servicios municipales al alcance de todos')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Buscar trámite, servicio, información...')).toBeInTheDocument()
    })

    it('renders without search when disabled', () => {
      render(<HeroSection {...defaultProps} enableSearch={false} />)
      
      expect(screen.getByText('Test Hero Title')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Search for services...')).not.toBeInTheDocument()
    })

    it('applies correct background variant classes', () => {
      const { rerender } = render(<HeroSection {...defaultProps} backgroundVariant="gradient" />)
      let section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-gradient-to-br')

      rerender(<HeroSection {...defaultProps} backgroundVariant="solid" />)
      section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-gray-50')

      rerender(<HeroSection {...defaultProps} backgroundVariant="image" backgroundImage="/test-bg.jpg" />)
      section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-cover')
    })
  })

  describe('Search Functionality', () => {
    it('handles search input changes', async () => {
      const user = userEvent.setup()
      render(<HeroSection {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.type(searchInput, 'test query')
      
      expect(searchInput).toHaveValue('test query')
    })

    it('handles search form submission', async () => {
      const mockOnSearch = jest.fn()
      const user = userEvent.setup()
      
      render(<HeroSection {...defaultProps} onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      const searchButton = screen.getByRole('button', { name: /realizar búsqueda/i })
      
      await user.type(searchInput, 'test search')
      await user.click(searchButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })

    it('handles search with Enter key', async () => {
      const mockOnSearch = jest.fn()
      const user = userEvent.setup()
      
      render(<HeroSection {...defaultProps} onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.type(searchInput, 'test search{enter}')
      
      expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })

    it('trims whitespace from search query', async () => {
      const mockOnSearch = jest.fn()
      const user = userEvent.setup()
      
      render(<HeroSection {...defaultProps} onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.type(searchInput, '  test search  {enter}')
      
      expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })

    it('does not submit empty search', async () => {
      const mockOnSearch = jest.fn()
      const user = userEvent.setup()
      
      render(<HeroSection {...defaultProps} onSearch={mockOnSearch} />)
      
      const searchButton = screen.getByRole('button', { name: /realizar búsqueda/i })
      await user.click(searchButton)
      
      expect(mockOnSearch).not.toHaveBeenCalled()
    })

    it('navigates to search page when no onSearch handler provided', async () => {
      const user = userEvent.setup()
      
      render(<HeroSection {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.type(searchInput, 'test query{enter}')
      
      expect(mockPush).toHaveBeenCalledWith('/buscar?q=test%20query')
    })

    it('shows search suggestions', () => {
      render(<HeroSection {...defaultProps} />)
      
      expect(screen.getByText('Prueba buscar: "certificado de residencia", "pagos", "citas" o "formularios"')).toBeInTheDocument()
    })
  })

  describe('Focus Management', () => {
    it('manages search input focus correctly', async () => {
      const user = userEvent.setup()
      render(<HeroSection {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.click(searchInput)
      
      expect(searchInput).toHaveFocus()
      
      // Check focus styling is applied
      const searchContainer = searchInput.closest('.relative')
      expect(searchContainer).toHaveClass('border-primary-green')
    })

    it('removes focus styling on blur', async () => {
      const user = userEvent.setup()
      render(<HeroSection {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.click(searchInput)
      await user.tab() // Move focus away
      
      const searchContainer = searchInput.closest('.relative')
      expect(searchContainer).not.toHaveClass('border-primary-green')
    })
  })

  describe('CTA Buttons', () => {
    it('renders CTA buttons', () => {
      render(<HeroSection {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /ver todos los trámites/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /contactar soporte/i })).toBeInTheDocument()
    })

    it('handles CTA button clicks', async () => {
      const user = userEvent.setup()
      render(<HeroSection {...defaultProps} />)
      
      const tramitesButton = screen.getByRole('button', { name: /ver todos los trámites/i })
      await user.click(tramitesButton)
      
      expect(mockPush).toHaveBeenCalledWith('/tramites')
      
      const supportButton = screen.getByRole('button', { name: /contactar soporte/i })
      await user.click(supportButton)
      
      expect(mockPush).toHaveBeenCalledWith('/atencion-ciudadano')
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive typography classes', () => {
      render(<HeroSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toHaveClass('text-3xl', 'sm:text-4xl', 'lg:text-5xl', 'xl:text-6xl')
      
      const subtitle = screen.getByText('Test hero subtitle description')
      expect(subtitle).toHaveClass('text-lg', 'sm:text-xl', 'lg:text-2xl')
    })

    it('handles mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<HeroSection {...defaultProps} />)
      
      const section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('py-12')
    })

    it('shows mobile search button text', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<HeroSection {...defaultProps} />)
      
      // On mobile, button should show icon instead of text
      const searchButton = screen.getByRole('button', { name: /realizar búsqueda/i })
      expect(searchButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<HeroSection {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveAttribute('id', 'hero-title')
      
      const section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveAttribute('aria-labelledby', 'hero-title')
    })

    it('has proper form labels', () => {
      render(<HeroSection {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      expect(searchInput).toHaveAttribute('aria-label', 'Buscar servicios municipales')
      
      const searchButton = screen.getByRole('button', { name: /realizar búsqueda/i })
      expect(searchButton).toHaveAttribute('aria-label', 'Realizar búsqueda')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<HeroSection {...defaultProps} />)
      
      // Tab through interactive elements
      await user.tab()
      const searchInput = screen.getByPlaceholderText('Search for services...')
      expect(searchInput).toHaveFocus()
      
      await user.tab()
      const searchButton = screen.getByRole('button', { name: /realizar búsqueda/i })
      expect(searchButton).toHaveFocus()
      
      await user.tab()
      const tramitesButton = screen.getByRole('button', { name: /ver todos los trámites/i })
      expect(tramitesButton).toHaveFocus()
    })

    it('has proper ARIA attributes for search', () => {
      render(<HeroSection {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      expect(searchInput).toHaveAttribute('autoComplete', 'off')
      expect(searchInput).toHaveAttribute('type', 'text')
    })
  })

  describe('Background Variants', () => {
    it('renders gradient background correctly', () => {
      render(<HeroSection {...defaultProps} backgroundVariant="gradient" />)
      
      const section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-gradient-to-br')
    })

    it('renders solid background correctly', () => {
      render(<HeroSection {...defaultProps} backgroundVariant="solid" />)
      
      const section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-gray-50')
    })

    it('renders image background correctly', () => {
      render(
        <HeroSection 
          {...defaultProps} 
          backgroundVariant="image" 
          backgroundImage="/test-bg.jpg" 
        />
      )
      
      const section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-cover', 'bg-center', 'bg-no-repeat')
      expect(section).toHaveStyle('background-image: url(/test-bg.jpg)')
    })

    it('renders overlay for image background', () => {
      render(
        <HeroSection 
          {...defaultProps} 
          backgroundVariant="image" 
          backgroundImage="/test-bg.jpg" 
        />
      )
      
      const overlay = screen.getByRole('region', { name: /hero/i }).querySelector('.absolute.inset-0')
      expect(overlay).toHaveClass('bg-black/40')
    })
  })


  describe('Error Handling', () => {
    it('handles missing props gracefully', () => {
      render(<HeroSection />)
      
      // Should render with default values
      expect(screen.getByText('Servicios municipales al alcance de todos')).toBeInTheDocument()
    })

    it('handles search errors gracefully', async () => {
      const mockOnSearch = jest.fn().mockImplementation(() => {
        throw new Error('Search failed')
      })
      const user = userEvent.setup()
      
      render(<HeroSection {...defaultProps} onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText('Search for services...')
      await user.type(searchInput, 'test{enter}')
      
      // Should not crash the component
      expect(screen.getByText('Test Hero Title')).toBeInTheDocument()
    })
  })
})
