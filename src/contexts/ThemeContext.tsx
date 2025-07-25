'use client'

/**
 * Theme Context Provider
 * 
 * Provides comprehensive theme management with:
 * - Dark/Light mode switching
 * - System preference detection
 * - localStorage persistence
 * - Smooth transitions
 * - CSS custom properties integration
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  /** Current theme setting (light, dark, or system) */
  theme: Theme
  /** Resolved theme (light or dark) based on system preference if theme is 'system' */
  resolvedTheme: ResolvedTheme
  /** Whether the theme is currently dark */
  isDark: boolean
  /** Whether the theme is currently light */
  isLight: boolean
  /** Whether system preference is dark */
  systemPrefersDark: boolean
  /** Set the theme */
  setTheme: (theme: Theme) => void
  /** Toggle between light and dark */
  toggleTheme: () => void
  /** Whether theme is loading */
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  /** Default theme if none is stored */
  defaultTheme?: Theme
  /** Enable smooth transitions */
  enableTransitions?: boolean
  /** Storage key for theme preference */
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableTransitions = true,
  storageKey = STORAGE_KEYS.THEME,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemPrefersDark, setSystemPrefersDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate resolved theme
  const resolvedTheme: ResolvedTheme = theme === 'system' 
    ? (systemPrefersDark ? 'dark' : 'light')
    : theme as ResolvedTheme

  const isDark = resolvedTheme === 'dark'
  const isLight = resolvedTheme === 'light'

  // Update system preference detection
  const updateSystemPreference = useCallback(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setSystemPrefersDark(mediaQuery.matches)
      return mediaQuery
    }
    return null
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((newResolvedTheme: ResolvedTheme) => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    root.removeAttribute('data-theme')
    
    // Add new theme
    root.classList.add(newResolvedTheme)
    root.setAttribute('data-theme', newResolvedTheme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        newResolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff'
      )
    }
  }, [])

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (error) {
        console.warn('Failed to save theme preference:', error)
      }
    }
  }, [storageKey])

  // Toggle between light and dark (ignores system)
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }, [resolvedTheme, setTheme])

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Update system preference
    const mediaQuery = updateSystemPreference()
    
    // Load saved theme or use default
    let savedTheme = defaultTheme
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        savedTheme = stored as Theme
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error)
    }

    setThemeState(savedTheme)
    setIsLoading(false)

    // Listen for system preference changes
    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches)
    }

    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleSystemChange)
      return () => mediaQuery.removeEventListener('change', handleSystemChange)
    }
  }, [defaultTheme, storageKey, updateSystemPreference])

  // Apply theme when resolved theme changes
  useEffect(() => {
    if (!isLoading) {
      applyTheme(resolvedTheme)
    }
  }, [resolvedTheme, isLoading, applyTheme])

  // Add transition classes for smooth theme switching
  useEffect(() => {
    if (!enableTransitions || typeof window === 'undefined') return

    const root = document.documentElement
    
    // Add transition classes
    root.style.setProperty('--theme-transition-duration', '300ms')
    root.style.setProperty('--theme-transition-timing', 'cubic-bezier(0.4, 0, 0.2, 1)')
    
    // Apply transitions to common elements
    const transitionStyle = document.createElement('style')
    transitionStyle.id = 'theme-transitions'
    transitionStyle.textContent = `
      * {
        transition: 
          background-color var(--theme-transition-duration) var(--theme-transition-timing),
          border-color var(--theme-transition-duration) var(--theme-transition-timing),
          color var(--theme-transition-duration) var(--theme-transition-timing),
          box-shadow var(--theme-transition-duration) var(--theme-transition-timing) !important;
      }
      
      /* Disable transitions for reduced motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          transition: none !important;
        }
      }
    `
    
    document.head.appendChild(transitionStyle)
    
    return () => {
      const existingStyle = document.getElementById('theme-transitions')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [enableTransitions])

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    isDark,
    isLight,
    systemPrefersDark,
    setTheme,
    toggleTheme,
    isLoading,
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

/**
 * Hook for theme-aware styling
 */
export function useThemeStyles() {
  const { isDark, isLight, resolvedTheme } = useTheme()
  
  return {
    isDark,
    isLight,
    resolvedTheme,
    // Helper functions for conditional styling
    themeClass: (lightClass: string, darkClass: string) => 
      isDark ? darkClass : lightClass,
    themeValue: <T>(lightValue: T, darkValue: T) => 
      isDark ? darkValue : lightValue,
  }
}

export default ThemeContext
