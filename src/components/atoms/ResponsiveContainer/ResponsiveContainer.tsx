/**
 * ResponsiveContainer Component
 * 
 * Provides responsive layout utilities with mobile-first approach
 * and touch-friendly interactions following WCAG 2.1 guidelines.
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch target optimization (44px minimum)
 * - CSS Grid and Flexbox layouts
 * - Accessibility-aware breakpoints
 */

'use client'

import React from 'react'
import { clsx } from 'clsx'

export interface ResponsiveContainerProps {
  /** Container content */
  children: React.ReactNode
  /** Layout type */
  layout?: 'flex' | 'grid' | 'stack'
  /** Responsive behavior */
  responsive?: 'mobile-first' | 'desktop-first' | 'adaptive'
  /** Touch optimization */
  touchOptimized?: boolean
  /** Grid columns configuration */
  gridCols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /** Gap between items */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Padding configuration */
  padding?: 'mobile' | 'desktop' | 'adaptive'
  /** Additional CSS classes */
  className?: string
  /** Container element type */
  as?: keyof JSX.IntrinsicElements
}

/**
 * ResponsiveContainer component for adaptive layouts
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  layout = 'flex',
  responsive = 'mobile-first',
  touchOptimized = true,
  gridCols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'md',
  padding = 'adaptive',
  className,
  as: Component = 'div',
}) => {
  // Generate grid column classes
  const getGridColsClasses = () => {
    if (layout !== 'grid') return ''
    
    const colsClasses = []
    if (gridCols.xs) colsClasses.push(`grid-cols-${gridCols.xs}`)
    if (gridCols.sm) colsClasses.push(`sm:grid-cols-${gridCols.sm}`)
    if (gridCols.md) colsClasses.push(`md:grid-cols-${gridCols.md}`)
    if (gridCols.lg) colsClasses.push(`lg:grid-cols-${gridCols.lg}`)
    if (gridCols.xl) colsClasses.push(`xl:grid-cols-${gridCols.xl}`)
    
    return colsClasses.join(' ')
  }

  // Generate gap classes
  const getGapClasses = () => {
    const gapMap = {
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    }
    return gapMap[gap]
  }

  // Generate padding classes
  const getPaddingClasses = () => {
    switch (padding) {
      case 'mobile':
        return 'p-mobile-sm sm:p-mobile-md'
      case 'desktop':
        return 'p-6 lg:p-8'
      case 'adaptive':
        return 'p-mobile-sm sm:p-mobile-md md:p-6 lg:p-8'
      default:
        return ''
    }
  }

  // Generate layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'flex':
        return clsx(
          'flex',
          responsive === 'mobile-first' 
            ? 'flex-col sm:flex-row' 
            : 'flex-row',
          'flex-wrap'
        )
      case 'grid':
        return clsx(
          'grid',
          getGridColsClasses(),
          'auto-rows-fr'
        )
      case 'stack':
        return 'flex flex-col'
      default:
        return ''
    }
  }

  // Touch optimization classes
  const getTouchClasses = () => {
    if (!touchOptimized) return ''
    
    return clsx(
      // Minimum touch target size - WCAG 2.1 SC 2.5.5
      '[&_button]:min-h-touch-sm [&_a]:min-h-touch-sm',
      '[&_button]:min-w-touch-sm [&_a]:min-w-touch-sm',
      
      // Touch-friendly spacing
      'touch:[&_button]:p-mobile-sm touch:[&_a]:p-mobile-sm',
      
      // Hover states only for non-touch devices
      'no-touch:[&_button:hover]:bg-gray-100',
      'no-touch:[&_a:hover]:bg-gray-100',
    )
  }

  return (
    <Component
      className={clsx(
        // Base responsive container
        'w-full',
        
        // Layout classes
        getLayoutClasses(),
        
        // Spacing classes
        getGapClasses(),
        getPaddingClasses(),
        
        // Touch optimization
        getTouchClasses(),
        
        // Accessibility improvements
        'focus-within:outline-none',
        
        // Reduced motion support
        'reduced-motion:transition-none',
        
        className
      )}
    >
      {children}
    </Component>
  )
}

export default ResponsiveContainer

/**
 * Preset configurations for common layouts
 */
export const ResponsivePresets = {
  // Card grid layout
  cardGrid: {
    layout: 'grid' as const,
    gridCols: { xs: 1, sm: 2, lg: 3, xl: 4 },
    gap: 'md' as const,
    padding: 'adaptive' as const,
    touchOptimized: true,
  },
  
  // Navigation layout
  navigation: {
    layout: 'flex' as const,
    responsive: 'mobile-first' as const,
    gap: 'sm' as const,
    padding: 'mobile' as const,
    touchOptimized: true,
  },
  
  // Form layout
  form: {
    layout: 'stack' as const,
    gap: 'lg' as const,
    padding: 'adaptive' as const,
    touchOptimized: true,
  },
  
  // Dashboard layout
  dashboard: {
    layout: 'grid' as const,
    gridCols: { xs: 1, md: 2, xl: 3 },
    gap: 'lg' as const,
    padding: 'adaptive' as const,
    touchOptimized: false,
  },
} as const

/**
 * Hook for responsive utilities
 */
export const useResponsive = () => {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  }
}
