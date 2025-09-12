'use client'

/**
 * Theme Context
 *
 * Manages theme state (light/dark mode) with:
 * - System preference detection
 * - Manual override capability
 * - Local storage persistence
 * - Accessibility considerations
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type ThemeValue = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeValue
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeValue) => void
  toggleTheme: () => void
  isSystemTheme: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeValue
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeValue>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as ThemeValue
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setThemeState(storedTheme)
      }
    } catch (error) {
      console.warn('Error reading theme from localStorage:', error)
    }
  }, [storageKey])

  // Resolve actual theme based on preference and system setting
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        setResolvedTheme(systemTheme)
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    // Listen for system theme changes when using system preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateResolvedTheme()

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement

    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.removeAttribute('data-theme')
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const themeColor = resolvedTheme === 'dark' ? '#0f172a' : '#ffffff'
      metaThemeColor.setAttribute('content', themeColor)
    }
  }, [resolvedTheme])

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme)
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error)
    }
  }, [theme, storageKey])

  const setTheme = (newTheme: ThemeValue) => {
    if (newTheme !== theme) {
      setThemeState(newTheme)
    }
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      // If currently on system, switch to opposite of system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'light'
        : 'dark'
      setTheme(systemTheme)
    } else {
      // Toggle between light and dark
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isSystemTheme: theme === 'system',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider
