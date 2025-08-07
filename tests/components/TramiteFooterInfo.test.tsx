/**
 * TramiteFooterInfo Component Tests
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TramiteFooterInfo } from '@/components/molecules/TramiteFooterInfo'

describe('TramiteFooterInfo', () => {
  const defaultProps = {
    tieneCosto: false,
    modalidad: 'presencial' as const
  }

  test('should render all three columns', () => {
    render(<TramiteFooterInfo {...defaultProps} tiempoRespuesta="5 días hábiles" />)
    
    expect(screen.getByText('Tiempo Respuesta')).toBeInTheDocument()
    expect(screen.getByText('Tiene Costo')).toBeInTheDocument()
    expect(screen.getByText('Modalidad')).toBeInTheDocument()
  })

  test('should display tiempo respuesta correctly', () => {
    render(<TramiteFooterInfo {...defaultProps} tiempoRespuesta="5 días hábiles" />)
    expect(screen.getByText('5 días hábiles')).toBeInTheDocument()
  })

  test('should display "No especificado" when tiempo respuesta is not provided', () => {
    render(<TramiteFooterInfo {...defaultProps} />)
    expect(screen.getByText('No especificado')).toBeInTheDocument()
  })

  test('should display "NO" for free tramites', () => {
    render(<TramiteFooterInfo {...defaultProps} tieneCosto={false} />)
    expect(screen.getByText('NO')).toBeInTheDocument()
  })

  test('should display "SÍ" for paid tramites', () => {
    render(<TramiteFooterInfo {...defaultProps} tieneCosto={true} />)
    expect(screen.getByText('SÍ')).toBeInTheDocument()
  })

  test('should display presencial modalidad correctly', () => {
    render(<TramiteFooterInfo {...defaultProps} modalidad="presencial" />)
    expect(screen.getByText('Presencial')).toBeInTheDocument()
    expect(screen.getByText('🏢')).toBeInTheDocument()
  })

  test('should display virtual modalidad correctly', () => {
    render(<TramiteFooterInfo {...defaultProps} modalidad="virtual" />)
    expect(screen.getByText('Virtual')).toBeInTheDocument()
    expect(screen.getByText('💻')).toBeInTheDocument()
  })

  test('should display mixto modalidad correctly', () => {
    render(<TramiteFooterInfo {...defaultProps} modalidad="mixto" />)
    expect(screen.getByText('Mixto')).toBeInTheDocument()
    expect(screen.getByText('🔄')).toBeInTheDocument()
  })

  test('should apply correct CSS classes for free tramites', () => {
    render(<TramiteFooterInfo {...defaultProps} tieneCosto={false} />)
    
    const costElement = screen.getByText('NO')
    expect(costElement).toHaveClass('bg-green-50', 'text-green-700')
  })

  test('should apply correct CSS classes for paid tramites', () => {
    render(<TramiteFooterInfo {...defaultProps} tieneCosto={true} />)
    
    const costElement = screen.getByText('SÍ')
    expect(costElement).toHaveClass('bg-yellow-50', 'text-yellow-700')
  })

  test('should apply correct CSS classes for modalidad', () => {
    render(<TramiteFooterInfo {...defaultProps} modalidad="virtual" />)
    
    const modalidadElement = screen.getByText('Virtual')
    expect(modalidadElement).toHaveClass('bg-blue-50', 'text-blue-700')
  })

  test('should have responsive grid layout', () => {
    const { container } = render(<TramiteFooterInfo {...defaultProps} />)
    
    const gridElement = container.firstChild
    expect(gridElement).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3')
  })
})
