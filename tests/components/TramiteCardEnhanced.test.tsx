/**
 * TramiteCardEnhanced Component Tests
 * 
 * Tests for the enhanced tramite card component based on reference design
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TramiteCardEnhanced, TramiteEnhanced } from '@/components/molecules/TramiteCardEnhanced'

describe('TramiteCardEnhanced', () => {
  const mockTramite: TramiteEnhanced = {
    id: 'test-tramite-1',
    codigo_unico: 'TR-001',
    nombre: 'Certificado de Residencia',
    formulario: 'Certificado oficial que acredita la residencia del solicitante en el municipio',
    tiempo_respuesta: '5 días hábiles',
    tiene_pago: false,
    subdependencia_id: 'sub-1',
    activo: true,
    modalidad: 'presencial',
    dependencia: 'Secretaría de Gobierno',
    subdependencia: 'Dirección de Atención al Ciudadano',
    requisitos: [
      'Cédula de ciudadanía original y copia',
      'Formulario de solicitud debidamente diligenciado',
      'Comprobante de pago de derechos (si aplica)'
    ],
    instructivo: [
      'Solicite cita previa a través del portal web',
      'Prepare todos los documentos requeridos',
      'Asista puntualmente a su cita programada',
      'Presente documentos y complete formularios',
      'Realice el pago en caja si es requerido'
    ],
    observaciones: 'Este trámite requiere cita previa. Horario de atención: lunes a viernes de 8:00 AM a 4:00 PM.',
    visualizacion_suit: 'https://suit.gov.co/tramite/TR-001',
    visualizacion_gov: 'https://gov.co/tramites/TR-001'
  }

  test('should render tramite card collapsed by default', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Check basic information that should always be visible
    expect(screen.getByText('Certificado de Residencia')).toBeInTheDocument()
    expect(screen.getByText('Trámite')).toBeInTheDocument()
    expect(screen.getByText('Secretaría de Gobierno')).toBeInTheDocument()
    expect(screen.getByText('Dirección de Atención al Ciudadano')).toBeInTheDocument()

    // Check that detailed content is NOT visible when collapsed
    expect(screen.queryByText(mockTramite.formulario!)).not.toBeInTheDocument()
    expect(screen.queryByText('5 días hábiles')).not.toBeInTheDocument()
    expect(screen.queryByText('Enlaces oficiales:')).not.toBeInTheDocument()
    expect(screen.queryByText('Descripción:')).not.toBeInTheDocument()

    // Code should not be visible when collapsed
    expect(screen.queryByText('TR-001')).not.toBeInTheDocument()

    // Badges should not be visible when collapsed (except "Trámite")
    expect(screen.queryByText('Gratuito')).not.toBeInTheDocument()
    expect(screen.queryByText('🏢 Presencial')).not.toBeInTheDocument()
  })

  test('should expand when clicked and show description section without formulario', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Find and click the accordion button
    const accordionButton = screen.getByRole('button')
    fireEvent.click(accordionButton)

    // Check that detailed content is now visible
    expect(screen.getByText('5 días hábiles')).toBeInTheDocument()
    expect(screen.getByText('Enlaces oficiales:')).toBeInTheDocument()

    // Check that new "Descripción" section is visible when expanded
    expect(screen.getByText('Descripción:')).toBeInTheDocument()

    // Check that formulario field is NOT visible in expanded view (removed as per requirements)
    expect(screen.queryByText(mockTramite.formulario!)).not.toBeInTheDocument()

    // Badges should NOT be visible in expanded view (removed as per requirements)
    expect(screen.queryByText('Gratuito')).not.toBeInTheDocument()
    expect(screen.queryByText('🏢 Presencial')).not.toBeInTheDocument()
  })

  test('should display only tramite badge and no badges in expanded view', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // When collapsed, only "Trámite" badge should be visible
    expect(screen.getByText('Trámite')).toBeInTheDocument()
    expect(screen.queryByText('Gratuito')).not.toBeInTheDocument()
    expect(screen.queryByText('🏢 Presencial')).not.toBeInTheDocument()

    // Expand the card
    const accordionButton = screen.getByRole('button')
    fireEvent.click(accordionButton)

    // Badges should NOT be visible in expanded content (removed as per requirements)
    expect(screen.getAllByText('Trámite')).toHaveLength(1) // Only one in header
    expect(screen.queryByText('Gratuito')).not.toBeInTheDocument()
    expect(screen.queryByText('🏢 Presencial')).not.toBeInTheDocument()
  })

  test('should show sections in correct order and always display requisitos', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Expand the card
    const accordionButton = screen.getByRole('button')
    fireEvent.click(accordionButton)

    // Check that all sections are present in the correct order
    expect(screen.getByText('Descripción:')).toBeInTheDocument()
    expect(screen.getByText('Requisitos')).toBeInTheDocument() // Always visible
    expect(screen.getByText('Instrucciones')).toBeInTheDocument()
    expect(screen.getByText('5 días hábiles')).toBeInTheDocument() // Tiempo de respuesta
    expect(screen.getByText('Observaciones:')).toBeInTheDocument() // After tiempo de respuesta
    expect(screen.getByText('Enlaces oficiales:')).toBeInTheDocument() // Last
  })

  test('should display requisitos section even with empty array', () => {
    const tramiteWithoutRequisitos = {
      ...mockTramite,
      requisitos: []
    }

    render(<TramiteCardEnhanced tramite={tramiteWithoutRequisitos} />)

    // Expand the card
    const accordionButton = screen.getByRole('button')
    fireEvent.click(accordionButton)

    // Requisitos section should still be visible with appropriate message
    expect(screen.getByText('Requisitos')).toBeInTheDocument()
    expect(screen.getByText('No se han especificado requisitos para este trámite. Consulte con la dependencia correspondiente.')).toBeInTheDocument()
  })

  test('should display footer information only when expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Footer should not be visible when collapsed
    expect(screen.queryByText('5 días hábiles')).not.toBeInTheDocument()
    expect(screen.queryByText('NO')).not.toBeInTheDocument()

    // Expand the card
    const accordionButton = screen.getByRole('button')
    fireEvent.click(accordionButton)

    // Now footer information should be visible
    expect(screen.getByText('5 días hábiles')).toBeInTheDocument()
    expect(screen.getByText('NO')).toBeInTheDocument() // Tiene Costo: NO
    expect(screen.getByText('Presencial')).toBeInTheDocument()
  })

  test('should not show requisitos when card is collapsed', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Requisitos section should not be visible when card is collapsed
    expect(screen.queryByText('Requisitos (3)')).not.toBeInTheDocument()
    expect(screen.queryByText('Cédula de ciudadanía original y copia')).not.toBeInTheDocument()
  })

  test('should show and expand requisitos when card is expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // First expand the main card
    const mainAccordionButton = screen.getByRole('button')
    fireEvent.click(mainAccordionButton)

    // Now requisitos section should be visible
    expect(screen.getByText('Requisitos (3)')).toBeInTheDocument()

    // Requisitos should be collapsed by default
    expect(screen.queryByText('Cédula de ciudadanía original y copia')).not.toBeInTheDocument()

    // Click on requisitos accordion
    const requisitosButton = screen.getByText('Requisitos (3)')
    fireEvent.click(requisitosButton)

    // Check that requisitos are now visible
    expect(screen.getByText('Cédula de ciudadanía original y copia')).toBeInTheDocument()
    expect(screen.getByText('Formulario de solicitud debidamente diligenciado')).toBeInTheDocument()
    expect(screen.getByText('Comprobante de pago de derechos (si aplica)')).toBeInTheDocument()
  })

  test('should show instrucciones only when card is expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Instrucciones should not be visible when card is collapsed
    expect(screen.queryByText('Instrucciones (5)')).not.toBeInTheDocument()

    // Expand the main card
    const mainAccordionButton = screen.getByRole('button')
    fireEvent.click(mainAccordionButton)

    // Now instrucciones section should be visible
    expect(screen.getByText('Instrucciones (5)')).toBeInTheDocument()

    // Instrucciones should be collapsed by default
    expect(screen.queryByText('Solicite cita previa a través del portal web')).not.toBeInTheDocument()

    // Click on instrucciones accordion
    const instruccionesButton = screen.getByText('Instrucciones (5)')
    fireEvent.click(instruccionesButton)

    // Check that instrucciones are now visible
    expect(screen.getByText('Solicite cita previa a través del portal web')).toBeInTheDocument()
    expect(screen.getByText('Prepare todos los documentos requeridos')).toBeInTheDocument()
  })

  test('should display observaciones only when card is expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Observaciones should not be visible when collapsed
    expect(screen.queryByText('Observaciones:')).not.toBeInTheDocument()

    // Expand the main card
    const mainAccordionButton = screen.getByRole('button')
    fireEvent.click(mainAccordionButton)

    // Now observaciones should be visible
    expect(screen.getByText('Observaciones:')).toBeInTheDocument()
    expect(screen.getByText(mockTramite.observaciones!)).toBeInTheDocument()
  })

  test('should display government portal links only when expanded', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    // Links should not be visible when collapsed
    expect(screen.queryByText('Enlaces oficiales:')).not.toBeInTheDocument()

    // Expand the main card
    const mainAccordionButton = screen.getByRole('button')
    fireEvent.click(mainAccordionButton)

    // Now government links should be visible
    expect(screen.getByText('Enlaces oficiales:')).toBeInTheDocument()

    const suitLink = screen.getByText('SUIT')
    const govLink = screen.getByText('GOV.CO')

    expect(suitLink).toHaveAttribute('href', 'https://suit.gov.co/tramite/TR-001')
    expect(govLink).toHaveAttribute('href', 'https://gov.co/tramites/TR-001')
    expect(suitLink).toHaveAttribute('target', '_blank')
    expect(govLink).toHaveAttribute('target', '_blank')
  })

  test('should handle tramite with payment', () => {
    const tramiteWithPayment = {
      ...mockTramite,
      tiene_pago: true
    }
    
    render(<TramiteCardEnhanced tramite={tramiteWithPayment} />)
    
    // Check payment badge and footer
    expect(screen.getByText('Con Costo')).toBeInTheDocument()
    expect(screen.getByText('SÍ')).toBeInTheDocument() // Tiene Costo: SÍ
  })

  test('should handle tramite with virtual modality', () => {
    const virtualTramite = {
      ...mockTramite,
      modalidad: 'virtual' as const
    }
    
    render(<TramiteCardEnhanced tramite={virtualTramite} />)
    
    // Check virtual modality
    expect(screen.getAllByText('Virtual')).toHaveLength(2) // Badge and footer
  })

  test('should handle tramite without optional fields', () => {
    const minimalTramite: TramiteEnhanced = {
      id: 'minimal-1',
      codigo_unico: 'MIN-001',
      nombre: 'Trámite Mínimo',
      tiene_pago: false,
      subdependencia_id: 'sub-1',
      activo: true,
      modalidad: 'presencial'
    }
    
    render(<TramiteCardEnhanced tramite={minimalTramite} />)
    
    // Should render basic information
    expect(screen.getByText('Trámite Mínimo')).toBeInTheDocument()
    expect(screen.getByText('MIN-001')).toBeInTheDocument()
    
    // Should not render optional sections
    expect(screen.queryByText('Requisitos')).not.toBeInTheDocument()
    expect(screen.queryByText('Instrucciones')).not.toBeInTheDocument()
    expect(screen.queryByText('Observaciones:')).not.toBeInTheDocument()
    expect(screen.queryByText('Enlaces oficiales:')).not.toBeInTheDocument()
  })

  test('should render expanded when defaultExpanded is true', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} defaultExpanded={true} />)

    // Main card should be expanded, showing all content
    expect(screen.getByText(mockTramite.formulario!)).toBeInTheDocument()
    expect(screen.getByText('5 días hábiles')).toBeInTheDocument()
    expect(screen.getByText('Enlaces oficiales:')).toBeInTheDocument()

    // Internal accordions should still be collapsed by default
    expect(screen.getByText('Requisitos (3)')).toBeInTheDocument()
    expect(screen.queryByText('Cédula de ciudadanía original y copia')).not.toBeInTheDocument()
  })

  test('should handle null tiene_pago values', () => {
    const tramiteWithNullPago = {
      ...mockTramite,
      tiene_pago: null as any
    }

    render(<TramiteCardEnhanced tramite={tramiteWithNullPago} />)

    // Expand the card to see the badges
    const mainAccordionButton = screen.getByRole('button')
    fireEvent.click(mainAccordionButton)

    // Should default to "Gratuito" when tiene_pago is null
    expect(screen.getByText('Gratuito')).toBeInTheDocument()
    expect(screen.getByText('NO')).toBeInTheDocument() // Footer should show NO
  })

  test('should toggle between collapsed and expanded states', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    const mainAccordionButton = screen.getByRole('button')

    // Initially collapsed
    expect(screen.queryByText(mockTramite.formulario!)).not.toBeInTheDocument()

    // Expand
    fireEvent.click(mainAccordionButton)
    expect(screen.getByText(mockTramite.formulario!)).toBeInTheDocument()

    // Collapse again
    fireEvent.click(mainAccordionButton)
    expect(screen.queryByText(mockTramite.formulario!)).not.toBeInTheDocument()
  })

  test('should have proper ARIA attributes for main accordion', () => {
    render(<TramiteCardEnhanced tramite={mockTramite} />)

    const mainAccordionButton = screen.getByRole('button')

    // Initially collapsed
    expect(mainAccordionButton).toHaveAttribute('aria-expanded', 'false')
    expect(mainAccordionButton).toHaveAttribute('aria-controls', `tramite-content-${mockTramite.id}`)

    // After expanding
    fireEvent.click(mainAccordionButton)
    expect(mainAccordionButton).toHaveAttribute('aria-expanded', 'true')
  })
})
