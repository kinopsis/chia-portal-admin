/**
 * AccordionSection Component Tests
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AccordionSection } from '@/components/molecules/AccordionSection'

describe('AccordionSection', () => {
  const defaultProps = {
    title: 'Test Section',
    children: <div>Test content</div>
  }

  test('should render with title', () => {
    render(<AccordionSection {...defaultProps} />)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
  })

  test('should be collapsed by default', () => {
    render(<AccordionSection {...defaultProps} />)
    expect(screen.queryByText('Test content')).not.toBeInTheDocument()
  })

  test('should expand when clicked', () => {
    render(<AccordionSection {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  test('should show count when provided', () => {
    render(<AccordionSection {...defaultProps} count={5} />)
    expect(screen.getByText('Test Section (5)')).toBeInTheDocument()
  })

  test('should show icon when provided', () => {
    render(<AccordionSection {...defaultProps} icon="📋" />)
    expect(screen.getByText('📋')).toBeInTheDocument()
  })

  test('should apply variant styles', () => {
    render(<AccordionSection {...defaultProps} variant="requisitos" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border-l-amber-400')
  })

  test('should be expanded by default when defaultExpanded is true', () => {
    render(<AccordionSection {...defaultProps} defaultExpanded={true} />)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  test('should have proper ARIA attributes', () => {
    render(<AccordionSection {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-controls')
  })

  test('should update ARIA attributes when expanded', () => {
    render(<AccordionSection {...defaultProps} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
