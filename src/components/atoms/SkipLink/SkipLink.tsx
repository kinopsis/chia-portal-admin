/**
 * SkipLink Component
 * 
 * Provides keyboard navigation accessibility by allowing users to skip
 * repetitive navigation and jump directly to main content.
 * 
 * WCAG 2.1 Compliance:
 * - Success Criterion 2.4.1 (Bypass Blocks)
 * - Technique G1: Adding a link at the top of each page
 */

'use client'

import React from 'react'
import { clsx } from 'clsx'

export interface SkipLinkProps {
  /** Target element ID to skip to */
  targetId: string
  /** Link text content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * SkipLink component for keyboard accessibility
 * 
 * Features:
 * - Hidden by default, visible on focus
 * - High contrast colors for visibility
 * - Positioned at top of page
 * - Smooth scroll to target
 */
const SkipLink: React.FC<SkipLinkProps> = ({ 
  targetId, 
  children, 
  className 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    
    if (target) {
      // Focus the target element for screen readers
      target.focus({ preventScroll: true })
      
      // Smooth scroll to target
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={clsx(
        // Base styles - hidden by default
        'absolute left-0 top-0 z-50',
        'px-4 py-2 m-2',
        'text-sm font-medium',
        'rounded-md',
        'transition-all duration-200',
        
        // WCAG AA compliant colors
        'bg-primary-green text-white',
        'border-2 border-primary-green',
        
        // Hidden state - positioned off-screen
        'transform -translate-y-full opacity-0',
        'focus:transform-none focus:opacity-100',
        
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
        'focus:ring-offset-primary-green',
        
        // Hover styles (when focused)
        'focus:hover:bg-primary-green-dark',
        
        className
      )}
      // ARIA attributes for screen readers
      aria-label={`Skip to ${targetId.replace('-', ' ')}`}
      tabIndex={0}
    >
      {children}
    </a>
  )
}

export default SkipLink
