'use client'

import React from 'react'
import { clsx } from 'clsx'

export interface MainContentProps {
  children: React.ReactNode
  className?: string
  skipLinkTarget?: boolean
  ariaLabel?: string
}

/**
 * MainContent component for WCAG 2.1 AA compliance
 * Provides the main landmark for screen readers and skip links
 * 
 * WCAG 2.1 Success Criteria:
 * - SC 2.4.1 Bypass Blocks (Level A) - Works with SkipLinks
 * - SC 1.3.1 Info and Relationships (Level A) - Semantic structure
 * - SC 2.4.6 Headings and Labels (Level AA) - Clear content structure
 */
const MainContent: React.FC<MainContentProps> = ({ 
  children, 
  className,
  skipLinkTarget = true,
  ariaLabel = 'Contenido principal'
}) => {
  return (
    <main
      id={skipLinkTarget ? 'main-content' : undefined}
      className={clsx(
        // Base styles for main content
        'flex-1',
        'focus:outline-none',
        className
      )}
      role="main"
      aria-label={ariaLabel}
      tabIndex={-1} // Allow programmatic focus from skip links
    >
      {children}
    </main>
  )
}

export default MainContent
