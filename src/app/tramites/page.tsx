'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

/**
 * Trámites Page - Enhanced Version
 *
 * Enhanced tramites page with improved card design and user experience.
 * Features the new TramiteCardEnhanced component with better information hierarchy.
 */

import React, { useState, useEffect } from 'react'
import { Card, Button } from '@/components/atoms'
import { TramiteCardEnhancedGrid, ServiceEnhanced } from '@/components/molecules/TramiteCardEnhanced'
import { TramitesFilters } from '@/components/organisms/TramitesFilters/TramitesFilters'
import { FilterOption } from '@/components/molecules/FilterChips/FilterChips'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { unifiedServicesService } from '@/services/unifiedServices'
import { transformUnifiedServiceToServiceEnhanced } from '@/utils/serviceTransformers'
import { normalizeSpanishText } from '@/lib/utils'
import { dependenciasClientService } from '@/services/dependencias'
import { subdependenciasClientService } from '@/services/subdependencias'
import type { Dependencia, Subdependencia } from '@/types'

const TramitesPage: React.FC = () => {
  // State management - now handles both tramites and OPAs
  const [services, setServices] = useState<ServiceEnhanced[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceEnhanced[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDependencias, setSelectedDependencias] = useState<string[]>([])
  const [selectedSubdependencias, setSelectedSubdependencias] = useState<string[]>([])
  const [selectedTipos, setSelectedTipos] = useState<string[]>([])
  const [selectedTiposPago, setSelectedTiposPago] = useState<string[]>([])

  // Filter options
  const [dependenciasOptions, setDependenciasOptions] = useState<FilterOption[]>([])
  const [subdependenciasOptions, setSubdependenciasOptions] = useState<FilterOption[]>([])
  const [dependenciasLoading, setDependenciasLoading] = useState(false)
  const [subdependenciasLoading, setSubdependenciasLoading] = useState(false)

  // Static filter options
  const tipoOptions = [
    { value: '', label: 'Todos los servicios' },
    { value: 'tramite', label: 'Solo Trámites' },
    { value: 'opa', label: 'Solo OPAs' },
  ]

  const tiposPagoOptions = [
    { value: '', label: 'Todos los costos' },
    { value: 'true', label: 'Con costo' },
    { value: 'false', label: 'Gratuitos' },
  ]

  // Breadcrumbs for SEO and navigation
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Trámites y OPAs', href: '/tramites' },
  ]

  // Fetch unified services data (tramites and OPAs)
  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use unified service to get both tramites and OPAs from servicios table
      const result = await unifiedServicesService.getAll({
        serviceType: 'both',
        activo: true,
        limit: 1000 // Get all active services
      })

      // Transform UnifiedServiceItem[] to ServiceEnhanced[]
      const transformedServices = result.data.map(transformUnifiedServiceToServiceEnhanced)

      setServices(transformedServices)
      setFilteredServices(transformedServices)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Error al cargar los servicios. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch dependencias for filters
  const fetchDependencias = async () => {
    try {
      setDependenciasLoading(true)
      const result = await dependenciasClientService.getAll()

      if (result.success) {
        const options: FilterOption[] = [
          { value: '', label: 'Todas las dependencias' },
          ...result.data.map(dep => ({
            value: dep.id,
            label: dep.nombre
          }))
        ]
        setDependenciasOptions(options)
      }
    } catch (err) {
      console.error('Error fetching dependencias:', err)
    } finally {
      setDependenciasLoading(false)
    }
  }

  // Fetch subdependencias for filters
  const fetchSubdependencias = async () => {
    try {
      setSubdependenciasLoading(true)
      const result = await subdependenciasClientService.getAll()

      if (result.success) {
        const options: FilterOption[] = [
          { value: '', label: 'Todas las subdependencias' },
          ...result.data.map(sub => ({
            value: sub.id,
            label: sub.nombre
          }))
        ]
        setSubdependenciasOptions(options)
      }
    } catch (err) {
      console.error('Error fetching subdependencias:', err)
    } finally {
      setSubdependenciasLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchServices()
    fetchDependencias()
    fetchSubdependencias()
  }, [])
  // Filter services based on search and filters
  useEffect(() => {
    let filtered = services

    // Search filter
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeSpanishText(searchQuery.toLowerCase())
      filtered = filtered.filter(service => {
        const normalizedNombre = normalizeSpanishText((service.nombre || '').toLowerCase())
        const normalizedCodigo = normalizeSpanishText((service.codigo || '').toLowerCase())
        const normalizedDependencia = normalizeSpanishText((service.dependencia || '').toLowerCase())
        const normalizedSubdependencia = normalizeSpanishText((service.subdependencia || '').toLowerCase())
        const normalizedDescripcion = normalizeSpanishText((service.descripcion || service.formulario || '').toLowerCase())

        return normalizedNombre.includes(normalizedQuery) ||
               normalizedCodigo.includes(normalizedQuery) ||
               normalizedDependencia.includes(normalizedQuery) ||
               normalizedSubdependencia.includes(normalizedQuery) ||
               normalizedDescripcion.includes(normalizedQuery)
      })
    }

    // Type filter (tramites/OPAs)
    if (selectedTipos.length > 0) {
      filtered = filtered.filter(service =>
        selectedTipos.some(tipo => {
          if (tipo === 'tramite') return service.tipo === 'tramite'
          if (tipo === 'opa') return service.tipo === 'opa'
          return true
        })
      )
    }

    // Dependencia filter
    if (selectedDependencias.length > 0) {
      filtered = filtered.filter(service =>
        selectedDependencias.some(depId => {
          const dep = dependenciasOptions.find(opt => opt.value === depId)
          return dep && service.dependencia === dep.label
        })
      )
    }

    // Subdependencia filter
    if (selectedSubdependencias.length > 0) {
      filtered = filtered.filter(service =>
        selectedSubdependencias.some(subId => {
          const sub = subdependenciasOptions.find(opt => opt.value === subId)
          return sub && service.subdependencia === sub.label
        })
      )
    }

    // Payment type filter
    if (selectedTiposPago.length > 0) {
      filtered = filtered.filter(service =>
        selectedTiposPago.some(tipo => {
          if (tipo === 'true') return service.tiene_pago === true
          if (tipo === 'false') return service.tiene_pago === false || service.tiene_pago === null
          return true
        })
      )
    }

    setFilteredServices(filtered)
  }, [services, searchQuery, selectedDependencias, selectedSubdependencias, selectedTipos, selectedTiposPago, dependenciasOptions, subdependenciasOptions])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDependencias([])
    setSelectedSubdependencias([])
    setSelectedTipos([])
    setSelectedTiposPago([])
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with SEO optimization */}
      <PageHeader
        title="Trámites y OPAs - Portal Ciudadano"
        description="Encuentra y gestiona trámites y servicios administrativos (OPAs) de manera fácil y rápida"
        breadcrumbs={breadcrumbs}
      />

      {/* Content */}
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Filters */}
          <TramitesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dependenciasOptions={dependenciasOptions}
            subdependenciasOptions={subdependenciasOptions}
            tipoOptions={tipoOptions}
            tiposPagoOptions={tiposPagoOptions}
            selectedDependencias={selectedDependencias}
            selectedSubdependencias={selectedSubdependencias}
            selectedTipos={selectedTipos}
            selectedTiposPago={selectedTiposPago}
            onDependenciasChange={setSelectedDependencias}
            onSubdependenciasChange={setSelectedSubdependencias}
            onTiposChange={setSelectedTipos}
            onTiposPagoChange={setSelectedTiposPago}
            dependenciasLoading={dependenciasLoading}
            subdependenciasLoading={subdependenciasLoading}
            totalResults={filteredServices.length}
            onClearFilters={clearFilters}
          />

          {/* Results */}
          <TramiteCardEnhancedGrid
            tramites={filteredServices}
            loading={loading}
            error={error}
            context="public"
            defaultExpanded={false}
            emptyState={{
              title: 'No se encontraron servicios',
              description: 'Intenta ajustar los filtros de búsqueda para encontrar más resultados.',
              action: (
                <Button variant="primary" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              )
            }}
            data-testid="services-enhanced-grid"
          />
        </div>
      </div>
    </div>
  )
}

export default TramitesPage
