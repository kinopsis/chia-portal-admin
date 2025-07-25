'use client'

/**
 * Accessibility Provider
 * 
 * Provides accessibility features and utilities:
 * - Initializes accessibility features
 * - Provides accessibility context
 * - Manages focus and keyboard navigation
 * - Handles screen reader announcements
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeAccessibility, screenReader, reducedMotion } from '@/utils/accessibilityUtils'

interface AccessibilityContextType {
  isInitialized: boolean
  prefersReducedMotion: boolean
  isKeyboardNavigation: boolean
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false)

  useEffect(() => {
    // Initialize accessibility features
    initializeAccessibility()
    setIsInitialized(true)

    // Set initial reduced motion preference
    setPrefersReducedMotion(reducedMotion.prefersReduced())

    // Monitor for changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    // Monitor keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardNavigation(true)
        document.body.classList.add('keyboard-navigation')
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardNavigation(false)
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReader.announce(message, priority)
  }

  const value: AccessibilityContextType = {
    isInitialized,
    prefersReducedMotion,
    isKeyboardNavigation,
    announce,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

export default AccessibilityProvider
