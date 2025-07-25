import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { WhyChooseSection } from '@/components/organisms/WhyChooseSection'
import type { WhyChooseSectionProps, BenefitItem } from '@/components/organisms/WhyChooseSection'

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
  }),
}))

describe('WhyChooseSection Component', () => {
  const mockBenefits: BenefitItem[] = [
    {
      id: 'speed',
      icon: '🚀',
      title: 'Fast Access',
      description: 'Quick and efficient service access',
      color: 'primary',
    },
    {
      id: 'security',
      icon: '🔒',
      title: 'Secure',
      description: 'Your data is protected with highest security standards',
      color: 'secondary',
    },
    {
      id: 'available',
      icon: '📱',
      title: '24/7 Available',
      description: 'Access services anytime, anywhere',
      color: 'accent',
    },
  ]

  const defaultProps: WhyChooseSectionProps = {
    title: 'Why Choose Our Platform?',
    subtitle: 'Discover the advantages of our digital services',
    benefits: mockBenefits,
    variant: 'cards',
    background: 'subtle',
  }

  describe('Rendering', () => {
    it('renders with all required props', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Why Choose Our Platform?')
      expect(screen.getByText('Discover the advantages of our digital services')).toBeInTheDocument()
      
      expect(screen.getByText('Fast Access')).toBeInTheDocument()
      expect(screen.getByText('Secure')).toBeInTheDocument()
      expect(screen.getByText('24/7 Available')).toBeInTheDocument()
      
      expect(screen.getByText('🚀')).toBeInTheDocument()
      expect(screen.getByText('🔒')).toBeInTheDocument()
      expect(screen.getByText('📱')).toBeInTheDocument()
    })

    it('renders with default props', () => {
      render(<WhyChooseSection />)
      
      expect(screen.getByText('¿Por qué elegir nuestro portal digital?')).toBeInTheDocument()
      expect(screen.getByText('Descubre las ventajas de realizar tus trámites de manera digital')).toBeInTheDocument()
      
      // Should render default benefits
      expect(screen.getByText('Acceso Rápido')).toBeInTheDocument()
      expect(screen.getByText('Seguridad')).toBeInTheDocument()
      expect(screen.getByText('Disponible 24/7')).toBeInTheDocument()
    })

    it('renders without subtitle', () => {
      render(<WhyChooseSection {...defaultProps} subtitle={undefined} />)
      
      expect(screen.getByText('Why Choose Our Platform?')).toBeInTheDocument()
      expect(screen.queryByText('Discover the advantages of our digital services')).not.toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('renders cards variant correctly', () => {
      render(<WhyChooseSection {...defaultProps} variant="cards" />)
      
      const benefits = screen.getAllByRole('article')
      expect(benefits).toHaveLength(3)
      
      benefits.forEach(benefit => {
        expect(benefit).toHaveClass('benefit-card')
      })
    })

    it('renders minimal variant correctly', () => {
      render(<WhyChooseSection {...defaultProps} variant="minimal" />)
      
      const container = screen.getByRole('region', { name: /why choose/i })
      expect(container).toHaveClass('variant-minimal')
      
      // Icons should be smaller in minimal variant
      const icons = container.querySelectorAll('.w-16.h-16')
      expect(icons).toHaveLength(3)
    })

    it('renders icons variant correctly', () => {
      render(<WhyChooseSection {...defaultProps} variant="icons" />)
      
      const container = screen.getByRole('region', { name: /why choose/i })
      expect(container).toHaveClass('variant-icons')
      
      // Should use flex layout for icons variant
      const benefitContainers = container.querySelectorAll('.flex.items-start')
      expect(benefitContainers.length).toBeGreaterThan(0)
    })
  })

  describe('Background Variants', () => {
    it('applies gradient background', () => {
      render(<WhyChooseSection {...defaultProps} background="gradient" />)
      
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).toHaveClass('bg-gradient-to-br')
    })

    it('applies subtle background', () => {
      render(<WhyChooseSection {...defaultProps} background="subtle" />)
      
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).toHaveClass('bg-gray-50/50')
    })

    it('applies no background', () => {
      render(<WhyChooseSection {...defaultProps} background="none" />)
      
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).not.toHaveClass('bg-gradient-to-br', 'bg-gray-50/50')
    })
  })

  describe('Color Schemes', () => {
    it('applies primary color scheme correctly', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const primaryBenefit = screen.getByText('Fast Access').closest('.benefit-card')
      expect(primaryBenefit).toHaveClass('benefit-primary')
    })

    it('applies secondary color scheme correctly', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const secondaryBenefit = screen.getByText('Secure').closest('.benefit-card')
      expect(secondaryBenefit).toHaveClass('benefit-secondary')
    })

    it('applies accent color scheme correctly', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const accentBenefit = screen.getByText('24/7 Available').closest('.benefit-card')
      expect(accentBenefit).toHaveClass('benefit-accent')
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive grid classes', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const container = screen.getByRole('region', { name: /why choose/i })
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-3')
    })

    it('handles mobile viewport correctly', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<WhyChooseSection {...defaultProps} />)
      
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).toHaveClass('py-16')
    })

    it('applies responsive typography', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('text-3xl', 'sm:text-4xl', 'lg:text-5xl')
      
      const subtitle = screen.getByText('Discover the advantages of our digital services')
      expect(subtitle).toHaveClass('text-lg', 'sm:text-xl')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveAttribute('id', 'why-choose-title')
      
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).toHaveAttribute('aria-labelledby', 'why-choose-title')
    })

    it('has proper semantic structure', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const benefits = screen.getAllByRole('article')
      expect(benefits).toHaveLength(3)
      
      benefits.forEach(benefit => {
        const heading = benefit.querySelector('h3')
        expect(heading).toBeInTheDocument()
      })
    })

    it('provides accessible icon content', () => {
      render(<WhyChooseSection {...defaultProps} />)
      
      const icons = screen.getAllByRole('img', { hidden: true })
      expect(icons).toHaveLength(3)
      
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<WhyChooseSection {...defaultProps} />)
      
      // Should be able to tab through the section
      await user.tab()
      
      // Focus should be manageable within the section
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).toBeInTheDocument()
    })
  })

  describe('Content Handling', () => {
    it('handles long titles gracefully', () => {
      const longTitleBenefits = mockBenefits.map(benefit => ({
        ...benefit,
        title: 'This is a very long benefit title that should wrap properly',
      }))
      
      render(<WhyChooseSection {...defaultProps} benefits={longTitleBenefits} />)
      
      expect(screen.getByText('This is a very long benefit title that should wrap properly')).toBeInTheDocument()
    })

    it('handles long descriptions gracefully', () => {
      const longDescBenefits = mockBenefits.map(benefit => ({
        ...benefit,
        description: 'This is a very long benefit description that should wrap properly and maintain good readability across different screen sizes and viewport configurations.',
      }))
      
      render(<WhyChooseSection {...defaultProps} benefits={longDescBenefits} />)
      
      expect(screen.getByText(/This is a very long benefit description/)).toBeInTheDocument()
    })

    it('handles React node icons', () => {
      const reactNodeBenefits = mockBenefits.map(benefit => ({
        ...benefit,
        icon: <span data-testid="custom-icon">Custom Icon</span>,
      }))
      
      render(<WhyChooseSection {...defaultProps} benefits={reactNodeBenefits} />)
      
      const customIcons = screen.getAllByTestId('custom-icon')
      expect(customIcons).toHaveLength(3)
    })
  })

  describe('Dark Mode Support', () => {
    it('applies dark mode classes', () => {
      // Mock dark theme
      jest.mocked(require('@/contexts/ThemeContext').useTheme).mockReturnValue({
        isDark: true,
        theme: 'dark',
      })

      render(<WhyChooseSection {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('dark:text-gray-100')
      
      const subtitle = screen.getByText('Discover the advantages of our digital services')
      expect(subtitle).toHaveClass('dark:text-gray-300')
    })
  })

  describe('Performance', () => {
    it('renders efficiently with many benefits', () => {
      const manyBenefits = Array.from({ length: 20 }, (_, i) => ({
        id: `benefit-${i}`,
        icon: '⭐',
        title: `Benefit ${i}`,
        description: `Description for benefit ${i}`,
        color: 'primary' as const,
      }))
      
      const startTime = performance.now()
      render(<WhyChooseSection {...defaultProps} benefits={manyBenefits} />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should render in less than 100ms
    })
  })

  describe('Error Handling', () => {
    it('handles empty benefits array', () => {
      render(<WhyChooseSection {...defaultProps} benefits={[]} />)
      
      expect(screen.getByText('Why Choose Our Platform?')).toBeInTheDocument()
      expect(screen.queryByRole('article')).not.toBeInTheDocument()
    })

    it('handles missing benefit properties', () => {
      const incompleteBenefits = [
        {
          id: 'incomplete',
          title: 'Incomplete Benefit',
          // Missing icon, description, color
        } as BenefitItem,
      ]
      
      render(<WhyChooseSection {...defaultProps} benefits={incompleteBenefits} />)
      
      expect(screen.getByText('Incomplete Benefit')).toBeInTheDocument()
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<WhyChooseSection {...defaultProps} className="custom-class" />)
      
      const section = screen.getByRole('region', { name: /why choose/i })
      expect(section).toHaveClass('custom-class')
    })
  })
})
