'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import { SearchBar, MetricCard } from '@/components'
import { useHomepageMetrics } from '@/hooks/useHomepageMetrics'

export default function Home() {
  const { metrics, loading, error } = useHomepageMetrics()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Redirect to unified search page with query parameter
      window.location.href = `/tramites?q=${encodeURIComponent(query.trim())}`
    }
  }

  const popularSearches = ['Certificados', 'Licencias', 'Pagos', 'Permisos']

  return (
    <div className="bg-gradient-to-br from-primary-yellow/10 to-primary-green/10">
      <div className="container-custom py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Portal de Atención Ciudadana
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-green mb-8">
            Alcaldía de Chía
          </h2>
          <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
            Servicios municipales al alcance de todos. El asistente virtual te guía paso a paso en
            tus trámites y consultas.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <SearchBar
              placeholder="Buscar trámite, OPA, ayuda..."
              onSearch={handleSearch}
              suggestions={popularSearches}
              showSuggestions={true}
            />

            {/* Popular Searches */}
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600 mr-2">Búsquedas populares:</span>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-red-600 mb-4">Error al cargar métricas: {error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary-green text-white rounded hover:bg-green-600"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              [
                {
                  icon: '🏛️',
                  number: metrics?.dependencias?.toString() || '0',
                  label: 'Dependencias activas',
                  color: 'primary' as const,
                },
                {
                  icon: '📂',
                  number: metrics?.subdependencias?.toString() || '0',
                  label: 'Subdependencias',
                  color: 'secondary' as const
                },
                {
                  icon: '📄',
                  number: metrics?.tramites?.toString() || '0',
                  label: 'Trámites disponibles',
                  color: 'success' as const,
                },
                {
                  icon: '⚡',
                  number: metrics?.opas?.toString() || '0',
                  label: 'OPAs gestionadas',
                  color: 'warning' as const
                },
                {
                  icon: '❓',
                  number: metrics?.faqs?.toString() || '0',
                  label: 'FAQs publicadas',
                  color: 'primary' as const
                },
              ].map((metric, index) => (
                <MetricCard
                  key={index}
                  icon={<span className="text-2xl">{metric.icon}</span>}
                  title={metric.label}
                  value={metric.number}
                  color={metric.color}
                />
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: '📋',
                title: 'Certificados',
                desc: 'Solicitar certificados',
                action: 'Ver más →',
              },
              { icon: '💰', title: 'Pagos', desc: 'Impuestos y tasas', action: 'Ver más →' },
              { icon: '🏗️', title: 'Permisos', desc: 'Construcción y obras', action: 'Ver más →' },
              { icon: '📞', title: 'Consultas', desc: 'Estado de trámites', action: 'Ver más →' },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <button
                  type="button"
                  className="text-primary-green font-medium hover:text-primary-green-alt"
                >
                  {service.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
