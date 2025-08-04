/**
 * Usage Examples for UnifiedServiceCard Component
 * 
 * This file demonstrates how to implement the unified card component
 * across different contexts and user roles.
 */

import React from 'react'
import { UnifiedServiceCard, UnifiedServiceCardGrid } from '@/components/molecules/UnifiedServiceCard'
import type { UnifiedServiceData, ManagementActions } from '@/components/molecules/UnifiedServiceCard'

// Example service data
const exampleTramite: UnifiedServiceData = {
  id: 'tramite-example',
  codigo: 'TR-001',
  nombre: 'Certificado de Residencia',
  descripcion: 'Certificado oficial que acredita la residencia del solicitante',
  tipo: 'tramite',
  activo: true,
  dependencia: 'Secretaría de Gobierno',
  subdependencia: 'Dirección de Atención al Ciudadano',
  tiempo_estimado: '5 días hábiles',
  vistas: 150,
  originalData: {
    tiene_pago: false,
    requisitos: ['Cédula de ciudadanía', 'Recibo de servicios públicos'],
    visualizacion_suit: 'https://suit.gov.co/tramite-1',
    visualizacion_gov: 'https://gov.co/tramite-1'
  }
}

const exampleOPA: UnifiedServiceData = {
  id: 'opa-example',
  codigo: 'OPA-001',
  nombre: 'Atención al Ciudadano - Medio Ambiente',
  descripcion: 'Servicio de atención personalizada para consultas ambientales',
  tipo: 'opa',
  activo: true,
  dependencia: 'Secretaría de Medio Ambiente',
  tiempo_estimado: '30 minutos',
  vistas: 75
}

// Example 1: Public Page Usage (like /tramites)
export const PublicPageExample: React.FC = () => {
  const services = [exampleTramite, exampleOPA]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Trámites y Servicios</h1>
      
      <UnifiedServiceCardGrid
        services={services}
        context="public"
        userRole="ciudadano"
        loading={false}
        emptyState={
          <div className="text-center py-12">
            <p>No se encontraron servicios</p>
          </div>
        }
      />
    </div>
  )
}

// Example 2: Admin Panel Usage
export const AdminPanelExample: React.FC = () => {
  const services = [exampleTramite, exampleOPA]

  const handleActions: ManagementActions = {
    onEdit: (service) => {
      console.log('Edit service:', service.id)
      // Open edit modal
    },
    onToggle: (service, newState) => {
      console.log('Toggle service:', service.id, 'to', newState)
      // Update service status
    },
    onDelete: (service) => {
      console.log('Delete service:', service.id)
      // Show confirmation dialog
    },
    onView: (service) => {
      console.log('View service:', service.id)
      // Navigate to detail view
    },
    onDuplicate: (service) => {
      console.log('Duplicate service:', service.id)
      // Create copy of service
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Servicios</h1>
      
      <UnifiedServiceCardGrid
        services={services}
        actions={handleActions}
        context="admin"
        userRole="admin"
        permissions={{
          edit: true,
          toggle: true,
          delete: true,
          view: true,
          duplicate: true
        }}
        loadingStates={{
          'tramite-example': { toggle: false, edit: false },
          'opa-example': { toggle: true, edit: false } // OPA is being toggled
        }}
        errorStates={{
          'tramite-example': { toggle: null, edit: 'Error al editar' }
        }}
      />
    </div>
  )
}

// Example 3: Funcionario Panel Usage (Limited Permissions)
export const FuncionarioPanelExample: React.FC = () => {
  const services = [exampleTramite, exampleOPA]

  const handleActions: ManagementActions = {
    onEdit: (service) => {
      console.log('Edit service:', service.id)
    },
    onView: (service) => {
      console.log('View service:', service.id)
    },
    onToggle: (service, newState) => {
      console.log('Toggle service:', service.id, 'to', newState)
    }
    // Note: No delete or duplicate for funcionarios
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel Funcionario</h1>
      
      <UnifiedServiceCardGrid
        services={services}
        actions={handleActions}
        context="funcionario"
        userRole="funcionario"
        permissions={{
          edit: true,
          toggle: true,
          delete: false, // Funcionarios can't delete
          view: true,
          duplicate: false // Funcionarios can't duplicate
        }}
      />
    </div>
  )
}

// Example 4: Single Card Usage
export const SingleCardExample: React.FC = () => {
  const handleActions: ManagementActions = {
    onEdit: (service) => console.log('Edit:', service.id),
    onView: (service) => console.log('View:', service.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <UnifiedServiceCard
        service={exampleTramite}
        actions={handleActions}
        context="admin"
        userRole="admin"
        defaultExpanded={true} // Show requirements expanded by default
        loadingStates={{
          toggle: false,
          edit: false,
          delete: false,
          view: false,
          duplicate: false
        }}
        permissions={{
          edit: true,
          toggle: true,
          delete: true,
          view: true,
          duplicate: true
        }}
      />
    </div>
  )
}

// Example 5: Loading State
export const LoadingStateExample: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cargando Servicios...</h1>
      
      <UnifiedServiceCardGrid
        services={[]}
        context="admin"
        userRole="admin"
        loading={true}
        skeletonCount={5}
      />
    </div>
  )
}

// Example 6: Data Conversion Utility
export const convertLegacyDataToUnified = (legacyData: any[]): UnifiedServiceData[] => {
  return legacyData.map(item => ({
    id: item.id,
    codigo: item.codigo || item.code,
    nombre: item.nombre || item.name || item.title,
    descripcion: item.descripcion || item.description || item.formulario,
    tipo: item.tipo || (item.tipo_servicio === 'tramite' ? 'tramite' : 'opa'),
    activo: item.activo ?? true,
    dependencia: item.dependencia?.nombre || item.dependencia,
    subdependencia: item.subdependencia?.nombre || item.subdependencia,
    tiempo_estimado: item.tiempo_estimado || item.tiempo_respuesta,
    vistas: item.vistas || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
    originalData: {
      tiene_pago: item.tiene_pago || item.requiere_pago,
      requiere_pago: item.requiere_pago || item.tiene_pago,
      requisitos: item.requisitos || [],
      formulario: item.formulario,
      visualizacion_suit: item.visualizacion_suit,
      visualizacion_gov: item.visualizacion_gov,
      ...item // Include any additional fields
    }
  }))
}

export default {
  PublicPageExample,
  AdminPanelExample,
  FuncionarioPanelExample,
  SingleCardExample,
  LoadingStateExample,
  convertLegacyDataToUnified
}
