/**
 * Service Transformers
 * 
 * Utility functions to transform Tramites and OPAs into unified ServiceEnhanced format
 */

import type { Tramite, OPA, ServiceEnhanced, TramiteEnhanced, OPAEnhanced } from '@/types'
import type { UnifiedServiceItem } from '@/services/unifiedServices'

/**
 * Transform a Tramite into ServiceEnhanced format
 */
export function transformTramiteToServiceEnhanced(tramite: Tramite): TramiteEnhanced {
  return {
    id: tramite.id,
    codigo: tramite.codigo_unico,
    nombre: tramite.nombre,
    descripcion: tramite.descripcion,
    formulario: tramite.formulario,
    tiempo_respuesta: tramite.tiempo_respuesta,
    tiene_pago: tramite.tiene_pago,
    visualizacion_suit: tramite.visualizacion_suit,
    visualizacion_gov: tramite.visualizacion_gov,
    requisitos: tramite.requisitos || [],
    instructivo: tramite.instructivo || [],
    modalidad: tramite.modalidad || 'presencial',
    categoria: tramite.categoria,
    observaciones: tramite.observaciones,
    tipo: 'tramite',
    dependencia: tramite.subdependencias?.dependencias?.nombre || '',
    subdependencia: tramite.subdependencias?.nombre || '',
    dependencia_id: tramite.subdependencias?.dependencias?.id || '',
    subdependencia_id: tramite.subdependencia_id,
    activo: tramite.activo,
    created_at: tramite.created_at,
    updated_at: tramite.updated_at,
    originalData: tramite
  }
}

/**
 * Transform an OPA into ServiceEnhanced format
 */
export function transformOPAToServiceEnhanced(opa: OPA): OPAEnhanced {
  return {
    id: opa.id,
    codigo: opa.codigo_opa,
    nombre: opa.nombre,
    descripcion: opa.descripcion,
    formulario: opa.formulario,
    tiempo_respuesta: opa.tiempo_respuesta,
    tiene_pago: opa.tiene_pago,
    visualizacion_suit: opa.visualizacion_suit,
    visualizacion_gov: opa.visualizacion_gov,
    requisitos: opa.requisitos || [],
    // For OPAs that don't have these fields yet, provide defaults
    instructivo: (opa as any).instructivo || [],
    modalidad: (opa as any).modalidad || 'presencial',
    categoria: (opa as any).categoria,
    observaciones: (opa as any).observaciones,
    tipo: 'opa',
    dependencia: opa.subdependencias?.dependencias?.nombre || '',
    subdependencia: opa.subdependencias?.nombre || '',
    dependencia_id: opa.subdependencias?.dependencias?.id || '',
    subdependencia_id: opa.subdependencia_id,
    activo: opa.activo,
    created_at: opa.created_at,
    updated_at: opa.updated_at,
    originalData: opa
  }
}

/**
 * Transform an array of Tramites into ServiceEnhanced format
 */
export function transformTramitesToServiceEnhanced(tramites: Tramite[]): TramiteEnhanced[] {
  return tramites.map(transformTramiteToServiceEnhanced)
}

/**
 * Transform an array of OPAs into ServiceEnhanced format
 */
export function transformOPAsToServiceEnhanced(opas: OPA[]): OPAEnhanced[] {
  return opas.map(transformOPAToServiceEnhanced)
}

/**
 * Transform UnifiedServiceItem to ServiceEnhanced format
 * This fixes the React rendering error by converting objects to strings
 * and normalizing field names between different service formats
 */
export function transformUnifiedServiceToServiceEnhanced(service: UnifiedServiceItem): ServiceEnhanced {
  // Create a mock original data object for compatibility
  const mockOriginalData = {
    id: service.id,
    nombre: service.nombre,
    descripcion: service.descripcion || '',
    activo: service.activo,
    created_at: service.created_at,
    updated_at: service.updated_at
  }

  return {
    id: service.id,
    codigo: service.codigo,
    nombre: service.nombre,
    descripcion: service.descripcion,
    formulario: service.formulario,
    tiempo_respuesta: service.tiempo_respuesta,
    // Fix field name mismatch: requiere_pago -> tiene_pago
    tiene_pago: service.requiere_pago || false,
    // Ensure flags remain boolean; URLs are provided via url_suit/url_gov
    visualizacion_suit: Boolean(service.visualizacion_suit),
    visualizacion_gov: Boolean(service.visualizacion_gov),
    // Provide URL fields explicitly for card display
    url_suit: service.url_suit,
    url_gov: service.url_gov,
    requisitos: service.requisitos || [],
    instructivo: service.instrucciones || [],
    instrucciones: service.instrucciones || [], // CRITICAL FIX: Map instrucciones field
    modalidad: 'presencial', // Default value, can be enhanced later
    categoria: service.categoria,
    observaciones: undefined,
    // Fix field name mismatch: tipo_servicio -> tipo
    tipo: (service.tipo_servicio === 'servicio' ? 'tramite' : service.tipo_servicio) as 'tramite' | 'opa',
    // Convert objects to strings to prevent React rendering errors
    dependencia: typeof service.dependencia === 'object' ? service.dependencia?.nombre : service.dependencia,
    subdependencia: typeof service.subdependencia === 'object' ? service.subdependencia?.nombre : service.subdependencia,
    // CRITICAL FIX: Add missing dependencia_id field for filter functionality
    dependencia_id: service.dependencia_id,
    subdependencia_id: service.subdependencia_id,
    activo: service.activo,
    created_at: service.created_at,
    updated_at: service.updated_at,
    // Use mock data for compatibility
    originalData: mockOriginalData as any
  }
}

/**
 * Combine and sort Tramites and OPAs into a unified ServiceEnhanced array
 */
export function combineServicesEnhanced(
  tramites: Tramite[] = [],
  opas: OPA[] = []
): ServiceEnhanced[] {
  const transformedTramites = transformTramitesToServiceEnhanced(tramites)
  const transformedOPAs = transformOPAsToServiceEnhanced(opas)
  
  const combined = [...transformedTramites, ...transformedOPAs]
  
  // Sort by name for consistent ordering
  return combined.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
}

/**
 * Filter services by type
 */
export function filterServicesByType(
  services: ServiceEnhanced[],
  type?: 'tramite' | 'opa' | ''
): ServiceEnhanced[] {
  if (!type || type === '' || type === undefined) {
    return services
  }

  return services.filter(service => service.tipo === type)
}

/**
 * Filter services by active status
 */
export function filterServicesByStatus(
  services: ServiceEnhanced[],
  activeOnly: boolean = true
): ServiceEnhanced[] {
  if (!activeOnly) {
    return services
  }
  
  return services.filter(service => service.activo)
}

/**
 * Filter services by payment requirement
 */
export function filterServicesByPayment(
  services: ServiceEnhanced[],
  paymentType?: 'true' | 'false' | ''
): ServiceEnhanced[] {
  if (!paymentType || paymentType === '' || paymentType === undefined) {
    return services
  }
  
  if (paymentType === 'true') {
    return services.filter(service => service.tiene_pago === true)
  }
  
  if (paymentType === 'false') {
    return services.filter(service => service.tiene_pago === false)
  }
  
  return services
}

/**
 * Filter services by dependencia
 */
export function filterServicesByDependencia(
  services: ServiceEnhanced[],
  dependencias: string[] = []
): ServiceEnhanced[] {
  if (dependencias.length === 0) {
    return services
  }
  
  return services.filter(service => 
    dependencias.some(dep => service.dependencia === dep)
  )
}

/**
 * Filter services by subdependencia
 */
export function filterServicesBySubdependencia(
  services: ServiceEnhanced[],
  subdependencias: string[] = []
): ServiceEnhanced[] {
  if (subdependencias.length === 0) {
    return services
  }
  
  return services.filter(service => 
    subdependencias.some(sub => service.subdependencia_id === sub)
  )
}

/**
 * Apply all filters to services
 */
export function applyServiceFilters(
  services: ServiceEnhanced[],
  filters: {
    type?: 'tramite' | 'opa' | ''
    activeOnly?: boolean
    paymentType?: 'true' | 'false' | ''
    dependencias?: string[]
    subdependencias?: string[]
  }
): ServiceEnhanced[] {
  let filtered = services
  
  // Apply type filter
  filtered = filterServicesByType(filtered, filters.type)
  
  // Apply active status filter
  filtered = filterServicesByStatus(filtered, filters.activeOnly ?? true)
  
  // Apply payment filter
  filtered = filterServicesByPayment(filtered, filters.paymentType)
  
  // Apply dependencia filter
  filtered = filterServicesByDependencia(filtered, filters.dependencias)
  
  // Apply subdependencia filter
  filtered = filterServicesBySubdependencia(filtered, filters.subdependencias)
  
  return filtered
}
