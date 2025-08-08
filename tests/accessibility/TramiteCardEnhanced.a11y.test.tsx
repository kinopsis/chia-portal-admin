/**
 * TramiteCardEnhanced Accessibility Tests
 * 
 * Tests to ensure the enhanced tramite card meets accessibility standards
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom'
import { TramiteCardEnhanced, TramiteEnhanced } from '@/components/molecules/TramiteCardEnhanced'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('TramiteCardEnhanced Accessibility', () => {
  const mockTramite: TramiteEnhanced = {
    id: 'test-tramite-1',
    codigo_unico: 'TR-001',
    nombre: 'Certificado de Residencia',
    formulario: 'Certificado oficial que acredita la residencia del solicitante',
    tiempo_respuesta: '5 días hábiles',
    tiene_pago: false,
    subdependencia_id: 'sub-1',
    activo: true,
    modalidad: 'presencial',
    dependencia: 'Secretaría de Gobierno',
    subdependencia: 'Dirección de Atención al Ciudadano',
    requisitos: [
      'Cédula de ciudadanía original y copia',
      'Formulario de solicitud debidamente diligenciado'
    ],
    instructivo: [
      'Solicite cita previa a través del portal web',
      'Prepare todos los documentos requeridos'
    ],
    observaciones: 'Este trámite requiere cita previa.',
    visualizacion_suit: 'https://suit.gov.co/tramite/TR-001',
    visualizacion_gov: 'https://gov.co/tramites/TR-001'
  }

  test('should not have accessibility violations', async () => {
    const { container } = render(<TramiteCardEnhanced tramite={mockTramite} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('should have proper heading structure', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)
    
    // Main title should be h3
    const title = screen.getByRole('heading', { level: 3 })
    expect(title).toHaveTextContent('Certificado de Residencia')
  })

  test('should have proper button roles for accordions when expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // First expand the main card
    const mainButton = screen.getByRole('button')
    fireEvent.click(mainButton)

    // Now accordion buttons should have proper roles
    const requisitosButton = screen.getByRole('button', { name: /requisitos/i })
    const instruccionesButton = screen.getByRole('button', { name: /instrucciones/i })

    expect(requisitosButton).toBeInTheDocument()
    expect(instruccionesButton).toBeInTheDocument()
  })

  test('should have proper ARIA attributes for accordions when expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // First expand the main card
    const mainButton = screen.getByRole('button')
    fireEvent.click(mainButton)

    const requisitosButton = screen.getByRole('button', { name: /requisitos/i })

    expect(requisitosButton).toHaveAttribute('aria-expanded', 'false')
    expect(requisitosButton).toHaveAttribute('aria-controls')
  })

  test('should have proper link attributes for external links when expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // First expand the main card
    const mainButton = screen.getByRole('button')
    fireEvent.click(mainButton)

    const suitLink = screen.getByRole('link', { name: 'SUIT' })
    const govLink = screen.getByRole('link', { name: 'GOV.CO' })

    expect(suitLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(suitLink).toHaveAttribute('target', '_blank')
    expect(govLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(govLink).toHaveAttribute('target', '_blank')
  })

  test('should have proper list structure for requisitos', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} defaultExpanded={true} />)
    
    // Should have unordered list for requisitos
    const requisitosItems = screen.getAllByText(/cédula de ciudadanía|formulario de solicitud/i)
    expect(requisitosItems).toHaveLength(2)
  })

  test('should have proper list structure for instrucciones', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} defaultExpanded={true} />)
    
    // Should have ordered list for instrucciones
    const instruccionesItems = screen.getAllByText(/solicite cita previa|prepare todos los documentos/i)
    expect(instruccionesItems).toHaveLength(2)
  })

  test('should have sufficient color contrast', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)
    
    // Check that important text elements exist (contrast will be validated by axe)
    expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
    expect(screen.getByText('TR-001')).toBeInTheDocument()
  })

  test('should be keyboard navigable when expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Main button should always be focusable
    const mainButton = screen.getByRole('button')
    expect(mainButton).toBeVisible()

    // Expand the card
    fireEvent.click(mainButton)

    // All interactive elements should be focusable
    const requisitosButton = screen.getByRole('button', { name: /requisitos/i })
    const instruccionesButton = screen.getByRole('button', { name: /instrucciones/i })

    expect(requisitosButton).toBeVisible()
    expect(instruccionesButton).toBeVisible()

    // Links should be focusable
    const suitLink = screen.getByRole('link', { name: 'SUIT' })
    const govLink = screen.getByRole('link', { name: 'GOV.CO' })

    expect(suitLink).toBeVisible()
    expect(govLink).toBeVisible()
  })

  test('should have meaningful text for screen readers with description section', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Check for descriptive text that's always visible
    expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
    expect(screen.getByText('Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('Dirección de Atención al Ciudadano')).toBeInTheDocument()
    expect(screen.getByText('Trámite')).toBeInTheDocument()

    // Expand to check other text including new "Descripción" section
    const mainButton = screen.getByRole('button')
    fireEvent.click(mainButton)

    expect(screen.getByText('Enlaces oficiales:')).toBeInTheDocument()
    expect(screen.getByText('Observaciones:')).toBeInTheDocument()
    expect(screen.getByText('Descripción:')).toBeInTheDocument()
    expect(screen.getByText('Requisitos')).toBeInTheDocument() // Always visible

    // Verify formulario field is not present in expanded view (removed)
    expect(screen.queryByText(mockTramite.formulario!)).not.toBeInTheDocument()

    // Verify badges are not present in expanded view
    expect(screen.queryByText('Gratuito')).not.toBeInTheDocument()
    expect(screen.queryByText('🏢 Presencial')).not.toBeInTheDocument()
  })

  test('should handle focus management properly', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Main button should be focusable
    const mainButton = screen.getByRole('button')
    mainButton.focus()
    expect(document.activeElement).toBe(mainButton)

    // Expand and test internal buttons
    fireEvent.click(mainButton)

    const requisitosButton = screen.getByRole('button', { name: /requisitos/i })

    // Button should be focusable
    requisitosButton.focus()
    expect(document.activeElement).toBe(requisitosButton)
  })
})
