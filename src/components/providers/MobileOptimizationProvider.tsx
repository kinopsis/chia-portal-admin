'use client'

/**
 * Mobile Optimization Provider
 * 
 * Provides mobile-specific optimizations and utilities:
 * - Initializes mobile optimizations on mount
 * - Provides mobile detection context
 * - Handles viewport changes
 * - Optimizes touch interactions
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeMobileOptimizations, isMobileDevice, isTouchDevice, getViewportCategory } from '@/utils/mobileOptimization'

interface MobileOptimizationContextType {
  isMobile: boolean
  isTouch: boolean
  viewportCategory: 'mobile' | 'tablet' | 'desktop'
  isInitialized: boolean
}

const MobileOptimizationContext = createContext<MobileOptimizationContextType | undefined>(undefined)

interface MobileOptimizationProviderProps {
  children: React.ReactNode
}

export function MobileOptimizationProvider({ children }: MobileOptimizationProviderProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [viewportCategory, setViewportCategory] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize mobile optimizations
    initializeMobileOptimizations()

    // Set initial values
    setIsMobile(isMobileDevice())
    setIsTouch(isTouchDevice())
    setViewportCategory(getViewportCategory())
    setIsInitialized(true)

    // Handle viewport changes
    const handleResize = () => {
      setViewportCategory(getViewportCategory())
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const value: MobileOptimizationContextType = {
    isMobile,
    isTouch,
    viewportCategory,
    isInitialized,
  }

  return (
    <MobileOptimizationContext.Provider value={value}>
      {children}
    </MobileOptimizationContext.Provider>
  )
}

/**
 * Hook to use mobile optimization context
 */
export function useMobileOptimization() {
  const context = useContext(MobileOptimizationContext)
  if (context === undefined) {
    throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider')
  }
  return context
}

export default MobileOptimizationProvider
