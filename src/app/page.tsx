'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import { SearchBar, MetricCard, ResponsiveContainer, SkeletonLoader, ErrorMessage } from '@/components'
import { useHomepageMetrics } from '@/hooks/useHomepageMetrics'

export default function Home() {
  const { metrics, loading, error } = useHomepageMetrics()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Redirect to unified search page with query parameter
      window.location.href = `/tramites?q=${encodeURIComponent(query.trim())}`
    }
  }

  const handleSuggestionClick = (suggestion: string, type: string) => {
    // Track suggestion click and redirect
    handleSearch(suggestion)
  }

  const popularSearches = ['Certificados', 'Licencias', 'Pagos', 'Permisos']

  return (
    <div className="bg-gradient-to-br from-primary-yellow/10 to-primary-green/10">
      <ResponsiveContainer
        layout="stack"
        padding="adaptive"
        touchOptimized={true}
        className="container-custom py-mobile-lg xs:py-12 sm:py-16"
      >
        <div className="text-center space-y-mobile-md xs:space-y-6 sm:space-y-8">
          {/* Single H1 for SEO - Sprint 2.1 requirement */}
          <h1 className="text-display-md xs:text-display-lg sm:text-display-xl font-bold text-gray-900 leading-tight">
            Portal de Atención Ciudadana de Chía
          </h1>

          {/* Subtitle using semantic typography - no longer H2 for better hierarchy */}
          <p className="text-heading-lg xs:text-heading-xl font-semibold text-primary-green">
            Alcaldía Municipal
          </p>

          {/* Description with improved typography hierarchy */}
          <p className="text-body-lg xs:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Servicios municipales al alcance de todos. Accede a trámites, información y servicios
            de manera fácil, rápida y segura.
          </p>

          {/* Hero Search Bar - Enhanced with Sprint 2.1 Intelligence */}
          <div className="max-w-2xl mx-auto mb-mobile-lg xs:mb-12 sm:mb-16">
            <SearchBar
              placeholder="Buscar trámite, OPA, ayuda..."
              onSearch={handleSearch}
              suggestions={popularSearches}
              showSuggestions={true}
              // Sprint 2.1: Intelligent search features
              enableSmartSuggestions={true}
              debounceMs={500}
              maxSuggestions={8}
              source="homepage"
              showPopularSearches={true}
              showRecentSearches={true}
              onSuggestionClick={handleSuggestionClick}
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
          <ResponsiveContainer
            layout="grid"
            gridCols={{ xs: 2, sm: 3, md: 4, lg: 5 }}
            gap="md"
            className="mb-mobile-lg xs:mb-12 sm:mb-16"
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonLoader
                  key={index}
                  variant="card"
                  responsive={true}
                  animation="pulse"
                />
              ))
            ) : error ? (
              <div className="col-span-full">
                <ErrorMessage
                  message="Error al cargar métricas del sistema"
                  context={error}
                  type="network"
                  severity="error"
                  showRetry={true}
                  onRetry={() => window.location.reload()}
                />
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
          </ResponsiveContainer>

          {/* Sprint 2.1: F-Layout Pattern - Quick Actions Section */}
          <div className="mt-mobile-lg xs:mt-12 sm:mt-16">
            {/* Section Header with improved typography hierarchy */}
            <div className="text-center mb-mobile-md xs:mb-8 sm:mb-12">
              <h2 className="text-heading-xl xs:text-display-sm font-semibold text-gray-900 mb-mobile-xs xs:mb-4">
                Servicios Más Solicitados
              </h2>
              <p className="text-body-md xs:text-body-lg text-gray-600 max-w-2xl mx-auto">
                Accede rápidamente a los trámites y servicios más utilizados por los ciudadanos
              </p>
            </div>

            {/* F-Layout: Services Grid */}
            <ResponsiveContainer
              layout="grid"
              gridCols={{ xs: 1, sm: 2, md: 4 }}
              gap="lg"
            >
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
                className="bg-white p-mobile-md xs:p-6 rounded-lg shadow-md no-touch:hover:shadow-lg transition-shadow"
              >
                <div className="text-3xl xs:text-4xl mb-mobile-sm xs:mb-4" aria-hidden="true">
                  {service.icon}
                </div>
                <h3 className="text-heading-md xs:text-heading-lg font-semibold mb-2 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-body-sm xs:text-body-md text-gray-600 mb-mobile-sm xs:mb-4">
                  {service.desc}
                </p>
                <button
                  type="button"
                  className="min-h-touch-sm text-primary-green font-medium no-touch:hover:text-primary-green-alt focus:outline-none focus:ring-2 focus:ring-primary-green rounded px-2 py-1"
                  aria-label={`${service.action} - ${service.title}`}
                >
                  {service.action}
                </button>
              </div>
            ))}
            </ResponsiveContainer>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
