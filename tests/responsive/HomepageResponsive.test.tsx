import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import {
  setViewport,
  validateGridLayout,
  validateTouchTargets,
  validateTypographyScaling,
  createResponsiveTestSuite,
  mockMatchMedia,
  VIEWPORT_SIZES,
  type ViewportSize,
  type BreakpointName,
} from '../utils/responsiveTestUtils'

// Import homepage components
import { ServiceCard } from '@/components/molecules/ServiceCard'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import { HeroSection } from '@/components/organisms/HeroSection'
import { WhyChooseSection } from '@/components/organisms/WhyChooseSection'
import { DepartmentShowcase } from '@/components/organisms/DepartmentShowcase'
import { FAQPreview } from '@/components/organisms/FAQPreview'

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

// Mock providers
jest.mock('@/components/providers', () => ({
  useMobileOptimization: () => ({
    isMobile: false,
    isTouch: false,
    viewportCategory: 'desktop',
    isInitialized: true,
  }),
}))

describe('Homepage Responsive Design Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Reset viewport after each test
    setViewport('Desktop Medium')
  })

  describe('ServiceCard Responsive Behavior', () => {
    const serviceCardProps = {
      icon: '📋',
      title: 'Test Service',
      description: 'Test service description',
      href: '/test',
      stats: { count: 150, label: 'services' },
      colorScheme: "service-yellow" as const,
    , buttonText: "Ver más" , buttonText: "Ver más" }

    createResponsiveTestSuite(
      'ServiceCard',
      (viewport: ViewportSize, breakpoint: BreakpointName) => {
        it('renders with correct responsive classes', () => {
          mockMatchMedia(VIEWPORT_SIZES[viewport].width)
          render(<ServiceCard {...serviceCardProps} />)
          
          const card = screen.getByRole('article')
          
          switch (breakpoint) {
            case 'mobile':
              expect(card).toHaveClass('service-card-sm')
              break
            case 'tablet':
              expect(card).toHaveClass('service-card-md')
              break
            case 'desktop':
              expect(card).toHaveClass('service-card-lg')
              break
          }
        })

        it('has appropriate touch targets on mobile', () => {
          if (breakpoint === 'mobile') {
            render(<ServiceCard {...serviceCardProps} />)
            const card = screen.getByRole('article')
            const button = screen.getByRole('button')
            
            const touchValidation = validateTouchTargets(card)
            expect(touchValidation.isValid).toBe(true)
            
            // Button should have minimum 44px height on mobile
            const buttonRect = button.getBoundingClientRect()
            expect(buttonRect.height).toBeGreaterThanOrEqual(44)
          }
        })

        it('has readable typography', () => {
          render(<ServiceCard {...serviceCardProps} />)
          const title = screen.getByText('Test Service')
          
          const typography = validateTypographyScaling(title)
          expect(typography.isReadable).toBe(true)
          
          if (breakpoint === 'mobile') {
            expect(parseInt(typography.fontSize)).toBeGreaterThanOrEqual(16)
          }
        })
      }
    )
  })

  describe('MetricsGrid Responsive Layout', () => {
    const metricsData = [
      { id: '1', title: 'Users', value: 100, icon: '👥', color: 'primary' as const },
      { id: '2', title: 'Services', value: 50, icon: '🔧', color: 'secondary' as const },
      { id: '3', title: 'Revenue', value: 1000, icon: '💰', color: 'success' as const },
      { id: '4', title: 'Growth', value: 25, icon: '📈', color: 'info' as const },
      { id: '5', title: 'Support', value: 95, icon: '🎯', color: 'warning' as const },
    ]

    createResponsiveTestSuite(
      'MetricsGrid',
      (viewport: ViewportSize, breakpoint: BreakpointName) => {
        it('displays correct grid layout', () => {
          render(<MetricsGrid metrics={metricsData} layout="responsive" />)
          
          const container = screen.getByRole('region', { name: /metrics/i })
          const gridContainer = container.querySelector('.grid')
          
          if (gridContainer) {
            const expectedColumns = {
              mobile: 2,
              tablet: 3,
              desktop: 5,
            }
            
            const gridValidation = validateGridLayout(gridContainer as HTMLElement, expectedColumns)
            expect(gridValidation.isValid).toBe(true)
          }
        })

        it('has appropriate spacing between items', () => {
          render(<MetricsGrid metrics={metricsData} />)
          
          const metrics = screen.getAllByRole('article')
          expect(metrics).toHaveLength(5)
          
          // Check that all metrics are visible
          metrics.forEach(metric => {
            expect(metric).toBeVisible()
          })
        })
      }
    )
  })

  describe('HeroSection Responsive Design', () => {
    createResponsiveTestSuite(
      'HeroSection',
      (viewport: ViewportSize, breakpoint: BreakpointName) => {
        it('applies responsive typography', () => {
          render(<HeroSection />)
          
          const title = screen.getByRole('heading', { level: 1 })
          const subtitle = screen.getByText(/accede a trámites/i)
          
          // Check title typography
          const titleTypography = validateTypographyScaling(title)
          expect(titleTypography.isReadable).toBe(true)
          
          // Check subtitle typography
          const subtitleTypography = validateTypographyScaling(subtitle)
          expect(subtitleTypography.isReadable).toBe(true)
          
          // Verify responsive classes
          expect(title).toHaveClass('text-3xl')
          if (breakpoint === 'tablet') {
            expect(title).toHaveClass('sm:text-4xl')
          }
          if (breakpoint === 'desktop') {
            expect(title).toHaveClass('lg:text-5xl')
          }
        })

        it('has properly sized search input', () => {
          render(<HeroSection enableSearch={true} />)
          
          const searchInput = screen.getByPlaceholderText(/buscar trámite/i)
          const inputRect = searchInput.getBoundingClientRect()
          
          if (breakpoint === 'mobile') {
            // Search input should be full width on mobile
            expect(inputRect.width).toBeGreaterThan(200)
            // Font size should be 16px to prevent zoom on iOS
            const computedStyle = window.getComputedStyle(searchInput)
            expect(parseInt(computedStyle.fontSize)).toBeGreaterThanOrEqual(16)
          }
        })

        it('has accessible touch targets', () => {
          render(<HeroSection />)
          
          const section = screen.getByRole('region', { name: /hero/i })
          const touchValidation = validateTouchTargets(section)
          
          if (breakpoint === 'mobile') {
            expect(touchValidation.isValid).toBe(true)
            if (touchValidation.violations.length > 0) {
              console.warn('Touch target violations:', touchValidation.violations)
            }
          }
        })
      }
    )
  })

  describe('WhyChooseSection Grid Layout', () => {
    createResponsiveTestSuite(
      'WhyChooseSection',
      (viewport: ViewportSize, breakpoint: BreakpointName) => {
        it('displays correct number of columns', () => {
          render(<WhyChooseSection />)
          
          const container = screen.getByRole('region', { name: /why choose/i })
          const gridContainer = container.querySelector('.grid')
          
          if (gridContainer) {
            const expectedColumns = {
              mobile: 1,
              tablet: 3,
              desktop: 3,
            }
            
            const gridValidation = validateGridLayout(gridContainer as HTMLElement, expectedColumns)
            expect(gridValidation.isValid).toBe(true)
          }
        })

        it('has readable benefit descriptions', () => {
          render(<WhyChooseSection />)
          
          const benefits = screen.getAllByRole('article')
          expect(benefits.length).toBeGreaterThan(0)
          
          benefits.forEach(benefit => {
            const description = benefit.querySelector('p')
            if (description) {
              const typography = validateTypographyScaling(description)
              expect(typography.isReadable).toBe(true)
            }
          })
        })
      }
    )
  })

  describe('DepartmentShowcase Responsive Grid', () => {
    createResponsiveTestSuite(
      'DepartmentShowcase',
      (viewport: ViewportSize, breakpoint: BreakpointName) => {
        it('displays correct grid layout', () => {
          render(<DepartmentShowcase />)
          
          const container = screen.getByRole('region', { name: /departments/i })
          const gridContainer = container.querySelector('.grid')
          
          if (gridContainer) {
            const expectedColumns = {
              mobile: 1,
              tablet: 2,
              desktop: 4,
            }
            
            const gridValidation = validateGridLayout(gridContainer as HTMLElement, expectedColumns)
            expect(gridValidation.isValid).toBe(true)
          }
        })

        it('has accessible department links', () => {
          render(<DepartmentShowcase />)
          
          const links = screen.getAllByRole('link')
          expect(links.length).toBeGreaterThan(0)
          
          if (breakpoint === 'mobile') {
            const touchValidation = validateTouchTargets(links[0].closest('section') as HTMLElement)
            expect(touchValidation.isValid).toBe(true)
          }
        })
      }
    )
  })

  describe('FAQPreview Accordion Responsive', () => {
    createResponsiveTestSuite(
      'FAQPreview',
      (viewport: ViewportSize, breakpoint: BreakpointName) => {
        it('has properly sized accordion buttons', () => {
          render(<FAQPreview />)
          
          const buttons = screen.getAllByRole('button')
          const faqButtons = buttons.filter(btn => 
            btn.getAttribute('aria-expanded') !== null
          )
          
          expect(faqButtons.length).toBeGreaterThan(0)
          
          faqButtons.forEach(button => {
            const buttonRect = button.getBoundingClientRect()
            
            if (breakpoint === 'mobile') {
              // FAQ buttons should have minimum 56px height on mobile
              expect(buttonRect.height).toBeGreaterThanOrEqual(56)
            } else {
              // Larger touch targets on tablet/desktop
              expect(buttonRect.height).toBeGreaterThanOrEqual(44)
            }
          })
        })

        it('has readable FAQ content', () => {
          render(<FAQPreview />)
          
          const questions = screen.getAllByRole('button').filter(btn => 
            btn.getAttribute('aria-expanded') !== null
          )
          
          questions.forEach(question => {
            const typography = validateTypographyScaling(question)
            expect(typography.isReadable).toBe(true)
          })
        })
      }
    )
  })

  describe('Cross-Component Layout Integration', () => {
    it('maintains proper spacing between sections across breakpoints', () => {
      const viewports: ViewportSize[] = ['Mobile Small', 'iPad', 'Desktop Medium']
      
      viewports.forEach(viewport => {
        setViewport(viewport)
        mockMatchMedia(VIEWPORT_SIZES[viewport].width)
        
        const { container } = render(
          <div>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
            <DepartmentShowcase />
            <FAQPreview />
          </div>
        )
        
        // Check that all sections are rendered
        expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
        expect(screen.getByText(/por qué elegir/i)).toBeInTheDocument()
        expect(screen.getByText(/acceso rápido por dependencia/i)).toBeInTheDocument()
        expect(screen.getByText(/preguntas frecuentes/i)).toBeInTheDocument()
        
        // Validate overall layout doesn't have horizontal scroll
        const bodyWidth = document.body.scrollWidth
        const viewportWidth = VIEWPORT_SIZES[viewport].width
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20) // Allow small tolerance
      })
    })
  })
})
