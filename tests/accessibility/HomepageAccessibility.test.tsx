import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  validateColorContrast,
  validateTouchTargets,
  validateAriaAttributes,
  validateHeadingHierarchy,
  validateFormAccessibility,
  validateKeyboardNavigation,
  validateImageAccessibility,
  WCAG_REQUIREMENTS,
} from '../utils/accessibilityTestUtils'

// Import homepage components
import { ServiceCard } from '@/components/molecules/ServiceCard'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import { HeroSection } from '@/components/organisms/HeroSection'
import { WhyChooseSection } from '@/components/organisms/WhyChooseSection'
import { DepartmentShowcase } from '@/components/organisms/DepartmentShowcase'
import { FAQPreview } from '@/components/organisms/FAQPreview'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Homepage Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Automated Accessibility Testing (axe-core)', () => {
    it('has no accessibility violations in ServiceCard', async () => {
      const { container } = render(
        <ServiceCard
          icon="📋"
          title="Certificado de Residencia"
          description="Solicita tu certificado de residencia de manera digital"
          href="/certificados/residencia"
          stats={{ count: 1250, label: 'certificados emitidos' }}
          colorScheme="service-yellow"
        />
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations in MetricsGrid', async () => {
      const metrics = [
        { id: '1', title: 'Usuarios', value: 1250, icon: '👥', color: 'primary' as const },
        { id: '2', title: 'Servicios', value: 45, icon: '🔧', color: 'secondary' as const },
        { id: '3', title: 'Ingresos', value: 98500, icon: '💰', color: 'success' as const },
      ]

      const { container } = render(<MetricsGrid metrics={metrics} />)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations in HeroSection', async () => {
      const { container } = render(<HeroSection />)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations in WhyChooseSection', async () => {
      const { container } = render(<WhyChooseSection />)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations in DepartmentShowcase', async () => {
      const { container } = render(<DepartmentShowcase />)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations in FAQPreview', async () => {
      const { container } = render(<FAQPreview />)

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no accessibility violations in complete homepage', async () => {
      const { container } = render(
        <ThemeProvider defaultTheme="light">
          <main>
            <HeroSection />
            <MetricsGrid metrics={[]} />
            <WhyChooseSection />
            <DepartmentShowcase />
            <FAQPreview />
          </main>
        </ThemeProvider>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Color Contrast Compliance', () => {
    it('meets WCAG AA color contrast requirements in light mode', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <div>
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

      const title = screen.getByText('Test Service')
      const description = screen.getByText('Test description')

      // Get computed styles
      const titleStyles = window.getComputedStyle(title)
      const descStyles = window.getComputedStyle(description)

      // Validate contrast (simplified - in real implementation, you'd get actual background colors)
      const titleContrast = validateColorContrast(
        titleStyles.color,
        titleStyles.backgroundColor || '#ffffff',
        18,
        true
      )

      const descContrast = validateColorContrast(
        descStyles.color,
        descStyles.backgroundColor || '#ffffff',
        16,
        false
      )

      expect(titleContrast.isCompliant).toBe(true)
      expect(titleContrast.level).toMatch(/AA|AAA/)
      expect(descContrast.isCompliant).toBe(true)
      expect(descContrast.level).toMatch(/AA|AAA/)
    })

    it('meets WCAG AA color contrast requirements in dark mode', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <div className="dark">
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

      const title = screen.getByText('Test Service')
      const description = screen.getByText('Test description')

      // Get computed styles
      const titleStyles = window.getComputedStyle(title)
      const descStyles = window.getComputedStyle(description)

      // Validate contrast for dark mode
      const titleContrast = validateColorContrast(
        titleStyles.color,
        titleStyles.backgroundColor || '#0f172a',
        18,
        true
      )

      const descContrast = validateColorContrast(
        descStyles.color,
        descStyles.backgroundColor || '#0f172a',
        16,
        false
      )

      expect(titleContrast.isCompliant).toBe(true)
      expect(descContrast.isCompliant).toBe(true)
    })

    it('validates contrast across all service card color schemes', () => {
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

        const title = screen.getByText(`${colorScheme} Service`)
        const titleStyles = window.getComputedStyle(title)

        const contrast = validateColorContrast(
          titleStyles.color,
          titleStyles.backgroundColor || '#ffffff',
          18,
          true
        )

        expect(contrast.isCompliant).toBe(true)
        unmount()
      })
    })
  })

  describe('Touch Target Compliance', () => {
    it('meets WCAG 2.1 touch target requirements', () => {
      const { container } = render(
        <div>
          <ServiceCard
            icon="📋"
            title="Test Service"
            description="Test description"
            href="/test"
            colorScheme="service-blue"
          />
          <FAQPreview />
        </div>
      )

      const touchValidation = validateTouchTargets(container)

      expect(touchValidation.isCompliant).toBe(true)
      
      if (touchValidation.violations.length > 0) {
        console.warn('Touch target violations:', touchValidation.violations)
        touchValidation.violations.forEach(violation => {
          expect(violation.size.width).toBeGreaterThanOrEqual(WCAG_REQUIREMENTS.touchTargets.minimum)
          expect(violation.size.height).toBeGreaterThanOrEqual(WCAG_REQUIREMENTS.touchTargets.minimum)
        })
      }
    })

    it('has comfortable touch targets on mobile', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(
        <div>
          <ServiceCard
            icon="📋"
            title="Mobile Service"
            description="Mobile description"
            href="/mobile"
            colorScheme="service-green"
          />
        </div>
      )

      const buttons = container.querySelectorAll('button, a[href]')
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect()
        expect(rect.height).toBeGreaterThanOrEqual(WCAG_REQUIREMENTS.touchTargets.comfortable)
      })
    })
  })

  describe('ARIA Attributes Validation', () => {
    it('has valid ARIA attributes', () => {
      const { container } = render(
        <div>
          <HeroSection />
          <WhyChooseSection />
          <DepartmentShowcase />
          <FAQPreview />
        </div>
      )

      const ariaValidation = validateAriaAttributes(container)

      expect(ariaValidation.isValid).toBe(true)
      
      if (ariaValidation.violations.length > 0) {
        console.warn('ARIA violations:', ariaValidation.violations)
        
        // Only fail on errors, not warnings
        const errors = ariaValidation.violations.filter(v => v.severity === 'error')
        expect(errors).toHaveLength(0)
      }
    })

    it('has proper ARIA labels for interactive elements', () => {
      render(<FAQPreview />)

      // Check FAQ accordion buttons
      const faqButtons = screen.getAllByRole('button').filter(btn => 
        btn.getAttribute('aria-expanded') !== null
      )

      faqButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-expanded')
        expect(button).toHaveAttribute('aria-controls')
        
        // Should have accessible name
        const accessibleName = button.getAttribute('aria-label') || 
                              button.getAttribute('aria-labelledby') ||
                              button.textContent
        expect(accessibleName).toBeTruthy()
      })
    })

    it('has proper landmark roles', () => {
      render(
        <main>
          <HeroSection />
          <WhyChooseSection />
          <DepartmentShowcase />
        </main>
      )

      // Check for main landmark
      expect(screen.getByRole('main')).toBeInTheDocument()

      // Check for navigation landmarks (if any)
      const navigation = screen.queryAllByRole('navigation')
      navigation.forEach(nav => {
        const accessibleName = nav.getAttribute('aria-label') || 
                              nav.getAttribute('aria-labelledby')
        expect(accessibleName).toBeTruthy()
      })
    })
  })

  describe('Heading Hierarchy', () => {
    it('has proper heading hierarchy', () => {
      const { container } = render(
        <div>
          <HeroSection />
          <WhyChooseSection />
          <DepartmentShowcase />
          <FAQPreview />
        </div>
      )

      const headingValidation = validateHeadingHierarchy(container)

      expect(headingValidation.isValid).toBe(true)
      
      if (headingValidation.violations.length > 0) {
        console.warn('Heading hierarchy violations:', headingValidation.violations)
        headingValidation.violations.forEach(violation => {
          console.warn(`${violation.element}: ${violation.issue}`)
        })
      }
    })

    it('has descriptive heading content', () => {
      render(
        <div>
          <HeroSection />
          <WhyChooseSection />
          <DepartmentShowcase />
        </div>
      )

      const headings = screen.getAllByRole('heading')
      
      headings.forEach(heading => {
        expect(heading.textContent?.trim()).toBeTruthy()
        expect(heading.textContent?.trim().length).toBeGreaterThan(3)
      })
    })
  })

  describe('Form Accessibility', () => {
    it('has accessible form controls in search', () => {
      const { container } = render(<HeroSection enableSearch={true} />)

      const formValidation = validateFormAccessibility(container)

      expect(formValidation.isValid).toBe(true)
      
      if (formValidation.violations.length > 0) {
        console.warn('Form accessibility violations:', formValidation.violations)
        
        // Only fail on errors
        const errors = formValidation.violations.filter(v => v.severity === 'error')
        expect(errors).toHaveLength(0)
      }
    })

    it('has proper labels for search input', () => {
      render(<HeroSection enableSearch={true} />)

      const searchInput = screen.getByPlaceholderText(/buscar trámite/i)
      
      // Should have accessible label
      const hasLabel = searchInput.getAttribute('aria-label') ||
                      searchInput.getAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${searchInput.id}"]`)
      
      expect(hasLabel).toBeTruthy()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      const { container } = render(
        <div>
          <ServiceCard
            icon="📋"
            title="Keyboard Test"
            description="Test description"
            href="/test"
            colorScheme="service-blue"
          />
          <FAQPreview />
        </div>
      )

      const keyboardValidation = validateKeyboardNavigation(container)

      expect(keyboardValidation.isValid).toBe(true)
      
      if (keyboardValidation.violations.length > 0) {
        console.warn('Keyboard navigation violations:', keyboardValidation.violations)
      }
    })

    it('has proper tab order', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <HeroSection enableSearch={true} />
          <ServiceCard
            icon="📋"
            title="Tab Test"
            description="Test description"
            href="/test"
            colorScheme="service-blue"
          />
        </div>
      )

      // Test tab navigation
      await user.tab()
      
      const focusedElement = document.activeElement
      expect(focusedElement).toBeVisible()
      expect(focusedElement?.tagName).toMatch(/INPUT|BUTTON|A/)
    })

    it('supports Enter and Space key activation', async () => {
      const user = userEvent.setup()
      const mockOnClick = jest.fn()
      
      render(
        <ServiceCard
          icon="📋"
          title="Keyboard Activation"
          description="Test description"
          href="/test"
          colorScheme="service-blue"
          onClick={mockOnClick}
        />
      )

      const button = screen.getByRole('button')
      button.focus()
      
      // Test Enter key
      await user.keyboard('{Enter}')
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      
      // Test Space key
      await user.keyboard(' ')
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Image Accessibility', () => {
    it('has accessible images', () => {
      const { container } = render(
        <div>
          <HeroSection />
          <DepartmentShowcase />
        </div>
      )

      const imageValidation = validateImageAccessibility(container)

      expect(imageValidation.isValid).toBe(true)
      
      if (imageValidation.violations.length > 0) {
        console.warn('Image accessibility violations:', imageValidation.violations)
        
        // Only fail on errors
        const errors = imageValidation.violations.filter(v => v.severity === 'error')
        expect(errors).toHaveLength(0)
      }
    })

    it('has proper alt text for informative images', () => {
      render(<DepartmentShowcase />)

      const images = screen.getAllByRole('img')
      
      images.forEach(img => {
        const alt = img.getAttribute('alt')
        const ariaLabel = img.getAttribute('aria-label')
        const role = img.getAttribute('role')
        
        if (role !== 'presentation' && !img.hasAttribute('aria-hidden')) {
          expect(alt || ariaLabel).toBeTruthy()
          
          if (alt) {
            expect(alt.toLowerCase()).not.toContain('image')
            expect(alt.toLowerCase()).not.toContain('picture')
            expect(alt.toLowerCase()).not.toContain('photo')
          }
        }
      })
    })
  })

  describe('Focus Management', () => {
    it('has visible focus indicators', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <ServiceCard
            icon="📋"
            title="Focus Test"
            description="Test description"
            href="/test"
            colorScheme="service-blue"
          />
        </div>
      )

      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
      
      // Check for focus styles (implementation dependent)
      const computedStyle = window.getComputedStyle(button)
      expect(computedStyle.outline).not.toBe('none')
    })

    it('manages focus during theme switching', async () => {
      const user = userEvent.setup()
      
      const TestComponent = () => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
        
        return (
          <ThemeProvider defaultTheme={theme}>
            <div>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle Theme
              </button>
              <ServiceCard
                icon="📋"
                title="Focus Test"
                description="Test description"
                href="/test"
                colorScheme="service-blue"
              />
            </div>
          </ThemeProvider>
        )
      }

      render(<TestComponent />)
      
      const toggleButton = screen.getByText('Toggle Theme')
      const serviceButton = screen.getByRole('button', { name: /access focus test/i })
      
      // Focus on service button
      serviceButton.focus()
      expect(serviceButton).toHaveFocus()
      
      // Switch theme
      await user.click(toggleButton)
      
      // Focus should be maintained or properly managed
      expect(document.activeElement).toBeVisible()
    })
  })
})
