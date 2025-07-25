import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { jest } from '@jest/globals'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import {
  setupDarkModeTest,
  createThemeTestScenarios,
  mockMatchMedia,
  setStoredTheme,
  getStoredTheme,
  clearStoredTheme,
  simulateSystemThemeChange,
  waitForThemeTransition,
  type ThemeValue,
} from '../utils/darkModeTestUtils'

// Test component to access theme context
const TestComponent: React.FC = () => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme()
  
  return (
    <div data-testid="theme-test">
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-dark">{isDark.toString()}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>
        Set System
      </button>
    </div>
  )
}

describe('ThemeProvider Dark Mode Tests', () => {
  let cleanup: (() => void) | undefined

  beforeEach(() => {
    cleanup = setupDarkModeTest()
  })

  afterEach(() => {
    cleanup?.()
    jest.clearAllMocks()
  })

  describe('Theme Initialization', () => {
    it('initializes with default theme when no stored theme exists', () => {
      clearStoredTheme()
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
    })

    it('initializes with stored theme when available', () => {
      setStoredTheme('dark')
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
    })

    it('initializes with system theme and detects system preference', () => {
      setStoredTheme('system')
      mockMatchMedia(true) // System prefers dark
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
    })
  })

  describe('Theme Switching', () => {
    it('switches from light to dark theme', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
      
      await user.click(screen.getByTestId('set-dark'))
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
      })
    })

    it('switches from dark to light theme', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
      
      await user.click(screen.getByTestId('set-light'))
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
        expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
      })
    })

    it('toggles theme correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      // Start with light
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
      
      // Toggle to dark
      await user.click(screen.getByTestId('toggle-theme'))
      
      await waitFor(() => {
        expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
      })
      
      // Toggle back to light
      await user.click(screen.getByTestId('toggle-theme'))
      
      await waitFor(() => {
        expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
      })
    })

    it('switches to system theme and follows system preference', async () => {
      const user = userEvent.setup()
      mockMatchMedia(true) // System prefers dark
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      await user.click(screen.getByTestId('set-system'))
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
        expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
      })
    })
  })

  describe('Theme Persistence', () => {
    it('persists theme changes to localStorage', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      await user.click(screen.getByTestId('set-dark'))
      
      await waitFor(() => {
        expect(getStoredTheme()).toBe('dark')
      })
    })

    it('persists system theme preference', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      await user.click(screen.getByTestId('set-system'))
      
      await waitFor(() => {
        expect(getStoredTheme()).toBe('system')
      })
    })

    it('loads persisted theme on subsequent renders', () => {
      setStoredTheme('dark')
      
      const { unmount } = render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      
      unmount()
      
      // Re-render to simulate page reload
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })
  })

  describe('System Preference Detection', () => {
    it('detects system dark mode preference', () => {
      mockMatchMedia(true) // System prefers dark
      setStoredTheme('system')
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
    })

    it('detects system light mode preference', () => {
      mockMatchMedia(false) // System prefers light
      setStoredTheme('system')
      
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
    })

    it('responds to system preference changes', async () => {
      setStoredTheme('system')
      mockMatchMedia(false) // Start with light
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('is-dark')).toHaveTextContent('false')
      
      // Simulate system preference change to dark
      act(() => {
        simulateSystemThemeChange(true)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
      })
    })
  })

  describe('DOM Class Management', () => {
    it('adds dark class to document element in dark mode', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      
      await user.click(screen.getByTestId('set-dark'))
      
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('removes dark class from document element in light mode', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      
      await user.click(screen.getByTestId('set-light'))
      
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      })
    })

    it('manages dark class correctly with system theme', async () => {
      mockMatchMedia(true) // System prefers dark
      setStoredTheme('system')
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
      
      // Change system preference to light
      act(() => {
        simulateSystemThemeChange(false)
      })
      
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      })
    })
  })

  describe('Theme Transition Handling', () => {
    it('handles theme transitions smoothly', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light" enableTransitions={true}>
          <TestComponent />
        </ThemeProvider>
      )
      
      await user.click(screen.getByTestId('set-dark'))
      
      // Wait for transition to complete
      await waitForThemeTransition()
      
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
    })

    it('disables transitions when specified', async () => {
      const user = userEvent.setup()
      
      render(
        <ThemeProvider defaultTheme="light" enableTransitions={false}>
          <TestComponent />
        </ThemeProvider>
      )
      
      await user.click(screen.getByTestId('set-dark'))
      
      // Should change immediately without transition
      expect(screen.getByTestId('is-dark')).toHaveTextContent('true')
    })
  })

  describe('Error Handling', () => {
    it('handles invalid stored theme gracefully', () => {
      // Set invalid theme in localStorage
      localStorage.setItem('theme', 'invalid-theme')
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      // Should fall back to default theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })

    it('handles missing localStorage gracefully', () => {
      // Mock localStorage to throw error
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => { throw new Error('localStorage not available') }),
          setItem: jest.fn(() => { throw new Error('localStorage not available') }),
        },
        writable: true,
      })
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      )
      
      // Should still work with default theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      })
    })
  })

  describe('Multiple Theme Scenarios', () => {
    const scenarios = createThemeTestScenarios()
    
    scenarios.forEach(({ name, theme, systemPrefersDark, expectedDark }) => {
      it(`handles ${name}`, () => {
        mockMatchMedia(systemPrefersDark)
        setStoredTheme(theme)
        
        render(
          <ThemeProvider defaultTheme="light">
            <TestComponent />
          </ThemeProvider>
        )
        
        expect(screen.getByTestId('current-theme')).toHaveTextContent(theme)
        expect(screen.getByTestId('is-dark')).toHaveTextContent(expectedDark.toString())
        expect(document.documentElement.classList.contains('dark')).toBe(expectedDark)
      })
    })
  })
})
