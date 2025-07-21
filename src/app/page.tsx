'use client'

import { SearchBar, MetricCard } from '@/components'

export default function Home() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query)
    // TODO: Implement search functionality
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
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {[
              {
                icon: '🏛️',
                number: '12',
                label: 'Dependencias activas',
                color: 'primary' as const,
              },
              { icon: '📂', number: '45', label: 'Subdependencias', color: 'secondary' as const },
              {
                icon: '📄',
                number: '156',
                label: 'Trámites disponibles',
                color: 'success' as const,
              },
              { icon: '⚡', number: '89', label: 'OPAs gestionadas', color: 'warning' as const },
              { icon: '❓', number: '234', label: 'FAQs publicadas', color: 'primary' as const },
            ].map((metric, index) => (
              <MetricCard
                key={index}
                icon={<span className="text-2xl">{metric.icon}</span>}
                title={metric.label}
                value={metric.number}
                color={metric.color}
              />
            ))}
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
