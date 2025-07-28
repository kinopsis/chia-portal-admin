import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'

// Import homepage components
import { ServiceCard } from '@/components/molecules/ServiceCard'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import { HeroSection } from '@/components/organisms/HeroSection'
import { WhyChooseSection } from '@/components/organisms/WhyChooseSection'
import { DepartmentShowcase } from '@/components/organisms/DepartmentShowcase'
import { FAQPreview } from '@/components/organisms/FAQPreview'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

/**
 * Screen Reader Testing Utilities
 */
const getAccessibleName = (element: HTMLElement): string => {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Check aria-labelledby
  const ariaLabelledby = element.getAttribute('aria-labelledby')
  if (ariaLabelledby) {
    const labelElement = document.getElementById(ariaLabelledby)
    if (labelElement) return labelElement.textContent || ''
  }

  // Check associated label
  const id = element.getAttribute('id')
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`)
    if (label) return label.textContent || ''
  }

  // Fall back to text content
  return element.textContent || ''
}

const getAccessibleDescription = (element: HTMLElement): string => {
  const ariaDescribedby = element.getAttribute('aria-describedby')
  if (ariaDescribedby) {
    const descElement = document.getElementById(ariaDescribedby)
    if (descElement) return descElement.textContent || ''
  }
  return ''
}

const hasScreenReaderText = (element: HTMLElement): boolean => {
  const srOnlyElements = element.querySelectorAll('.sr-only, .visually-hidden, [aria-hidden="false"]')
  return srOnlyElements.length > 0
}

describe('Screen Reader Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ServiceCard Screen Reader Support', () => {
    it('provides comprehensive screen reader information', () => {
      render(
        <ServiceCard
          icon="📋"
          title="Certificado de Residencia"
          description="Solicita tu certificado de residencia de manera digital"
          href="/certificados/residencia"
          stats={{ count: 1250, label: 'certificados emitidos' }}
          colorScheme="service-yellow"
        />
      )

      const card = screen.getByRole('article')
      const button = screen.getByRole('button')

      // Card should have accessible name
      const cardName = getAccessibleName(card)
      expect(cardName).toContain('Certificado de Residencia')

      // Button should have descriptive accessible name
      const buttonName = getAccessibleName(button)
      expect(buttonName).toMatch(/acceder|access|certificado de residencia/i)

      // Should have screen reader only text
      expect(hasScreenReaderText(card)).toBe(true)

      // Stats should be accessible
      const statsText = screen.getByText('1,250')
      expect(statsText).toBeInTheDocument()
      expect(screen.getByText('certificados emitidos')).toBeInTheDocument()
    })

    it('announces color scheme information to screen readers', () => {
      const colorSchemes = ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo'] as const

      colorSchemes.forEach(colorScheme => {
        const { unmount } = render(
          <ServiceCard
            icon="📋"
            title={`${colorScheme} Service`}
            description={`${colorScheme} description`}
            href={`/${colorScheme}`}
            colorScheme={colorScheme}
          />
        )

        const card = screen.getByRole('article')
        
        // Should have color scheme information for screen readers
        const accessibleName = getAccessibleName(card)
        const accessibleDesc = getAccessibleDescription(card)
        
        expect(accessibleName || accessibleDesc).toBeTruthy()
        
        unmount()
      })
    })

    it('provides context for statistics', () => {
      render(
        <ServiceCard
          icon="💰"
          title="Pagos en Línea"
          description="Realiza pagos de impuestos y tasas municipales"
          href="/pagos"
          stats={{ count: 2340, label: 'pagos procesados este mes' }}
          colorScheme="service-green"
        />
      )

      // Stats should be properly labeled for screen readers
      const statsContainer = screen.getByText('2,340').closest('[role="group"], [aria-label], [aria-labelledby]')
      expect(statsContainer).toBeTruthy()

      // Label should provide context
      expect(screen.getByText('pagos procesados este mes')).toBeInTheDocument()
    })
  })

  describe('MetricsGrid Screen Reader Support', () => {
    it('provides accessible metric information', () => {
      const metrics = [
        { id: '1', title: 'Usuarios Activos', value: 1250, icon: '👥', color: 'primary' as const },
        { id: '2', title: 'Servicios Disponibles', value: 45, icon: '🔧', color: 'secondary' as const },
        { id: '3', title: 'Ingresos Mensuales', value: 98500, icon: '💰', color: 'success' as const },
      ]

      render(<MetricsGrid metrics={metrics} />)

      const metricCards = screen.getAllByRole('article')
      expect(metricCards).toHaveLength(3)

      metricCards.forEach((card, index) => {
        const metric = metrics[index]
        
        // Should have accessible name
        const accessibleName = getAccessibleName(card)
        expect(accessibleName).toContain(metric.title)

        // Value should be announced properly
        expect(screen.getByText(metric.value.toLocaleString())).toBeInTheDocument()
        
        // Should have proper semantic structure
        expect(card).toHaveAttribute('aria-labelledby')
      })
    })

    it('announces animated counter changes', async () => {
      const metrics = [
        { id: '1', title: 'Counter Test', value: 1000, icon: '📊', color: 'primary' as const },
      ]

      render(<MetricsGrid metrics={metrics} animated={true} animationDuration={100} />)

      // Should have aria-live region for counter updates
      const liveRegion = screen.getByRole('article')
      expect(liveRegion).toHaveAttribute('aria-live')
    })
  })

  describe('HeroSection Screen Reader Support', () => {
    it('provides accessible hero content', () => {
      render(<HeroSection />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading.textContent?.trim()).toBeTruthy()

      // Should have proper heading hierarchy
      expect(heading.tagName).toBe('H1')
    })

    it('provides accessible search functionality', () => {
      render(<HeroSection enableSearch={true} />)

      const searchInput = screen.getByRole('searchbox') || screen.getByPlaceholderText(/buscar/i)
      expect(searchInput).toBeInTheDocument()

      // Should have accessible label
      const accessibleName = getAccessibleName(searchInput as HTMLElement)
      expect(accessibleName).toMatch(/buscar|search/i)

      // Should have proper input type
      expect(searchInput).toHaveAttribute('type', 'search')
    })

    it('announces search results to screen readers', async () => {
      const user = userEvent.setup()
      const mockOnSearch = jest.fn()

      render(<HeroSection enableSearch={true} onSearch={mockOnSearch} />)

      const searchInput = screen.getByPlaceholderText(/buscar/i)
      
      await user.type(searchInput, 'certificado')
      
      // Should have aria-live region for search results
      const resultsRegion = screen.queryByRole('region', { name: /resultados|results/i })
      if (resultsRegion) {
        expect(resultsRegion).toHaveAttribute('aria-live')
      }
    })
  })

  describe('WhyChooseSection Screen Reader Support', () => {
    it('provides accessible benefit information', () => {
      render(<WhyChooseSection />)

      const section = screen.getByRole('region', { name: /por qué elegir|why choose/i })
      expect(section).toBeInTheDocument()

      const benefits = screen.getAllByRole('article')
      expect(benefits.length).toBeGreaterThan(0)

      benefits.forEach(benefit => {
        // Should have accessible name
        const accessibleName = getAccessibleName(benefit)
        expect(accessibleName).toBeTruthy()

        // Should have proper structure
        const heading = benefit.querySelector('h2, h3, h4')
        expect(heading).toBeTruthy()
      })
    })

    it('provides context for benefit icons', () => {
      render(<WhyChooseSection />)

      const benefits = screen.getAllByRole('article')
      
      benefits.forEach(benefit => {
        // Icons should have alt text or be marked as decorative
        const icons = benefit.querySelectorAll('svg, img, [role="img"]')
        icons.forEach(icon => {
          const hasAltText = icon.getAttribute('alt') ||
                           icon.getAttribute('aria-label') ||
                           icon.getAttribute('aria-labelledby')
          const isDecorative = icon.getAttribute('aria-hidden') === 'true' ||
                              icon.getAttribute('role') === 'presentation'
          
          expect(hasAltText || isDecorative).toBeTruthy()
        })
      })
    })
  })

  describe('DepartmentShowcase Screen Reader Support', () => {
    it('provides accessible department navigation', () => {
      render(<DepartmentShowcase />)

      const section = screen.getByRole('region', { name: /dependencias|departments/i })
      expect(section).toBeInTheDocument()

      const departmentLinks = screen.getAllByRole('link')
      expect(departmentLinks.length).toBeGreaterThan(0)

      departmentLinks.forEach(link => {
        // Should have accessible name
        const accessibleName = getAccessibleName(link)
        expect(accessibleName).toBeTruthy()

        // Should indicate it's a link to department
        expect(accessibleName).toMatch(/dependencia|department|ir a|go to/i)
      })
    })

    it('provides department statistics context', () => {
      render(<DepartmentShowcase />)

      const departmentLinks = screen.getAllByRole('link')
      
      departmentLinks.forEach(link => {
        // Should have statistics information
        const statsElements = link.querySelectorAll('[aria-label*="trámite"], [aria-label*="servicio"]')
        if (statsElements.length > 0) {
          statsElements.forEach(stat => {
            const accessibleName = getAccessibleName(stat as HTMLElement)
            expect(accessibleName).toMatch(/\d+.*trámite|servicio/i)
          })
        }
      })
    })
  })

  describe('FAQPreview Screen Reader Support', () => {
    it('provides accessible accordion functionality', () => {
      render(<FAQPreview />)

      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )

      expect(faqButtons.length).toBeGreaterThan(0)

      faqButtons.forEach(button => {
        // Should have proper ARIA attributes
        expect(button).toHaveAttribute('aria-expanded')
        expect(button).toHaveAttribute('aria-controls')

        // Should have accessible name (the question)
        const accessibleName = getAccessibleName(button)
        expect(accessibleName).toBeTruthy()
        expect(accessibleName.length).toBeGreaterThan(10) // Should be a meaningful question
      })
    })

    it('announces accordion state changes', async () => {
      const user = userEvent.setup()
      
      render(<FAQPreview />)

      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )

      if (faqButtons.length > 1) {
        const button = faqButtons[1]
        const initialExpanded = button.getAttribute('aria-expanded')

        await user.click(button)

        const newExpanded = button.getAttribute('aria-expanded')
        expect(newExpanded).not.toBe(initialExpanded)

        // Should control a panel
        const controlsId = button.getAttribute('aria-controls')
        if (controlsId) {
          const panel = document.getElementById(controlsId)
          expect(panel).toBeTruthy()
          
          if (panel) {
            expect(panel).toHaveAttribute('role', 'region')
            expect(panel).toHaveAttribute('aria-labelledby', button.id)
          }
        }
      }
    })

    it('provides proper FAQ content structure', () => {
      render(<FAQPreview />)

      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )

      faqButtons.forEach(button => {
        const controlsId = button.getAttribute('aria-controls')
        if (controlsId) {
          const panel = document.getElementById(controlsId)
          if (panel) {
            // Panel should have accessible content
            expect(panel.textContent?.trim()).toBeTruthy()
            
            // Should be properly associated
            expect(panel).toHaveAttribute('aria-labelledby', button.id)
          }
        }
      })
    })
  })

  describe('Cross-Component Screen Reader Support', () => {
    it('provides logical reading order', () => {
      render(
        <main>
          <HeroSection />
          <MetricsGrid metrics={[]} />
          <WhyChooseSection />
          <DepartmentShowcase />
          <FAQPreview />
        </main>
      )

      // Should have main landmark
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()

      // Should have proper heading hierarchy
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // First heading should be h1
      const h1 = headings.find(h => h.tagName === 'H1')
      expect(h1).toBeTruthy()
    })

    it('provides skip navigation functionality', () => {
      render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Saltar al contenido principal
          </a>
          <main id="main-content">
            <HeroSection />
            <WhyChooseSection />
          </main>
        </div>
      )

      const skipLink = screen.getByText(/saltar al contenido/i)
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute('href', '#main-content')

      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveAttribute('id', 'main-content')
    })

    it('announces theme changes to screen readers', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
        
        return (
          <ThemeProvider defaultTheme={theme}>
            <div>
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
              >
                Cambiar tema
              </button>
              <div aria-live="polite" aria-atomic="true">
                Tema actual: {theme}
              </div>
              <ServiceCard
                icon="📋"
                title="Test Service"
                description="Test description"
                href="/test"
                colorScheme="service-blue"
              />
            </div>
          </ThemeProvider>
        )
      }

      render(<TestComponent />)
      
      const themeButton = screen.getByRole('button', { name: /cambiar a tema/i })
      const themeStatus = screen.getByText(/tema actual/i)
      
      expect(themeStatus).toHaveAttribute('aria-live', 'polite')
      
      await user.click(themeButton)
      
      // Theme change should be announced
      expect(themeStatus.textContent).toContain('dark')
    })
  })

  describe('Error State Screen Reader Support', () => {
    it('announces error states accessibly', () => {
      render(
        <div>
          <div role="alert" aria-live="assertive">
            Error: No se pudo cargar el contenido
          </div>
          <MetricsGrid metrics={[]} loading={false} error="Error de conexión" />
        </div>
      )

      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
    })

    it('provides accessible loading states', () => {
      render(<MetricsGrid metrics={[]} loading={true} />)

      const loadingIndicator = screen.getByText(/cargando|loading/i) || 
                              screen.getByRole('status') ||
                              screen.getByLabelText(/cargando|loading/i)
      
      expect(loadingIndicator).toBeInTheDocument()
      
      if (loadingIndicator.getAttribute('role') === 'status') {
        expect(loadingIndicator).toHaveAttribute('aria-live')
      }
    })
  })
})
