'use client'

/**
 * AccordionSection Component
 * 
 * Reusable accordion component for expandable content sections
 * Used in TramiteCardEnhanced for requisitos and instrucciones
 */

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface AccordionSectionProps {
  /** Section title */
  title: string
  
  /** Optional count to display next to title */
  count?: number
  
  /** Icon to display (emoji or component) */
  icon?: string | React.ReactNode
  
  /** Content to display when expanded */
  children: React.ReactNode
  
  /** Whether section is expanded by default */
  defaultExpanded?: boolean
  
  /** Visual variant for different content types */
  variant?: 'requisitos' | 'instrucciones' | 'default'
  
  /** Additional CSS classes */
  className?: string
  
  /** Test ID for testing */
  'data-testid'?: string
}

const variantStyles = {
  requisitos: {
    button: 'bg-gray-50 border-gray-200 hover:bg-gray-100 border-l-4 border-l-amber-400',
    content: 'bg-gray-50 border-gray-200',
    text: 'text-gray-700',  // ✅ Unificado con sección "Descripción"
    icon: 'text-amber-600'
  },
  instrucciones: {
    button: 'bg-gray-50 border-gray-200 hover:bg-gray-100 border-l-4 border-l-blue-400',
    content: 'bg-gray-50 border-gray-200',
    text: 'text-gray-700',  // ✅ Unificado con sección "Descripción"
    icon: 'text-blue-600'   // ✅ Mantenido como está
  },
  default: {
    button: 'bg-gray-50 border-gray-200 hover:bg-gray-100 border-l-4 border-l-gray-400',
    content: 'bg-gray-50 border-gray-200',
    text: 'text-gray-700',
    icon: 'text-gray-600'
  }
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  count,
  icon,
  children,
  defaultExpanded = false,
  variant = 'default',
  className,
  'data-testid': testId,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const styles = variantStyles[variant]

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={cn('w-full', className)} data-testid={testId}>
      {/* Accordion Header Button */}
      <button
        type="button"
        className={cn(
          'flex items-center justify-between w-full p-3 rounded-lg border transition-colors duration-200',
          styles.button
        )}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-2">
          {/* Icon */}
          {icon && (
            <span className={cn('text-sm', styles.icon)} aria-hidden="true">
              {icon}
            </span>
          )}
          
          {/* Title and Count */}
          <span className={cn('font-medium text-sm', styles.text)}>
            {title}
            {count !== undefined && (
              <span className="ml-1">({count})</span>
            )}
          </span>
        </div>
        
        {/* Expand/Collapse Icon */}
        <span className={cn('transition-transform duration-200', styles.icon)}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>
      
      {/* Accordion Content */}
      {isExpanded && (
        <div
          id={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            'mt-2 p-3 rounded-lg border transition-all duration-300 ease-in-out',
            'animate-in slide-in-from-top-1 fade-in-0',
            styles.content
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default AccordionSection
