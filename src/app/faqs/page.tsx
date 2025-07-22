'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge } from '@/components/atoms'
import { SearchBar, Breadcrumb, MetricCard } from '@/components/molecules'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { faqsClientService } from '@/services/faqs'
import type { FAQ } from '@/types'

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
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string>('')

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'FAQ', href: '/faqs' },
  ]

  // Fetch FAQs data
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await faqsClientService.getAll({
          activo: true,
          includeDependencias: true,
          includeSubdependencias: true
        })

        setFaqs(result.data)

        // Generate categories from FAQ data
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

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar FAQs'
        setError(errorMessage)
        console.error('Error fetching FAQs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
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

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory ||
      (faq.tema === selectedCategory || faq.categoria === selectedCategory)

    const matchesSearch = !searchQuery ||
      faq.pregunta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.respuesta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.palabras_clave && faq.palabras_clave.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))

    return matchesCategory && matchesSearch
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

  const totalFAQs = faqs.length

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
              value="12"
              icon="🏛️"
              color="yellow"
              description="Áreas municipales"
            />
          </div>

          {/* Search */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Buscar en Preguntas Frecuentes
            </h3>
            <SearchBar
              placeholder="Buscar en preguntas frecuentes..."
              onSearch={handleSearch}
              className="mb-4"
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Filtros:</span>
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
                {loading ? 'Cargando...' : `${filteredFAQs.length} resultado${filteredFAQs.length !== 1 ? 's' : ''}`}
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
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {expandedFAQ === faq.id ? '▼' : '▶'} {faq.pregunta}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>🏛️ {faq.dependencias?.nombre || 'Sin dependencia'}</span>
                          <span>📂 {faq.subdependencias?.nombre || 'General'}</span>
                          <span>🏷️ {faq.tema || faq.categoria || 'General'}</span>
                          {faq.palabras_clave && faq.palabras_clave.length > 0 && (
                            <div className="flex space-x-1">
                              {faq.palabras_clave.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">
                          {faq.respuesta}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            👍 ¿Te ayudó esta respuesta?
                          </Button>
                          <Button size="sm" variant="outline">
                            👎
                          </Button>
                        </div>
                        <Button size="sm" variant="primary">
                          Ver trámite completo →
                        </Button>
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
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('')
                  }}
                >
                  Limpiar filtros
                </Button>
              </Card>
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
