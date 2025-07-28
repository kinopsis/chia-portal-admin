import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import {
  WebVitalsCollector,
  MemoryMonitor,
  PerformanceTimer,
  CORE_WEB_VITALS_THRESHOLDS,
  PERFORMANCE_BUDGET,
  createPerformanceTestSuite,
} from '../utils/performanceTestUtils'

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

// Mock performance API
const mockPerformanceObserver = jest.fn()
global.PerformanceObserver = mockPerformanceObserver as any

describe('Homepage Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock performance.now
    jest.spyOn(performance, 'now').mockImplementation(() => Date.now())
    
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 10 * 1024 * 1024, // 10MB
        totalJSHeapSize: 20 * 1024 * 1024, // 20MB
        jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
      },
      writable: true,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Component Rendering Performance', () => {
    it('renders ServiceCard efficiently', () => {
      const timer = new PerformanceTimer()
      
      const serviceProps = {
        icon: '📋',
        title: 'Test Service',
        description: 'Test description',
        href: '/test',
        stats: { count: 150, label: 'services' },
        colorScheme: "service-yellow" as const,
        buttonText: "Ver más"
      , buttonText: "Ver más" }

      const renderTime = timer.measure('servicecard-render', () => {
        render(<ServiceCard {...serviceProps} />)
      })

      expect(renderTime).toBeLessThan(50) // Should render in less than 50ms
      expect(screen.getByText('Test Service')).toBeInTheDocument()
    })

    it('renders ServiceCard grid efficiently with all color schemes', () => {
      const timer = new PerformanceTimer()
      const colorSchemes = ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo'] as const
      
      const services = colorSchemes.map((scheme, index) => ({
        icon: '📋',
        title: `Service ${index + 1}`,
        description: `Description ${index + 1}`,
        href: `/service-${index + 1}`,
        stats: { count: (index + 1) * 100, label: 'items' },
        colorScheme: scheme,
      }))

      const renderTime = timer.measure('service-grid-render', () => {
        render(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        )
      })

      expect(renderTime).toBeLessThan(100) // Should render 6 cards in less than 100ms
      expect(screen.getAllByRole('article')).toHaveLength(6)
    })

    it('renders MetricsGrid with animations efficiently', async () => {
      const timer = new PerformanceTimer()
      const memoryMonitor = new MemoryMonitor()
      
      const metrics = [
        { id: '1', title: 'Users', value: 1250, icon: '👥', color: 'primary' as const },
        { id: '2', title: 'Services', value: 45, icon: '🔧', color: 'secondary' as const },
        { id: '3', title: 'Revenue', value: 98500, icon: '💰', color: 'success' as const },
      ]

      memoryMonitor.recordMeasurement()

      const renderTime = timer.measure('metrics-grid-render', () => {
        render(<MetricsGrid metrics={metrics} animated={true} animationDuration={100} />)
      })

      // Wait for animations to complete
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument()
      }, { timeout: 200 })

      memoryMonitor.recordMeasurement()

      expect(renderTime).toBeLessThan(80) // Should render quickly
      expect(memoryMonitor.getMemoryIncrease()).toBeLessThan(5) // Should not use excessive memory
    })

    it('renders HeroSection efficiently', () => {
      const timer = new PerformanceTimer()
      
      const renderTime = timer.measure('hero-section-render', () => {
        render(<HeroSection />)
      })

      expect(renderTime).toBeLessThan(60) // Should render in less than 60ms
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('renders complete homepage efficiently', () => {
      const timer = new PerformanceTimer()
      const memoryMonitor = new MemoryMonitor()
      
      memoryMonitor.recordMeasurement()

      const renderTime = timer.measure('full-homepage-render', () => {
        render(
          <ThemeProvider defaultTheme="light">
            <div>
              <HeroSection />
              <MetricsGrid metrics={[]} />
              <WhyChooseSection />
              <DepartmentShowcase />
              <FAQPreview />
            </div>
          </ThemeProvider>
        )
      })

      memoryMonitor.recordMeasurement()

      expect(renderTime).toBeLessThan(200) // Should render complete homepage in less than 200ms
      expect(memoryMonitor.getMemoryIncrease()).toBeLessThan(10) // Should not use excessive memory
      
      // Verify all sections are rendered
      expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
      expect(screen.getByText(/por qué elegir/i)).toBeInTheDocument()
      expect(screen.getByText(/acceso rápido por dependencia/i)).toBeInTheDocument()
      expect(screen.getByText(/preguntas frecuentes/i)).toBeInTheDocument()
    })
  })

  describe('Interaction Performance', () => {
    it('handles theme switching efficiently', async () => {
      const timer = new PerformanceTimer()
      const user = userEvent.setup()
      
      const TestThemeComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
        
        return (
          <ThemeProvider defaultTheme={theme}>
            <div>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle Theme
              </button>
              <ServiceCard
                icon="📋"
                title="Test Service"
                description="Test description"
                href="/test"
                colorScheme="service-yellow"
              />
            </div>
          </ThemeProvider>
        )
      }

      render(<TestThemeComponent />)
      
      const toggleButton = screen.getByText('Toggle Theme')
      
      const switchTime = await timer.measureAsync('theme-switch', async () => {
        await user.click(toggleButton)
        await waitFor(() => {
          expect(document.documentElement.classList.contains('dark')).toBe(true)
        })
      })

      expect(switchTime).toBeLessThan(100) // Theme switch should be fast
    })

    it('handles search input efficiently', async () => {
      const timer = new PerformanceTimer()
      const user = userEvent.setup()
      
      render(<HeroSection enableSearch={true} />)
      
      const searchInput = screen.getByPlaceholderText(/buscar trámite/i)
      
      const typingTime = await timer.measureAsync('search-typing', async () => {
        await user.type(searchInput, 'certificado de residencia')
      })

      expect(typingTime).toBeLessThan(500) // Typing should be responsive
      expect(searchInput).toHaveValue('certificado de residencia')
    })

    it('handles FAQ accordion efficiently', async () => {
      const timer = new PerformanceTimer()
      const user = userEvent.setup()
      
      render(<FAQPreview />)
      
      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )

      if (faqButtons.length > 1) {
        const accordionTime = await timer.measureAsync('faq-accordion', async () => {
          await user.click(faqButtons[1])
          await waitFor(() => {
            expect(faqButtons[1]).toHaveAttribute('aria-expanded', 'true')
          })
        })

        expect(accordionTime).toBeLessThan(200) // Accordion should open quickly
      }
    })
  })

  describe('Memory Usage and Leak Detection', () => {
    it('does not leak memory during repeated renders', () => {
      const memoryMonitor = new MemoryMonitor()
      
      memoryMonitor.recordMeasurement()

      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <ServiceCard
            icon="📋"
            title={`Service ${i}`}
            description={`Description ${i}`}
            href={`/service-${i}`}
            colorScheme="service-blue"
          />
        )
        unmount()
      }

      memoryMonitor.recordMeasurement()

      const memoryIncrease = memoryMonitor.getMemoryIncrease()
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_BUDGET.memoryIncrease) // Should not leak significant memory
    })

    it('does not leak memory during theme switching', async () => {
      const memoryMonitor = new MemoryMonitor()
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
        
        return (
          <ThemeProvider defaultTheme={theme}>
            <div>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle
              </button>
              <ServiceCard
                icon="📋"
                title="Test Service"
                description="Test description"
                href="/test"
                colorScheme="service-green"
              />
            </div>
          </ThemeProvider>
        )
      }

      render(<TestComponent />)
      
      memoryMonitor.recordMeasurement()

      const toggleButton = screen.getByText('Toggle')
      
      // Switch themes multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(toggleButton)
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
        })
      }

      memoryMonitor.recordMeasurement()

      const memoryIncrease = memoryMonitor.getMemoryIncrease()
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_BUDGET.memoryIncrease) // Should not leak memory
    })
  })

  describe('Animation Performance', () => {
    it('handles metric counter animations efficiently', async () => {
      const timer = new PerformanceTimer()
      
      const metrics = [
        { id: '1', title: 'Users', value: 5000, icon: '👥', color: 'primary' as const },
        { id: '2', title: 'Revenue', value: 250000, icon: '💰', color: 'success' as const },
      ]

      render(<MetricsGrid metrics={metrics} animated={true} animationDuration={200} />)

      const animationTime = await timer.measureAsync('counter-animation', async () => {
        await waitFor(() => {
          expect(screen.getByText('5,000')).toBeInTheDocument()
          expect(screen.getByText('250,000')).toBeInTheDocument()
        }, { timeout: 300 })
      })

      expect(animationTime).toBeLessThan(250) // Animation should complete within expected time
    })

    it('handles hover animations efficiently', async () => {
      const timer = new PerformanceTimer()
      const user = userEvent.setup()
      
      render(
        <ServiceCard
          icon="📋"
          title="Test Service"
          description="Test description"
          href="/test"
          colorScheme="service-purple"
          animated={true}
        />
      )

      const card = screen.getByRole('article')
      
      const hoverTime = await timer.measureAsync('hover-animation', async () => {
        await user.hover(card)
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
        })
      })

      expect(hoverTime).toBeLessThan(150) // Hover animation should be smooth
    })
  })

  describe('Large Dataset Performance', () => {
    it('handles large service card grids efficiently', () => {
      const timer = new PerformanceTimer()
      const memoryMonitor = new MemoryMonitor()
      
      // Create 50 service cards
      const services = Array.from({ length: 50 }, (_, i) => ({
        icon: '📋',
        title: `Service ${i + 1}`,
        description: `Description for service ${i + 1}`,
        href: `/service-${i + 1}`,
        stats: { count: (i + 1) * 10, label: 'items' },
        colorScheme: ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo'][i % 6] as const,
      }))

      memoryMonitor.recordMeasurement()

      const renderTime = timer.measure('large-grid-render', () => {
        render(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        )
      })

      memoryMonitor.recordMeasurement()

      expect(renderTime).toBeLessThan(500) // Should render 50 cards in reasonable time
      expect(memoryMonitor.getMemoryIncrease()).toBeLessThan(20) // Should not use excessive memory
      expect(screen.getAllByRole('article')).toHaveLength(50)
    })

    it('handles large metrics datasets efficiently', () => {
      const timer = new PerformanceTimer()
      
      // Create 20 metrics
      const metrics = Array.from({ length: 20 }, (_, i) => ({
        id: `metric-${i}`,
        title: `Metric ${i + 1}`,
        value: (i + 1) * 1000,
        icon: '📊',
        color: ['primary', 'secondary', 'success', 'info', 'warning'][i % 5] as const,
      }))

      const renderTime = timer.measure('large-metrics-render', () => {
        render(<MetricsGrid metrics={metrics} />)
      })

      expect(renderTime).toBeLessThan(300) // Should render 20 metrics efficiently
      expect(screen.getAllByRole('article')).toHaveLength(20)
    })
  })

  describe('Performance Budget Compliance', () => {
    it('meets rendering performance budget', () => {
      const timer = new PerformanceTimer()
      
      const renderTime = timer.measure('budget-test-render', () => {
        render(
          <ThemeProvider defaultTheme="light">
            <div>
              <HeroSection />
              <MetricsGrid metrics={[]} />
              <WhyChooseSection />
            </div>
          </ThemeProvider>
        )
      })

      // Should meet our performance budget for component rendering
      expect(renderTime).toBeLessThan(150) // Custom budget for component rendering
    })

    it('meets memory usage budget', () => {
      const memoryMonitor = new MemoryMonitor()
      
      memoryMonitor.recordMeasurement()

      render(
        <ThemeProvider defaultTheme="light">
          <div>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
            <DepartmentShowcase />
            <FAQPreview />
          </div>
        </ThemeProvider>
      )

      memoryMonitor.recordMeasurement()

      const memoryUsage = memoryMonitor.getMemoryUsage()
      expect(memoryUsage.increase).toBeLessThan(PERFORMANCE_BUDGET.heapSize) // Should meet memory budget
    })
  })
})
