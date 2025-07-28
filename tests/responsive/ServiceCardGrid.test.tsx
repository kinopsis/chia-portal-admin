import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  setViewport,
  validateGridLayout,
  validateTouchTargets,
  mockMatchMedia,
  VIEWPORT_SIZES,
  type ViewportSize,
} from '../utils/responsiveTestUtils'
import { ServiceCard } from '@/components/molecules/ServiceCard'
import { ResponsiveContainer } from '@/components/atoms/ResponsiveContainer'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock theme context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    theme: 'light',
  }),
}))

describe('Service Card Grid Responsive Tests', () => {
  const mockServices = [
    {
      icon: '📋',
      title: 'Certificado de Residencia',
      description: 'Solicita tu certificado de residencia de manera digital',
      href: '/certificados/residencia',
      stats: { count: 1250, label: 'certificados emitidos' },
      colorScheme: "service-yellow" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" },
    {
      icon: '📄',
      title: 'Trámites Administrativos',
      description: 'Gestiona tus trámites administrativos en línea',
      href: '/tramites',
      stats: { count: 156, label: 'procedimientos disponibles' },
      colorScheme: "service-gray" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" },
    {
      icon: '👥',
      title: 'Consulta Ciudadano',
      description: 'Consulta el estado de tus solicitudes',
      href: '/consultas',
      stats: { count: 890, label: 'consultas atendidas' },
      colorScheme: "service-blue" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" },
    {
      icon: '💰',
      title: 'Pagos en Línea',
      description: 'Realiza pagos de impuestos y tasas municipales',
      href: '/pagos',
      stats: { count: 2340, label: 'pagos procesados' },
      colorScheme: "service-green" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" },
    {
      icon: '📞',
      title: 'Agendar Cita',
      description: 'Agenda tu cita para atención presencial',
      href: '/citas',
      stats: { count: 450, label: 'citas disponibles' },
      colorScheme: "service-purple" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" },
    {
      icon: '📋',
      title: 'Formularios',
      description: 'Descarga y diligencia formularios oficiales',
      href: '/formularios',
      stats: { count: 89, label: 'formularios disponibles' },
      colorScheme: "service-indigo" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" },
  ]

  const ServiceGrid: React.FC = () => (
    <ResponsiveContainer
      layout="service-cards"
      gap="lg"
      padding="none"
      className="w-full"
      data-testid="service-grid"
    >
      {mockServices.map((service, index) => (
        <ServiceCard
          key={index}
          icon={service.icon}
          title={service.title}
          description={service.description}
          href={service.href}
          stats={service.stats}
          colorScheme={service.colorScheme}
          size="md"
          animated={true}
        />
      ))}
    </ResponsiveContainer>
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    setViewport('Desktop Medium')
  })

  describe('Grid Layout Responsiveness', () => {
    const testViewports: ViewportSize[] = [
      'Mobile Small',
      'iPhone 12',
      'iPad',
      'Desktop Medium',
      'Desktop Large',
    ]

    testViewports.forEach(viewport => {
      const { width } = VIEWPORT_SIZES[viewport]
      const expectedColumns = width < 640 ? 1 : width < 1024 ? 2 : 3

      it(`displays ${expectedColumns} columns at ${viewport} (${width}px)`, () => {
        setViewport(viewport)
        mockMatchMedia(width)
        
        render(<ServiceGrid />)
        
        const grid = screen.getByTestId('service-grid')
        expect(grid).toBeInTheDocument()
        
        // Verify grid layout
        const gridValidation = validateGridLayout(grid, {
          mobile: 1,
          tablet: 2,
          desktop: 3,
        })
        
        expect(gridValidation.isValid).toBe(true)
        expect(gridValidation.actual).toBe(expectedColumns)
      })
    })
  })

  describe('Service Card Sizing', () => {
    it('applies correct card sizes across breakpoints', () => {
      const viewports: { viewport: ViewportSize; expectedSize: string }[] = [
        { viewport: 'Mobile Small', expectedSize: 'sm' },
        { viewport: 'iPad', expectedSize: 'md' },
        { viewport: 'Desktop Medium', expectedSize: 'lg' },
      ]

      viewports.forEach(({ viewport, expectedSize }) => {
        setViewport(viewport)
        mockMatchMedia(VIEWPORT_SIZES[viewport].width)
        
        render(<ServiceGrid />)
        
        const cards = screen.getAllByRole('article')
        expect(cards).toHaveLength(6)
        
        cards.forEach(card => {
          expect(card).toHaveClass(`service-card-${expectedSize}`)
        })
      })
    })
  })

  describe('Touch Target Validation', () => {
    it('meets touch target requirements on mobile', () => {
      setViewport('Mobile Small')
      mockMatchMedia(320)
      
      render(<ServiceGrid />)
      
      const grid = screen.getByTestId('service-grid')
      const touchValidation = validateTouchTargets(grid)
      
      expect(touchValidation.isValid).toBe(true)
      
      if (touchValidation.violations.length > 0) {
        console.warn('Touch target violations found:', touchValidation.violations)
      }
    })

    it('has properly sized buttons on all devices', () => {
      const testViewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
      
      testViewports.forEach(viewport => {
        setViewport(viewport)
        mockMatchMedia(VIEWPORT_SIZES[viewport].width)
        
        render(<ServiceGrid />)
        
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
        
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect()
          const minSize = VIEWPORT_SIZES[viewport].width < 640 ? 44 : 40
          
          expect(rect.height).toBeGreaterThanOrEqual(minSize)
          expect(rect.width).toBeGreaterThanOrEqual(minSize)
        })
      })
    })
  })

  describe('Content Overflow and Wrapping', () => {
    it('handles long service titles gracefully', () => {
      const longTitleServices = mockServices.map(service => ({
        ...service,
        title: 'Very Long Service Title That Should Wrap Properly Across Multiple Lines',
      }))

      const LongTitleGrid = () => (
        <ResponsiveContainer layout="service-cards" gap="lg" padding="none">
          {longTitleServices.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </ResponsiveContainer>
      )

      const testViewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
      
      testViewports.forEach(viewport => {
        setViewport(viewport)
        mockMatchMedia(VIEWPORT_SIZES[viewport].width)
        
        render(<LongTitleGrid />)
        
        const cards = screen.getAllByRole('article')
        cards.forEach(card => {
          // Check that card doesn't overflow horizontally
          const rect = card.getBoundingClientRect()
          expect(rect.right).toBeLessThanOrEqual(VIEWPORT_SIZES[viewport].width)
          
          // Check that title is visible
          const title = card.querySelector('h3')
          expect(title).toBeVisible()
        })
      })
    })

    it('maintains proper spacing between cards', () => {
      const testViewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
      
      testViewports.forEach(viewport => {
        setViewport(viewport)
        mockMatchMedia(VIEWPORT_SIZES[viewport].width)
        
        render(<ServiceGrid />)
        
        const cards = screen.getAllByRole('article')
        expect(cards.length).toBe(6)
        
        // Verify all cards are visible and properly spaced
        cards.forEach((card, index) => {
          expect(card).toBeVisible()
          
          const rect = card.getBoundingClientRect()
          expect(rect.width).toBeGreaterThan(0)
          expect(rect.height).toBeGreaterThan(0)
          
          // Check for reasonable minimum card size
          const minWidth = VIEWPORT_SIZES[viewport].width < 640 ? 280 : 200
          expect(rect.width).toBeGreaterThanOrEqual(minWidth)
        })
      })
    })
  })

  describe('Visual Hierarchy', () => {
    it('maintains proper typography scaling', () => {
      const testViewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
      
      testViewports.forEach(viewport => {
        setViewport(viewport)
        mockMatchMedia(VIEWPORT_SIZES[viewport].width)
        
        render(<ServiceGrid />)
        
        const titles = screen.getAllByRole('heading', { level: 3 })
        expect(titles.length).toBe(6)
        
        titles.forEach(title => {
          const computedStyle = window.getComputedStyle(title)
          const fontSize = parseInt(computedStyle.fontSize)
          
          // Ensure readable font sizes
          if (VIEWPORT_SIZES[viewport].width < 640) {
            expect(fontSize).toBeGreaterThanOrEqual(16) // Mobile minimum
          } else {
            expect(fontSize).toBeGreaterThanOrEqual(14) // Desktop minimum
          }
        })
      })
    })

    it('applies correct color schemes consistently', () => {
      render(<ServiceGrid />)
      
      const cards = screen.getAllByRole('article')
      const expectedColors = ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo']
      
      cards.forEach((card, index) => {
        expect(card).toHaveClass(`service-card-${expectedColors[index]}`)
      })
    })
  })

  describe('Performance with Large Grids', () => {
    it('renders efficiently with many service cards', () => {
      const manyServices = Array.from({ length: 50 }, (_, i) => ({
        icon: '📋',
        title: `Service ${i + 1}`,
        description: `Description for service ${i + 1}`,
        href: `/service-${i + 1}`,
        stats: { count: (i + 1) * 10, label: 'items' },
        colorScheme: mockServices[i % 6].colorScheme,
      }))

      const LargeGrid = () => (
        <ResponsiveContainer layout="service-cards" gap="lg" padding="none">
          {manyServices.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </ResponsiveContainer>
      )

      const startTime = performance.now()
      render(<LargeGrid />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(200) // Should render in less than 200ms
      
      const cards = screen.getAllByRole('article')
      expect(cards).toHaveLength(50)
    })
  })

  describe('Accessibility in Grid Layout', () => {
    it('maintains proper focus order', () => {
      render(<ServiceGrid />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(6)
      
      // Verify buttons are in document order
      buttons.forEach((button, index) => {
        expect(button).toBeInTheDocument()
        expect(button.tabIndex).not.toBe(-1) // Should be focusable
      })
    })

    it('provides proper ARIA labels for service cards', () => {
      render(<ServiceGrid />)
      
      const cards = screen.getAllByRole('article')
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-labelledby')
        
        const labelId = card.getAttribute('aria-labelledby')
        if (labelId) {
          const labelElement = document.getElementById(labelId)
          expect(labelElement).toBeInTheDocument()
        }
      })
    })
  })
})
