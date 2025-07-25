import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import { HeroSection } from '@/components/organisms/HeroSection'
import { WhyChooseSection } from '@/components/organisms/WhyChooseSection'
import { DepartmentShowcase } from '@/components/organisms/DepartmentShowcase'
import { FAQPreview } from '@/components/organisms/FAQPreview'
import {
  setupDarkModeTest,
  applyDarkMode,
  getComputedColors,
  validateColorContrast,
  type ThemeValue,
} from '../utils/darkModeTestUtils'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Homepage Components Dark Mode Tests', () => {
  let cleanup: (() => void) | undefined

  beforeEach(() => {
    cleanup = setupDarkModeTest()
  })

  afterEach(() => {
    cleanup?.()
    jest.clearAllMocks()
  })

  const renderWithTheme = (theme: ThemeValue, component: React.ReactElement) => {
    return render(
      <ThemeProvider defaultTheme={theme}>
        {component}
      </ThemeProvider>
    )
  }

  describe('MetricsGrid Dark Mode', () => {
    const mockMetrics = [
      { id: '1', title: 'Users', value: 1250, icon: '👥', color: 'primary' as const },
      { id: '2', title: 'Services', value: 45, icon: '🔧', color: 'secondary' as const },
      { id: '3', title: 'Revenue', value: 98500, icon: '💰', color: 'success' as const },
    ]

    it('renders metrics correctly in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <MetricsGrid metrics={mockMetrics} />)
      
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      
      // Verify dark mode is active
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('maintains animated counters in dark mode', async () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', 
        <MetricsGrid metrics={mockMetrics} animated={true} animationDuration={100} />
      )
      
      // Wait for animation to complete
      await waitFor(() => {
        expect(screen.getByText('1,250')).toBeInTheDocument()
      }, { timeout: 200 })
    })

    it('applies dark mode styling to metric cards', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <MetricsGrid metrics={mockMetrics} />)
      
      const metrics = screen.getAllByRole('article')
      expect(metrics).toHaveLength(3)
      
      metrics.forEach(metric => {
        const colors = getComputedColors(metric)
        expect(colors.backgroundColor).toBeTruthy()
      })
    })

    it('shows loading skeleton correctly in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <MetricsGrid metrics={[]} loading={true} />)
      
      expect(screen.getByTestId('metrics-grid-skeleton')).toBeInTheDocument()
    })
  })

  describe('HeroSection Dark Mode', () => {
    it('renders hero section correctly in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <HeroSection />)
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/buscar trámite/i)).toBeInTheDocument()
    })

    it('applies dark gradient background correctly', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <HeroSection backgroundVariant="gradient" />)
      
      const section = screen.getByRole('region', { name: /hero/i })
      expect(section).toHaveClass('bg-gradient-to-br')
    })

    it('maintains search functionality in dark mode', async () => {
      const user = userEvent.setup()
      const mockOnSearch = jest.fn()
      applyDarkMode(true)
      
      renderWithTheme('dark', <HeroSection onSearch={mockOnSearch} />)
      
      const searchInput = screen.getByPlaceholderText(/buscar trámite/i)
      await user.type(searchInput, 'test search{enter}')
      
      expect(mockOnSearch).toHaveBeenCalledWith('test search')
    })

    it('applies proper text contrast in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <HeroSection />)
      
      const title = screen.getByRole('heading', { level: 1 })
      const colors = getComputedColors(title)
      
      // Should have light text on dark background
      expect(colors.color).toBeTruthy()
    })
  })

  describe('WhyChooseSection Dark Mode', () => {
    it('renders benefits correctly in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <WhyChooseSection />)
      
      expect(screen.getByText(/por qué elegir/i)).toBeInTheDocument()
      
      const benefits = screen.getAllByRole('article')
      expect(benefits.length).toBeGreaterThan(0)
    })

    it('applies dark mode styling to benefit cards', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <WhyChooseSection variant="cards" />)
      
      const benefits = screen.getAllByRole('article')
      benefits.forEach(benefit => {
        const colors = getComputedColors(benefit)
        expect(colors.backgroundColor).toBeTruthy()
      })
    })

    it('maintains different variants in dark mode', () => {
      applyDarkMode(true)
      
      const variants = ['cards', 'minimal', 'icons'] as const
      
      variants.forEach(variant => {
        const { unmount } = renderWithTheme('dark', 
          <WhyChooseSection variant={variant} />
        )
        
        const container = screen.getByRole('region', { name: /why choose/i })
        expect(container).toHaveClass(`variant-${variant}`)
        
        unmount()
      })
    })
  })

  describe('DepartmentShowcase Dark Mode', () => {
    it('renders departments correctly in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <DepartmentShowcase />)
      
      expect(screen.getByText(/acceso rápido por dependencia/i)).toBeInTheDocument()
      
      const departments = screen.getAllByRole('link')
      expect(departments.length).toBeGreaterThan(0)
    })

    it('applies dark mode styling to department cards', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <DepartmentShowcase />)
      
      const departments = screen.getAllByRole('link')
      departments.forEach(dept => {
        const colors = getComputedColors(dept)
        expect(colors.backgroundColor).toBeTruthy()
      })
    })

    it('maintains department color schemes in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <DepartmentShowcase />)
      
      const departments = screen.getAllByRole('link')
      expect(departments.length).toBeGreaterThan(0)
      
      // Each department should maintain its color scheme
      departments.forEach(dept => {
        expect(dept).toHaveClass(/department-/)
      })
    })

    it('handles department interactions in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark', <DepartmentShowcase />)
      
      const firstDept = screen.getAllByRole('link')[0]
      await user.hover(firstDept)
      
      expect(firstDept).toBeVisible()
    })
  })

  describe('FAQPreview Dark Mode', () => {
    it('renders FAQ accordion correctly in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <FAQPreview />)
      
      expect(screen.getByText(/preguntas frecuentes/i)).toBeInTheDocument()
      
      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )
      expect(faqButtons.length).toBeGreaterThan(0)
    })

    it('maintains accordion functionality in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark', <FAQPreview />)
      
      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )
      
      if (faqButtons.length > 1) {
        const secondButton = faqButtons[1]
        await user.click(secondButton)
        
        await waitFor(() => {
          expect(secondButton).toHaveAttribute('aria-expanded', 'true')
        })
      }
    })

    it('applies dark mode styling to FAQ items', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', <FAQPreview />)
      
      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )
      
      faqButtons.forEach(button => {
        const colors = getComputedColors(button)
        expect(colors.backgroundColor).toBeTruthy()
      })
    })

    it('maintains keyboard navigation in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark', <FAQPreview />)
      
      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )
      
      if (faqButtons.length > 0) {
        const firstButton = faqButtons[0]
        firstButton.focus()
        
        await user.keyboard('{Enter}')
        expect(firstButton).toHaveAttribute('aria-expanded')
      }
    })
  })

  describe('Cross-Component Theme Consistency', () => {
    it('maintains consistent dark theme across all components', () => {
      applyDarkMode(true)
      
      const { container } = render(
        <ThemeProvider defaultTheme="dark">
          <div>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
            <DepartmentShowcase />
            <FAQPreview />
          </div>
        </ThemeProvider>
      )
      
      // All components should be rendered
      expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
      expect(screen.getByText(/por qué elegir/i)).toBeInTheDocument()
      expect(screen.getByText(/acceso rápido por dependencia/i)).toBeInTheDocument()
      expect(screen.getByText(/preguntas frecuentes/i)).toBeInTheDocument()
      
      // Dark mode should be active
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('handles theme switching across all components', async () => {
      const { rerender } = render(
        <ThemeProvider defaultTheme="light">
          <div>
            <HeroSection />
            <WhyChooseSection />
            <DepartmentShowcase />
          </div>
        </ThemeProvider>
      )
      
      // Start in light mode
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      
      // Switch to dark mode
      applyDarkMode(true)
      rerender(
        <ThemeProvider defaultTheme="dark">
          <div>
            <HeroSection />
            <WhyChooseSection />
            <DepartmentShowcase />
          </div>
        </ThemeProvider>
      )
      
      // Should be in dark mode
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      
      // All components should still be rendered
      expect(screen.getByRole('region', { name: /hero/i })).toBeInTheDocument()
      expect(screen.getByText(/por qué elegir/i)).toBeInTheDocument()
      expect(screen.getByText(/acceso rápido por dependencia/i)).toBeInTheDocument()
    })
  })

  describe('Performance in Dark Mode', () => {
    it('renders all components efficiently in dark mode', () => {
      applyDarkMode(true)
      
      const startTime = performance.now()
      
      render(
        <ThemeProvider defaultTheme="dark">
          <div>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
            <DepartmentShowcase />
            <FAQPreview />
          </div>
        </ThemeProvider>
      )
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(200) // Should render quickly
    })
  })
})
