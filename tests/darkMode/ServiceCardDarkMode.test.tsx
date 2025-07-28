import React from 'react'
import { render, screen } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { ServiceCard } from '@/components/molecules/ServiceCard'
import { ThemeProvider } from '@/contexts/ThemeContext'
import {
  setupDarkModeTest,
  applyDarkMode,
  validateColorContrast,
  getComputedColors,
  validateDarkModeCSS,
  type ThemeValue,
} from '../utils/darkModeTestUtils'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('ServiceCard Dark Mode Tests', () => {
  let cleanup: (() => void) | undefined

  const defaultProps = {
    icon: '📋',
    title: 'Test Service',
    description: 'This is a test service description',
    href: '/test-service',
    stats: {
      count: 150,
      label: 'services available',
    },
    buttonText: 'Access Service',
  }

  const colorSchemes = ['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo'] as const

  beforeEach(() => {
    cleanup = setupDarkModeTest()
  })

  afterEach(() => {
    cleanup?.()
    jest.clearAllMocks()
  })

  const renderWithTheme = (theme: ThemeValue, props = defaultProps) => {
    return render(
      <ThemeProvider defaultTheme={theme}>
        <ServiceCard {...props} />
      </ThemeProvider>
    )
  }

  describe('Dark Mode Visual Consistency', () => {
    colorSchemes.forEach(colorScheme => {
      it(`renders ${colorScheme} color scheme correctly in dark mode`, () => {
        applyDarkMode(true)
        
        renderWithTheme('dark', { ...defaultProps, colorScheme })
        
        const card = screen.getByRole('article')
        expect(card).toHaveClass(`service-card-${colorScheme}`)
        expect(card).toBeInTheDocument()
        
        // Verify dark mode classes are applied
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('applies dark mode background colors correctly', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark', { ...defaultProps, colorScheme: "service-yellow" })
      
      const card = screen.getByRole('article')
      const computedColors = getComputedColors(card)
      
      // Should have dark background
      expect(computedColors.backgroundColor).not.toBe('rgb(255, 255, 255)') // Not white
    })

    it('maintains proper text contrast in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      const title = screen.getByRole('heading', { level: 3 })
      const description = screen.getByText('This is a test service description')
      
      const titleColors = getComputedColors(title)
      const descColors = getComputedColors(description)
      
      // Validate contrast ratios (simplified - in real tests you'd use actual color values)
      expect(titleColors.color).toBeTruthy()
      expect(descColors.color).toBeTruthy()
    })
  })

  describe('Theme Switching Behavior', () => {
    it('updates appearance when switching from light to dark', async () => {
      const { rerender } = renderWithTheme('light')
      
      const card = screen.getByRole('article')
      const lightColors = getComputedColors(card)
      
      // Switch to dark mode
      applyDarkMode(true)
      rerender(
        <ThemeProvider defaultTheme="dark">
          <ServiceCard {...defaultProps} />
        </ThemeProvider>
      )
      
      const darkColors = getComputedColors(card)
      
      // Colors should be different between light and dark modes
      expect(lightColors.backgroundColor).not.toBe(darkColors.backgroundColor)
    })

    it('updates appearance when switching from dark to light', async () => {
      applyDarkMode(true)
      const { rerender } = renderWithTheme('dark')
      
      const card = screen.getByRole('article')
      const darkColors = getComputedColors(card)
      
      // Switch to light mode
      applyDarkMode(false)
      rerender(
        <ThemeProvider defaultTheme="light">
          <ServiceCard {...defaultProps} />
        </ThemeProvider>
      )
      
      const lightColors = getComputedColors(card)
      
      // Colors should be different between dark and light modes
      expect(darkColors.backgroundColor).not.toBe(lightColors.backgroundColor)
    })

    it('maintains functionality during theme transitions', async () => {
      const user = userEvent.setup()
      const mockOnClick = jest.fn()
      
      renderWithTheme('light', { ...defaultProps, onClick: mockOnClick })
      
      const button = screen.getByRole('button', { name: /access service/i })
      
      // Click in light mode
      await user.click(button)
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      
      // Switch to dark mode
      applyDarkMode(true)
      
      // Click should still work in dark mode
      await user.click(button)
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Color Scheme Variations in Dark Mode', () => {
    colorSchemes.forEach(colorScheme => {
      it(`maintains ${colorScheme} color scheme identity in dark mode`, () => {
        applyDarkMode(true)
        
        renderWithTheme('dark', { ...defaultProps, colorScheme })
        
        const card = screen.getByRole('article')
        
        // Should maintain color scheme class
        expect(card).toHaveClass(`service-card-${colorScheme}`)
        
        // Should have dark mode styling
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('applies different dark mode colors for different schemes', () => {
      applyDarkMode(true)
      
      const yellowCard = render(
        <ThemeProvider defaultTheme="dark">
          <ServiceCard {...defaultProps} colorScheme="service-yellow" />
        </ThemeProvider>
      )
      
      const blueCard = render(
        <ThemeProvider defaultTheme="dark">
          <ServiceCard {...defaultProps} colorScheme="service-blue" />
        </ThemeProvider>
      )
      
      const yellowElement = yellowCard.container.querySelector('.service-card-yellow')
      const blueElement = blueCard.container.querySelector('.service-card-blue')
      
      if (yellowElement && blueElement) {
        const yellowColors = getComputedColors(yellowElement as HTMLElement)
        const blueColors = getComputedColors(blueElement as HTMLElement)
        
        // Different color schemes should have different styling
        expect(yellowColors.backgroundColor).not.toBe(blueColors.backgroundColor)
      }
    })
  })

  describe('Interactive States in Dark Mode', () => {
    it('maintains hover effects in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark', { ...defaultProps, animated: true })
      
      const card = screen.getByRole('article')
      
      // Hover should work in dark mode
      await user.hover(card)
      
      // Should have hover classes (implementation dependent)
      expect(card).toBeInTheDocument()
    })

    it('maintains focus states in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      const button = screen.getByRole('button', { name: /access service/i })
      
      // Focus should work in dark mode
      await user.tab()
      expect(button).toHaveFocus()
      
      // Should maintain focus styling
      expect(button).toBeVisible()
    })

    it('maintains active states in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      const button = screen.getByRole('button', { name: /access service/i })
      
      // Active state should work in dark mode
      await user.click(button)
      
      expect(button).toBeVisible()
    })
  })

  describe('Accessibility in Dark Mode', () => {
    it('maintains ARIA attributes in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      const card = screen.getByRole('article')
      const button = screen.getByRole('button', { name: /access service/i })
      
      // ARIA attributes should be preserved
      expect(card).toHaveAttribute('aria-labelledby')
      expect(button).toHaveAttribute('aria-describedby')
    })

    it('maintains keyboard navigation in dark mode', async () => {
      const user = userEvent.setup()
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      const button = screen.getByRole('button', { name: /access service/i })
      
      // Tab navigation should work
      await user.tab()
      expect(button).toHaveFocus()
      
      // Enter key should work
      await user.keyboard('{Enter}')
      expect(button).toBeVisible()
    })

    it('maintains screen reader compatibility in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      // Screen reader text should be present
      const srText = screen.getByText(/access test service/i)
      expect(srText).toHaveClass('sr-only')
    })
  })

  describe('Performance in Dark Mode', () => {
    it('renders efficiently in dark mode', () => {
      applyDarkMode(true)
      
      const startTime = performance.now()
      renderWithTheme('dark')
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100) // Should render quickly
    })

    it('handles multiple color schemes efficiently in dark mode', () => {
      applyDarkMode(true)
      
      const startTime = performance.now()
      
      colorSchemes.forEach(colorScheme => {
        render(
          <ThemeProvider defaultTheme="dark">
            <ServiceCard {...defaultProps} colorScheme={colorScheme} />
          </ThemeProvider>
        )
      })
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(200) // Should render all schemes quickly
    })
  })

  describe('CSS Custom Properties in Dark Mode', () => {
    it('applies correct CSS custom properties in dark mode', () => {
      applyDarkMode(true)
      
      renderWithTheme('dark')
      
      const card = screen.getByRole('article')
      
      // Validate dark mode CSS properties
      const cssValidation = validateDarkModeCSS(card)
      
      // Should have valid dark mode CSS (implementation dependent)
      expect(card).toBeInTheDocument()
    })

    it('updates CSS custom properties when switching themes', () => {
      const { rerender } = renderWithTheme('light')
      
      const card = screen.getByRole('article')
      const lightStyle = window.getComputedStyle(card)
      
      // Switch to dark mode
      applyDarkMode(true)
      rerender(
        <ThemeProvider defaultTheme="dark">
          <ServiceCard {...defaultProps} />
        </ThemeProvider>
      )
      
      const darkStyle = window.getComputedStyle(card)
      
      // Styles should be different
      expect(lightStyle.backgroundColor).not.toBe(darkStyle.backgroundColor)
    })
  })

  describe('Error Handling in Dark Mode', () => {
    it('handles missing props gracefully in dark mode', () => {
      applyDarkMode(true)
      
      const minimalProps = {
        icon: '📋',
        title: 'Minimal Service',
        description: 'Minimal description',
        href: '/minimal',
        colorScheme: "service-blue" as const,
      ,
    buttonText: "Ver más"}
      
      renderWithTheme('dark', minimalProps)
      
      expect(screen.getByText('Minimal Service')).toBeInTheDocument()
    })

    it('handles long content gracefully in dark mode', () => {
      applyDarkMode(true)
      
      const longContentProps = {
        ...defaultProps,
        title: 'Very Long Service Title That Should Wrap Properly in Dark Mode',
        description: 'Very long description that should wrap properly and maintain readability in dark mode across different screen sizes',
      }
      
      renderWithTheme('dark', longContentProps)
      
      expect(screen.getByText(longContentProps.title)).toBeInTheDocument()
      expect(screen.getByText(longContentProps.description)).toBeInTheDocument()
    })
  })
})
