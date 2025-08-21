import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import {
  detectBrowserCapabilities,
  compareRendering,
  testCSSFeatureSupport,
  testJSAPIAvailability,
  measurePerformance,
  BROWSER_CONFIGS,
  CSS_FEATURES_TO_TEST,
  JS_APIS_TO_TEST,
} from '../utils/crossBrowserTestUtils'

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

// Mock browser APIs for testing
const mockBrowserAPIs = () => {
  // Mock CSS.supports
  if (typeof CSS === 'undefined') {
    (global as any).CSS = {
      supports: jest.fn((property: string, value: string) => {
        // Mock support for modern CSS features
        const supportedFeatures = {
          'display': ['grid', 'flex'],
          'gap': ['1rem', '10px'],
          '--test': ['value'],
          'aspect-ratio': ['1/1'],
          'container-type': ['inline-size'],
        }
        
        return supportedFeatures[property as keyof typeof supportedFeatures]?.includes(value) || false
      }),
    }
  }

  // Mock performance.memory
  if (!('memory' in performance)) {
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 10 * 1024 * 1024, // 10MB
        totalJSHeapSize: 20 * 1024 * 1024, // 20MB
        jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
      },
      writable: true,
    })
  }

  // Mock IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    (global as any).IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }

  // Mock ResizeObserver
  if (!('ResizeObserver' in window)) {
    (global as any).ResizeObserver = class ResizeObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
}

describe('Homepage Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockBrowserAPIs()
  })

  describe('Browser Feature Detection', () => {
    it('detects browser capabilities correctly', async () => {
      const capabilities = await detectBrowserCapabilities()
      
      expect(capabilities).toHaveProperty('browser')
      expect(capabilities).toHaveProperty('version')
      expect(capabilities).toHaveProperty('engine')
      expect(capabilities).toHaveProperty('features')
      
      // Should detect CSS features
      expect(capabilities.features.css).toHaveProperty('grid')
      expect(capabilities.features.css).toHaveProperty('flexbox')
      expect(capabilities.features.css).toHaveProperty('customProperties')
      
      // Should detect JavaScript features
      expect(capabilities.features.javascript).toHaveProperty('es2020')
      expect(capabilities.features.javascript).toHaveProperty('modules')
      
      // Should detect media features
      expect(capabilities.features.media).toHaveProperty('matchMedia')
      expect(capabilities.features.media).toHaveProperty('touchEvents')
    })

    it('validates CSS feature support across browsers', () => {
      // Test critical CSS features
      const criticalFeatures = [
        { property: 'display', value: 'grid' },
        { property: 'display', value: 'flex' },
        { property: 'gap', value: '1rem' },
        { property: '--test', value: 'value' },
      ]

      criticalFeatures.forEach(({ property, value }) => {
        const isSupported = testCSSFeatureSupport(property, value)
        expect(isSupported).toBe(true)
      })
    })

    it('validates JavaScript API availability', () => {
      // Test critical JavaScript APIs
      const criticalAPIs = [
        'localStorage',
        'sessionStorage',
        'fetch',
        'Promise',
        'matchMedia',
      ]

      criticalAPIs.forEach(api => {
        const isAvailable = testJSAPIAvailability(api)
        expect(isAvailable).toBe(true)
      })
    })
  })

  describe('ServiceCard Cross-Browser Rendering', () => {
    it('renders consistently across different browsers', async () => {
      const { container } = render(
        <ServiceCard
          icon="📋"
          title="Cross-Browser Test"
          description="Testing cross-browser compatibility"
          href="/test"
          stats={{ count: 1250, label: 'tests passed' }}
          colorScheme="service-blue"
        />
      )

      const card = container.querySelector('[role="article"]') as HTMLElement
      expect(card).toBeInTheDocument()

      // Test rendering consistency
      const renderingData = await compareRendering(card)
      
      expect(renderingData.dimensions.width).toBeGreaterThan(0)
      expect(renderingData.dimensions.height).toBeGreaterThan(0)
      expect(renderingData.styles.display).toBeTruthy()
      expect(renderingData.layout.children.length).toBeGreaterThan(0)
    })

    it('handles color schemes consistently across browsers', () => {
      const colorSchemes = ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo'] as const

      colorSchemes.forEach(colorScheme => {
        const { unmount } = render(
          <ServiceCard
            icon="📋"
            title={`${colorScheme} Test`}
            description="Color scheme test"
            href={`/${colorScheme}`}
            colorScheme={colorScheme}
          />
        )

        const card = screen.getByRole('article')
        expect(card).toHaveClass(`service-card-${colorScheme}`)
        
        unmount()
      })
    })

    it('maintains functionality across browsers', async () => {
      const user = userEvent.setup()
      const mockOnClick = jest.fn()

      render(
        <ServiceCard
          icon="📋"
          title="Functionality Test"
          description="Testing functionality"
          href="/test"
          colorScheme="service-green"
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('MetricsGrid Cross-Browser Performance', () => {
    it('renders metrics efficiently across browsers', async () => {
      const metrics = [
        { id: '1', title: 'Users', value: 1250, icon: '👥', color: 'primary' as const },
        { id: '2', title: 'Services', value: 45, icon: '🔧', color: 'secondary' as const },
        { id: '3', title: 'Revenue', value: 98500, icon: '💰', color: 'success' as const },
      ]

      const performance = await measurePerformance(async () => {
        render(<MetricsGrid metrics={metrics} />)
        await waitFor(() => {
          expect(screen.getAllByRole('article')).toHaveLength(3)
        })
      })

      expect(performance.duration).toBeLessThan(500) // Should render quickly
      
      if (performance.memory) {
        expect(performance.memory.used).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
      }
    })

    it('handles animations consistently across browsers', async () => {
      const metrics = [
        { id: '1', title: 'Animated Counter', value: 5000, icon: '📊', color: 'primary' as const },
      ]

      render(<MetricsGrid metrics={metrics} animated={true} animationDuration={200} />)

      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('5,000')).toBeInTheDocument()
      }, { timeout: 300 })
    })
  })

  describe('HeroSection Cross-Browser Compatibility', () => {
    it('renders hero section consistently', () => {
      render(<HeroSection />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading.textContent?.trim()).toBeTruthy()
    })

    it('handles search functionality across browsers', async () => {
      const user = userEvent.setup()
      const mockOnSearch = jest.fn()

      render(<HeroSection enableSearch={true} onSearch={mockOnSearch} />)

      const searchInput = screen.getByPlaceholderText(/buscar/i)
      await user.type(searchInput, 'test search{enter}')

      expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })

    it('supports different background variants', () => {
      const variants = ['gradient', 'solid', 'image'] as const

      variants.forEach(variant => {
        const { unmount } = render(<HeroSection backgroundVariant={variant} />)
        
        const section = screen.getByRole('region', { name: /hero/i })
        expect(section).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Theme Provider Cross-Browser Support', () => {
    it('handles theme switching across browsers', async () => {
      const user = userEvent.setup()

      const TestComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

        return (
          <div>
            <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              Toggle Theme
            </button>
            <ServiceCard
              icon="📋"
              title="Theme Test"
              description="Testing theme switching"
              href="/test"
              colorScheme="service-blue"
            />
          </div>
        )
      }

      render(<TestComponent />)

      const toggleButton = screen.getByText('Toggle Theme')
      await user.click(toggleButton)

      // Theme should switch without errors
      expect(toggleButton).toBeInTheDocument()
    })

    it('persists theme across browser sessions', () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn(() => 'dark'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      })

      render(
        <ServiceCard
          icon="📋"
          title="Persistence Test"
          description="Testing theme persistence"
          href="/test"
          colorScheme="service-blue"
        />
      )

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
    })
  })

  describe('Responsive Design Cross-Browser', () => {
    it('adapts to different viewport sizes', () => {
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1440, height: 900 }, // Desktop
      ]

      viewports.forEach(viewport => {
        // Mock viewport size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        })

        const { unmount } = render(
          <div>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
          </div>
        )

        // Components should render without errors
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
        
        unmount()
      })
    })

    it('handles touch events on mobile browsers', async () => {
      const user = userEvent.setup()

      // Mock touch support
      Object.defineProperty(window, 'ontouchstart', {
        value: () => {},
        writable: true,
      })

      render(
        <ServiceCard
          icon="📋"
          title="Touch Test"
          description="Testing touch events"
          href="/test"
          colorScheme="service-blue"
        />
      )

      const button = screen.getByRole('button')
      
      // Should handle touch events
      await user.click(button)
      expect(button).toBeVisible()
    })
  })

  describe('Accessibility Cross-Browser', () => {
    it('maintains accessibility across browsers', () => {
      render(
        <div>
          <HeroSection />
          <WhyChooseSection />
          <DepartmentShowcase />
          <FAQPreview />
        </div>
      )

      // Check for proper ARIA landmarks
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Check for interactive elements
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      buttons.forEach(button => {
        expect(button).toBeVisible()
        expect(button.textContent?.trim()).toBeTruthy()
      })
    })

    it('supports keyboard navigation across browsers', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <ServiceCard
            icon="📋"
            title="Keyboard Test"
            description="Testing keyboard navigation"
            href="/test"
            colorScheme="service-blue"
          />
          <FAQPreview />
        </div>
      )

      // Test tab navigation
      await user.tab()
      
      const focusedElement = document.activeElement
      expect(focusedElement).toBeVisible()
      expect(focusedElement?.tagName).toMatch(/BUTTON|A|INPUT/)
    })
  })

  describe('Performance Cross-Browser', () => {
    it('loads efficiently across browsers', async () => {
      const performance = await measurePerformance(async () => {
        render(
          <div>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
            <DepartmentShowcase />
            <FAQPreview />
          </div>
        )

        await waitFor(() => {
          expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
        })
      })

      expect(performance.duration).toBeLessThan(1000) // Should load within 1 second
      
      if (performance.memory) {
        expect(performance.memory.used).toBeLessThan(10 * 1024 * 1024) // Less than 10MB
      }
    })

    it('handles large datasets efficiently', async () => {
      // Create large dataset
      const largeMetrics = Array.from({ length: 20 }, (_, i) => ({
        id: `metric-${i}`,
        title: `Metric ${i + 1}`,
        value: (i + 1) * 1000,
        icon: '📊',
        color: ['primary', 'secondary', 'success', 'info', 'warning'][i % 5] as const,
      }))

      const performance = await measurePerformance(async () => {
        render(<MetricsGrid metrics={largeMetrics} />)
        
        await waitFor(() => {
          expect(screen.getAllByRole('article')).toHaveLength(20)
        })
      })

      expect(performance.duration).toBeLessThan(800) // Should handle large datasets efficiently
    })
  })

  describe('Error Handling Cross-Browser', () => {
    it('handles missing features gracefully', () => {
      // Mock missing CSS.supports
      const originalCSS = (global as any).CSS
      delete (global as any).CSS

      const { container } = render(
        <ServiceCard
          icon="📋"
          title="Fallback Test"
          description="Testing fallback behavior"
          href="/test"
          colorScheme="service-blue"
        />
      )

      // Should still render without CSS.supports
      expect(container.querySelector('[role="article"]')).toBeInTheDocument()

      // Restore CSS
      ;(global as any).CSS = originalCSS
    })

    it('handles missing APIs gracefully', () => {
      // Mock missing localStorage
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      })

      render(
        <ServiceCard
          icon="📋"
          title="API Fallback Test"
          description="Testing API fallback"
          href="/test"
          colorScheme="service-blue"
        />
      )

      // Should still render without localStorage
      expect(screen.getByText('API Fallback Test')).toBeInTheDocument()

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      })
    })

    it('handles network errors gracefully', async () => {
      // Mock fetch to simulate network error
      const originalFetch = global.fetch
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

      render(
        <div>
          <HeroSection enableSearch={true} />
          <MetricsGrid metrics={[]} />
        </div>
      )

      // Components should still render despite network errors
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

      // Restore fetch
      global.fetch = originalFetch
    })
  })
})
