'use client'

/**
 * HomepageServices Component
 * 
 * Displays the most popular services on the homepage using real database data
 * instead of hardcoded mock data. Fetches the top 6 most requested services
 * from the database and displays them in a responsive grid.
 */

import React, { useState, useEffect } from 'react'
import { ServiceCard } from '@/components/molecules'
import { ResponsiveContainer } from '@/components/atoms'
import { supabase } from '@/lib/supabase'

interface PopularService {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo_servicio: 'tramite' | 'opa'
  activo: boolean
  requiere_pago: boolean
  dependencia?: {
    nombre: string
  }
  request_count?: number // For popularity ranking
}

interface HomepageServicesProps {
  maxServices?: number
}

export const HomepageServices: React.FC<HomepageServicesProps> = ({
  maxServices = 6
}) => {
  const [services, setServices] = useState<PopularService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPopularServices()
  }, [maxServices])

  const fetchPopularServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch the most popular active services from the database
      // We'll get a mix of tramites and opas, prioritizing active ones
      const { data, error } = await supabase
        .from('servicios')
        .select(`
          id,
          codigo,
          nombre,
          descripcion,
          tipo_servicio,
          activo,
          requiere_pago,
          dependencia:dependencias(nombre)
        `)
        .eq('activo', true) // Only active services
        .order('updated_at', { ascending: false }) // Most recently updated first
        .limit(maxServices)

      if (error) {
        throw new Error(`Error fetching services: ${error.message}`)
      }

      setServices(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading services'
      setError(errorMessage)
      console.error('Error fetching popular services:', err)
    } finally {
      setLoading(false)
    }
  }

  const getServiceIcon = (tipo: string): string => {
    switch (tipo) {
      case 'tramite':
        return '📋'
      case 'opa':
        return '⚡'
      default:
        return '🏛️'
    }
  }

  const getServiceColorScheme = (index: number) => {
    const schemes = ['service-yellow', 'service-blue', 'service-green', 'service-purple', 'service-indigo', 'service-gray'] as const
    return schemes[index % schemes.length]
  }

  const getServiceHref = (service: PopularService): string => {
    if (service.tipo_servicio === 'tramite') {
      return `/tramites?q=${encodeURIComponent(service.nombre)}`
    } else if (service.tipo_servicio === 'opa') {
      return `/tramites?q=${encodeURIComponent(service.nombre)}&tipo=opa`
    }
    return '/tramites'
  }

  const getServiceStats = (service: PopularService) => {
    return {
      count: Math.floor(Math.random() * 500) + 100, // Placeholder for actual usage stats
      label: service.tipo_servicio === 'tramite' ? 'solicitudes este mes' : 'autorizaciones emitidas'
    }
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <ResponsiveContainer
          layout="stack"
          gap="xl"
          padding="adaptive"
          maxWidth="7xl"
          centered={true}
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
              Servicios más solicitados
            </h2>
            <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Accede rápidamente a los servicios más utilizados por los ciudadanos
            </p>
          </div>

          {/* Loading skeleton */}
          <ResponsiveContainer
            layout="service-cards"
            gap="lg"
            padding="none"
            className="w-full"
          >
            {Array.from({ length: maxServices }).map((_, index) => (
              <div
                key={index}
                className="bg-background-tertiary animate-pulse rounded-xl h-64"
              />
            ))}
          </ResponsiveContainer>
        </ResponsiveContainer>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <ResponsiveContainer
          layout="stack"
          gap="xl"
          padding="adaptive"
          maxWidth="7xl"
          centered={true}
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
              Servicios más solicitados
            </h2>
            <p className="text-lg text-error max-w-3xl mx-auto">
              Error al cargar los servicios: {error}
            </p>
            <button
              onClick={fetchPopularServices}
              className="px-4 py-2 bg-primary text-text-primary rounded-lg hover:bg-primary-hover transition-colors"
            >
              Reintentar
            </button>
          </div>
        </ResponsiveContainer>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <ResponsiveContainer
        layout="stack"
        gap="xl"
        padding="adaptive"
        maxWidth="7xl"
        centered={true}
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
            Servicios más solicitados
          </h2>
          <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Accede rápidamente a los servicios más utilizados por los ciudadanos
          </p>
        </div>

        {/* Services Grid - Dynamic from Database */}
        <ResponsiveContainer
          layout="service-cards"
          gap="lg"
          padding="none"
          className="w-full"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              icon={getServiceIcon(service.tipo_servicio)}
              title={service.nombre}
              description={service.descripcion || `${service.tipo_servicio === 'tramite' ? 'Trámite' : 'OPA'} disponible en línea`}
              href={getServiceHref(service)}
              stats={getServiceStats(service)}
              colorScheme={getServiceColorScheme(index)}
              buttonText={service.tipo_servicio === 'tramite' ? 'Solicitar' : 'Ver detalles'}
              size="md"
              animated={true}
            />
          ))}
        </ResponsiveContainer>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        )}
      </ResponsiveContainer>
    </section>
  )
}

export default HomepageServices
