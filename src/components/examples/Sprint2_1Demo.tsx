// Sprint 2.1 Demo Component - Showcases implemented features
// Demonstrates intelligent search, typography hierarchy, and F-layout pattern

'use client'

import React, { useState } from 'react'
import { SearchBar, ResponsiveContainer, Card, Button } from '@/components'
import { useSmartSearch } from '@/hooks'
import { searchAnalyticsService } from '@/services/searchAnalytics'

export interface Sprint2_1DemoProps {
  className?: string
}

const Sprint2_1Demo: React.FC<Sprint2_1DemoProps> = ({ className }) => {
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Smart search hook demonstration (UX-007: Updated to 300ms debounce)
  const smartSearch = useSmartSearch(
    async (query: string) => {
      // Simulate search results with fuzzy matching
      const mockResults = [
        `Resultado para "${query}" - Certificado de Residencia`,
        `Resultado para "${query}" - Licencia de Construcción`,
        `Resultado para "${query}" - Permiso de Funcionamiento`,
        `Resultado para "${query}" - Trámite de Estratificación`,
        `Resultado para "${query}" - Impuesto Predial`,
      ]
      setSearchResults(mockResults)

      // Track search with result count
      await smartSearch.trackSearch(query, mockResults.length)
    },
    {
      debounceMs: 300, // UX-007: 300ms debounce for intelligent search
      maxSuggestions: 8,
      source: 'demo',
      enableAnalytics: true,
      enableSmartSuggestions: true
    }
  )

  const handleGetAnalytics = async () => {
    try {
      const summary = await searchAnalyticsService.getAnalyticsSummary(7)
      setAnalyticsData(summary)
    } catch (error) {
      console.error('Error getting analytics:', error)
    }
  }

  return (
    <ResponsiveContainer
      layout="stack"
      padding="adaptive"
      touchOptimized={true}
      className={className}
    >
      <div className="space-y-mobile-lg xs:space-y-8 sm:space-y-12">
        
        {/* Sprint 2.1: Typography Hierarchy Demo */}
        <section>
          <h1 className="text-display-xl font-bold text-gray-900 mb-mobile-md xs:mb-6">
            Sprint 2.1: Página Principal Optimizada
          </h1>
          
          <div className="space-y-mobile-sm xs:space-y-4">
            <h2 className="text-display-sm font-semibold text-primary-green">
              Funcionalidades Implementadas
            </h2>
            
            <div className="grid gap-mobile-sm xs:gap-4 sm:gap-6">
              <div>
                <h3 className="text-heading-lg font-medium text-gray-800 mb-2">
                  1. Búsqueda Inteligente con Autocompletado
                </h3>
                <p className="text-body-md text-gray-600 leading-relaxed">
                  Implementación de debounce de 500ms, integración con unifiedSearchService, 
                  sugerencias contextuales y analytics de búsquedas.
                </p>
              </div>
              
              <div>
                <h3 className="text-heading-lg font-medium text-gray-800 mb-2">
                  2. Jerarquía Visual Mejorada
                </h3>
                <p className="text-body-md text-gray-600 leading-relaxed">
                  Un solo H1 por página, tipografía escalada con ratio 1.25, 
                  y patrón F-layout en el hero section.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Search Demo */}
        <section>
          <Card className="p-mobile-md xs:p-6">
            <h2 className="text-heading-xl font-semibold text-gray-900 mb-mobile-md xs:mb-6">
              Demo: Búsqueda Inteligente
            </h2>
            
            <div className="space-y-mobile-md xs:space-y-6">
              <SearchBar
                placeholder="Prueba la búsqueda inteligente con tolerancia a errores..."
                onSearch={smartSearch.search}
                enableSmartSuggestions={true}
                debounceMs={300} // UX-007: 300ms debounce
                maxSuggestions={8}
                source="demo"
                showPopularSearches={true}
                showRecentSearches={true}
                onSuggestionClick={smartSearch.selectSuggestion}
                isLoading={smartSearch.isLoading}
              />
              
              {/* Search State Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-mobile-sm xs:gap-4">
                <div className="bg-gray-50 p-mobile-sm xs:p-4 rounded-lg">
                  <h4 className="text-heading-md font-medium text-gray-800 mb-2">
                    Estado de Búsqueda
                  </h4>
                  <div className="space-y-1 text-body-sm text-gray-600">
                    <p><strong>Query:</strong> "{smartSearch.query}"</p>
                    <p><strong>Debounced:</strong> "{smartSearch.debouncedQuery}"</p>
                    <p><strong>Sugerencias:</strong> {smartSearch.suggestions.length}</p>
                    <p><strong>Cargando:</strong> {smartSearch.isLoading ? 'Sí' : 'No'}</p>
                    <p><strong>Ha buscado:</strong> {smartSearch.hasSearched ? 'Sí' : 'No'}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-mobile-sm xs:p-4 rounded-lg">
                  <h4 className="text-heading-md font-medium text-gray-800 mb-2">
                    Sugerencias Activas
                  </h4>
                  <div className="space-y-1">
                    {smartSearch.suggestions.length > 0 ? (
                      smartSearch.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-body-sm text-gray-600">
                          {index + 1}. {suggestion}
                        </div>
                      ))
                    ) : (
                      <p className="text-body-sm text-gray-500 italic">
                        No hay sugerencias disponibles
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="bg-green-50 p-mobile-sm xs:p-4 rounded-lg">
                  <h4 className="text-heading-md font-medium text-green-800 mb-2">
                    Resultados de Búsqueda
                  </h4>
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <div key={index} className="text-body-sm text-green-700">
                        • {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Error Display */}
              {smartSearch.error && (
                <div className="bg-red-50 p-mobile-sm xs:p-4 rounded-lg">
                  <h4 className="text-heading-md font-medium text-red-800 mb-2">
                    Error
                  </h4>
                  <p className="text-body-sm text-red-700">{smartSearch.error}</p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Typography Scale Demo */}
        <section>
          <Card className="p-mobile-md xs:p-6">
            <h2 className="text-heading-xl font-semibold text-gray-900 mb-mobile-md xs:mb-6">
              Demo: Escala Tipográfica (Ratio 1.25)
            </h2>
            
            <div className="space-y-mobile-md xs:space-y-6">
              <div className="space-y-mobile-sm xs:space-y-4">
                <div className="text-display-xl font-bold text-gray-900">
                  Display XL - Hero Headlines
                </div>
                <div className="text-display-lg font-bold text-gray-800">
                  Display LG - Page Titles
                </div>
                <div className="text-display-md font-semibold text-gray-800">
                  Display MD - Section Headers
                </div>
                <div className="text-display-sm font-semibold text-gray-700">
                  Display SM - Subsection Headers
                </div>
                <div className="text-heading-xl font-medium text-gray-700">
                  Heading XL - Card Titles
                </div>
                <div className="text-heading-lg font-medium text-gray-600">
                  Heading LG - Component Titles
                </div>
                <div className="text-heading-md font-medium text-gray-600">
                  Heading MD - Small Headings
                </div>
                <div className="text-body-lg text-gray-600">
                  Body LG - Large body text for important content
                </div>
                <div className="text-body-md text-gray-600">
                  Body MD - Default body text for regular content
                </div>
                <div className="text-body-sm text-gray-500">
                  Body SM - Small body text for secondary information
                </div>
                <div className="text-caption text-gray-400">
                  Caption - For labels, captions, and metadata
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Analytics Demo */}
        <section>
          <Card className="p-mobile-md xs:p-6">
            <h2 className="text-heading-xl font-semibold text-gray-900 mb-mobile-md xs:mb-6">
              Demo: Analytics de Búsqueda
            </h2>
            
            <div className="space-y-mobile-md xs:space-y-6">
              <Button
                onClick={handleGetAnalytics}
                variant="primary"
                className="min-h-touch-sm"
              >
                Obtener Analytics de Búsqueda
              </Button>
              
              {analyticsData && (
                <div className="bg-blue-50 p-mobile-sm xs:p-4 rounded-lg">
                  <h4 className="text-heading-md font-medium text-blue-800 mb-2">
                    Resumen de Analytics (Últimos 7 días)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-mobile-sm xs:gap-4 text-body-sm text-blue-700">
                    <div>
                      <p><strong>Total de búsquedas:</strong> {analyticsData.totalSearches}</p>
                      <p><strong>Consultas únicas:</strong> {analyticsData.uniqueQueries}</p>
                      <p><strong>Promedio de resultados:</strong> {analyticsData.averageResultsPerSearch}</p>
                    </div>
                    <div>
                      <p><strong>Tasa sin resultados:</strong> {analyticsData.noResultsRate.toFixed(1)}%</p>
                      <p><strong>Términos populares:</strong> {analyticsData.popularTerms.length}</p>
                    </div>
                  </div>
                  
                  {analyticsData.popularTerms.length > 0 && (
                    <div className="mt-mobile-sm xs:mt-4">
                      <h5 className="text-heading-md font-medium text-blue-800 mb-2">
                        Términos Más Buscados
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.popularTerms.slice(0, 5).map((term: any, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-caption"
                          >
                            {term.term} ({term.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-wrap gap-mobile-sm xs:gap-4 justify-center">
          <Button
            onClick={smartSearch.clear}
            variant="outline"
            className="min-h-touch-sm"
          >
            Limpiar Búsqueda
          </Button>
          
          <Button
            onClick={() => smartSearch.search('certificados')}
            variant="secondary"
            className="min-h-touch-sm"
          >
            Buscar "certificados"
          </Button>
          
          <Button
            onClick={() => smartSearch.selectSuggestion('licencias', 'demo', 0)}
            variant="primary"
            className="min-h-touch-sm"
          >
            Seleccionar "licencias"
          </Button>
        </section>
      </div>
    </ResponsiveContainer>
  )
}

export default Sprint2_1Demo
