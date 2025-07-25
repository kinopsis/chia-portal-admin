'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, Select } from '@/components/atoms'
import { SearchBar, Breadcrumb, MetricCard } from '@/components/molecules'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { faqsClientService } from '@/services/faqs'
import { dependenciasClientService } from '@/services/dependencias'
import type { FAQ, Dependencia } from '@/types'

interface FAQCategory {
  id: string
  nombre: string
  descripcion: string
  icon: string
  count: number
}

// Categories will be generated from real FAQ data

// Remove mock data - will use real data from faqsClientService

export default function FAQsPage() {
  // FAQ data state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDependencia, setSelectedDependencia] = useState('')
  const [selectedSubdependencia, setSelectedSubdependencia] = useState('')
  const [selectedTema, setSelectedTema] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string>('')

  // Hierarchical data state
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [availableSubdependencias, setAvailableSubdependencias] = useState<string[]>([])
  const [availableTemas, setAvailableTemas] = useState<string[]>([])

  // Loading states for dropdowns
  const [dependenciasLoading, setDependenciasLoading] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const itemsPerPage = 20

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'FAQ', href: '/faqs' },
  ]

  // Fetch FAQs data with hierarchical filtering
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build filters object
        const filters: any = {
          activo: true,
          includeDependencias: true,
          includeSubdependencias: true,
          page: currentPage,
          limit: itemsPerPage
        }

        // Add hierarchical filters
        if (selectedDependencia) {
          // Find dependencia by name and use its ID
          const dependencia = dependencias.find(dep => dep.nombre === selectedDependencia)
          if (dependencia) {
            filters.dependencia_id = dependencia.id
          }
        }

        if (selectedSubdependencia) {
          filters.subdependencia_nombre = selectedSubdependencia
        }

        if (selectedTema) {
          filters.tema = selectedTema
        }

        if (searchQuery) {
          filters.query = searchQuery
        }

        const result = await faqsClientService.getAll(filters)

        setFaqs(result.data)
        setTotalResults(result.count || 0)
        setTotalPages(Math.ceil((result.count || 0) / itemsPerPage))

        // Generate categories from FAQ data (for backward compatibility)
        const categoryMap = new Map<string, { count: number; dependencia: string }>()

        result.data.forEach(faq => {
          const categoria = faq.tema || faq.categoria || 'general'
          const existing = categoryMap.get(categoria) || { count: 0, dependencia: '' }
          categoryMap.set(categoria, {
            count: existing.count + 1,
            dependencia: faq.dependencias?.nombre || 'Sin dependencia'
          })
        })

        const generatedCategories: FAQCategory[] = Array.from(categoryMap.entries()).map(([categoria, data]) => ({
          id: categoria,
          nombre: categoria.charAt(0).toUpperCase() + categoria.slice(1),
          descripcion: `Preguntas sobre ${categoria}`,
          icon: getCategoryIcon(categoria),
          count: data.count
        }))

        setCategories(generatedCategories)

        // Extract available subdependencias and temas from FAQ data
        const subdependenciasSet = new Set<string>()
        const temasSet = new Set<string>()

        result.data.forEach(faq => {
          // Only include subdependencias from the selected dependencia
          if (faq.subdependencias?.nombre &&
              (!selectedDependencia || faq.dependencias?.nombre === selectedDependencia)) {
            subdependenciasSet.add(faq.subdependencias.nombre)
          }
          // Only include temas from the selected subdependencia
          if (faq.tema &&
              (!selectedSubdependencia || faq.subdependencias?.nombre === selectedSubdependencia)) {
            temasSet.add(faq.tema)
          }
        })

        setAvailableSubdependencias(Array.from(subdependenciasSet).sort())
        setAvailableTemas(Array.from(temasSet).sort())

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar FAQs'
        setError(errorMessage)
        console.error('Error fetching FAQs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [searchQuery, selectedDependencia, selectedSubdependencia, selectedTema, currentPage, dependencias])

  // Load dependencias on component mount
  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        setDependenciasLoading(true)
        const result = await dependenciasClientService.getAll({ activo: true, limit: 1000 })
        setDependencias(result.data)
      } catch (err) {
        console.error('Error fetching dependencias:', err)
        setDependencias([])
      } finally {
        setDependenciasLoading(false)
      }
    }

    fetchDependencias()
  }, [])

  // Load all available subdependencias and temas on component mount
  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        const result = await faqsClientService.getAll({
          activo: true,
          includeDependencias: true,
          includeSubdependencias: true,
          limit: 1000 // Get all FAQs to extract all options
        })

        const allSubdependencias = new Set<string>()
        const allTemas = new Set<string>()

        result.data.forEach(faq => {
          if (faq.subdependencias?.nombre) {
            allSubdependencias.add(faq.subdependencias.nombre)
          }
          if (faq.tema) {
            allTemas.add(faq.tema)
          }
        })

        // Only set if no filters are applied (initial load)
        if (!selectedDependencia && !selectedSubdependencia) {
          setAvailableSubdependencias(Array.from(allSubdependencias).sort())
          setAvailableTemas(Array.from(allTemas).sort())
        }
      } catch (err) {
        console.error('Error fetching all options:', err)
      }
    }

    fetchAllOptions()
  }, [])



  // Helper function to get category icons
  const getCategoryIcon = (categoria: string): string => {
    const iconMap: Record<string, string> = {
      construccion: '🏗️',
      pagos: '💰',
      certificados: '📋',
      tramites: '🏛️',
      salud: '🏥',
      ambiente: '🌱',
      general: '❓',
      impuestos: '💳',
      licencias: '📄',
      servicios: '🔧'
    }
    return iconMap[categoria.toLowerCase()] || '❓'
  }

  // Client-side filtering for legacy category support
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory ||
      (faq.tema === selectedCategory || faq.categoria === selectedCategory)
    return matchesCategory
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
  }

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? '' : faqId)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedDependencia('')
    setSelectedSubdependencia('')
    setSelectedTema('')
    setCurrentPage(1)
  }

  // Prepare options for dropdowns
  const dependenciasOptions = [
    { value: '', label: 'Todas las dependencias' },
    ...dependencias.map(dep => ({ value: dep.nombre, label: dep.nombre }))
  ]

  const subdependenciasOptions = [
    { value: '', label: 'Todas las subdependencias' },
    ...availableSubdependencias.map(sub => ({ value: sub, label: sub }))
  ]

  const temasOptions = [
    { value: '', label: 'Todos los temas' },
    ...availableTemas.map(tema => ({ value: tema, label: tema }))
  ]

  const totalFAQs = totalResults || faqs.length

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Centro de Ayuda - FAQ"
        description="Encuentra respuestas a tus preguntas frecuentes"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Preguntas Frecuentes"
              value={totalFAQs}
              icon="❓"
              color="blue"
              description="Total de FAQs disponibles"
            />
            <MetricCard
              title="Categorías"
              value={categories.length}
              icon="🏷️"
              color="green"
              description="Temas organizados"
            />
            <MetricCard
              title="Dependencias"
              value={dependencias.length}
              icon="🏛️"
              color="yellow"
              description="Áreas municipales"
            />
          </div>

          {/* Search and Hierarchical Filters */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Buscar en Preguntas Frecuentes
            </h3>

            {/* Search Bar */}
            <SearchBar
              placeholder="Buscar en preguntas frecuentes..."
              onSearch={handleSearch}
              className="mb-4"
            />

            {/* Hierarchical Filters - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                value={selectedDependencia}
                onChange={(e) => {
                  setSelectedDependencia(e.target.value)
                  setSelectedSubdependencia('')
                  setSelectedTema('')
                }}
                options={dependenciasOptions}
                placeholder={dependenciasLoading ? "Cargando dependencias..." : "Filtrar por dependencia"}
                disabled={dependenciasLoading}
              />
              <Select
                value={selectedSubdependencia}
                onChange={(e) => {
                  setSelectedSubdependencia(e.target.value)
                  setSelectedTema('')
                }}
                options={subdependenciasOptions}
                placeholder="Filtrar por subdependencia"
                disabled={!selectedDependencia}
              />
              <Select
                value={selectedTema}
                onChange={(e) => setSelectedTema(e.target.value)}
                options={temasOptions}
                placeholder="Filtrar por tema"
                disabled={!selectedSubdependencia}
              />
            </div>

            {/* Action Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                🔄 Limpiar Filtros
              </Button>
              <div className="text-sm text-gray-600 flex items-center">
                {loading ? 'Cargando...' : `${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrados`}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedDependencia || selectedSubdependencia || selectedTema) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-800">🔍 Filtros activos:</span>
                    <div className="flex items-center space-x-2">
                      {selectedDependencia && (
                        <Badge variant="secondary" size="sm">
                          🏛️ {selectedDependencia}
                        </Badge>
                      )}
                      {selectedSubdependencia && (
                        <Badge variant="outline" size="sm">
                          📋 {selectedSubdependencia}
                        </Badge>
                      )}
                      {selectedTema && (
                        <Badge variant="primary" size="sm">
                          🏷️ {selectedTema}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    ✕ Limpiar
                  </Button>
                </div>
              </div>
            )}

            {/* Category Filter Buttons (Legacy) */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtros rápidos:</span>
              <Button
                variant={selectedCategory === '' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Todas
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  {category.icon} {category.nombre}
                </Button>
              ))}
            </div>
          </Card>

          {/* Categories Grid */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Categorías Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {category.nombre}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {category.descripcion}
                      </p>
                      <Badge variant="secondary">
                        {category.count} preguntas
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQs List */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedCategory
                  ? `${categories.find(c => c.id === selectedCategory)?.nombre} - Preguntas Frecuentes`
                  : 'Preguntas Más Populares'
                }
              </h3>
              <span className="text-sm text-gray-600">
                {loading ? 'Cargando...' : `${filteredFAQs.length} de ${totalResults} resultado${totalResults !== 1 ? 's' : ''}`}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                          <div className="flex space-x-4 mb-2">
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Error al cargar FAQs
                </h3>
                <p className="text-gray-600 mb-4">
                  {error}
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map(faq => (
                <Card key={faq.id} className="overflow-hidden">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Hierarchical Breadcrumb */}
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          {faq.dependencias?.nombre && (
                            <>
                              <span className="font-medium">{faq.dependencias.nombre}</span>
                              {faq.subdependencias?.nombre && (
                                <>
                                  <span className="mx-2">→</span>
                                  <span className="font-medium">{faq.subdependencias.nombre}</span>
                                  {faq.tema && (
                                    <>
                                      <span className="mx-2">→</span>
                                      <span className="font-medium text-blue-600">{faq.tema}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-3">
                          {expandedFAQ === faq.id ? '▼' : '▶'} {faq.pregunta}
                        </h4>

                        {/* Enhanced Hierarchical Structure Display */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {faq.dependencias && (
                            <Badge variant="secondary" size="sm">
                              🏛️ {faq.dependencias.nombre}
                            </Badge>
                          )}
                          {faq.subdependencias && (
                            <Badge variant="outline" size="sm">
                              📋 {faq.subdependencias.nombre}
                            </Badge>
                          )}
                          {faq.tema && (
                            <Badge variant="primary" size="sm">
                              🏷️ {faq.tema}
                            </Badge>
                          )}
                        </div>

                        {/* Keywords */}
                        {faq.palabras_clave && faq.palabras_clave.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs text-gray-500 mr-2">Palabras clave:</span>
                            {faq.palabras_clave.slice(0, 5).map(tag => (
                              <Badge key={tag} variant="outline" size="sm" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {faq.palabras_clave.length > 5 && (
                              <Badge variant="outline" size="sm" className="text-xs">
                                +{faq.palabras_clave.length - 5} más
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* FAQ Answer */}
                      <div className="prose prose-sm max-w-none mb-4">
                        <p className="text-gray-700 whitespace-pre-line">
                          {faq.respuesta}
                        </p>
                      </div>

                      {/* Additional Hierarchical Information */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">📍 Información de ubicación:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Dependencia:</span>
                            <p className="text-gray-800">{faq.dependencias?.nombre || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Subdependencia:</span>
                            <p className="text-gray-800">{faq.subdependencias?.nombre || 'No especificada'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Tema:</span>
                            <p className="text-gray-800">{faq.tema || 'General'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            👍 ¿Te ayudó esta respuesta?
                          </Button>
                          <Button size="sm" variant="outline">
                            👎
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            📋 Ver trámites relacionados
                          </Button>
                          <Button size="sm" variant="primary">
                            📞 Contactar dependencia
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                ))}
              </div>
            )}

            {!loading && !error && filteredFAQs.length === 0 && (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600 mb-4">
                  No hay preguntas frecuentes que coincidan con tu búsqueda.
                </p>
                <Button
                  variant="primary"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              </Card>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ◀ Anterior
                </Button>

                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const page = i + 1
                    const isCurrentPage = page === currentPage
                    return (
                      <Button
                        key={page}
                        variant={isCurrentPage ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente ▶
                </Button>

                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages} ({totalResults} resultados)
                </span>
              </div>
            )}
          </div>

          {/* Help Section */}
          <Card className="bg-gradient-to-r from-primary-yellow/10 to-primary-green/10">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿No encontraste tu respuesta?
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-4xl mb-2">🤖</div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Pregunta al Asistente Virtual
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Nuestro asistente con IA puede ayudarte con consultas específicas
                  </p>
                  <Button variant="primary">
                    Hacer una pregunta →
                  </Button>
                </div>
                <div>
                  <div className="text-4xl mb-2">📞</div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Contacta con un funcionario
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Habla directamente con nuestro equipo de atención
                  </p>
                  <Button variant="outline">
                    Ver opciones de contacto →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
