'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Textarea, Select } from '@/components/atoms'
import { SearchBar, Breadcrumb } from '@/components/molecules'
import { PageHeader } from '@/components/layout'
import type { BreadcrumbItem } from '@/components/molecules'
import { pqrsClientService } from '@/services/pqrs'
import { dependenciasClientService } from '@/services/dependencias'
import type { CreatePQRSData, PQRS, Dependencia } from '@/types'

interface PQRSForm {
  tipo: 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
  nombre: string
  email: string
  telefono: string
  dependencia_id: string
  asunto: string
  descripcion: string
}

const tiposPQRS = [
  { value: 'peticion', label: 'Petición' },
  { value: 'queja', label: 'Queja' },
  { value: 'reclamo', label: 'Reclamo' },
  { value: 'sugerencia', label: 'Sugerencia' },
]

// Dependencias will be loaded from API

export default function PQRSPage() {
  const [formData, setFormData] = useState<PQRSForm>({
    tipo: 'peticion',
    nombre: '',
    email: '',
    telefono: '',
    dependencia_id: '',
    asunto: '',
    descripcion: '',
  })
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdPQRS, setCreatedPQRS] = useState<PQRS | null>(null)
  const [error, setError] = useState<string | null>(null)

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'PQRS', href: '/pqrs' },
  ]

  // Load dependencias on component mount
  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        setLoading(true)
        const result = await dependenciasClientService.getAll({ activo: true })
        setDependencias(result.data)
      } catch (err) {
        console.error('Error loading dependencias:', err)
        setError('Error al cargar dependencias')
      } finally {
        setLoading(false)
      }
    }

    fetchDependencias()
  }, [])

  const handleInputChange = (field: keyof PQRSForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.nombre || !formData.email || !formData.dependencia_id || !formData.asunto || !formData.descripcion) {
        throw new Error('Todos los campos obligatorios deben ser completados')
      }

      // Create PQRS data
      const pqrsData: CreatePQRSData = {
        tipo: formData.tipo,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono || undefined,
        dependencia_id: formData.dependencia_id,
        asunto: formData.asunto,
        descripcion: formData.descripcion,
      }

      // Submit to API
      const result = await pqrsClientService.create(pqrsData)
      setCreatedPQRS(result)
      setShowSuccess(true)

      // Reset form
      setFormData({
        tipo: 'peticion',
        nombre: '',
        email: '',
        telefono: '',
        dependencia_id: '',
        asunto: '',
        descripcion: '',
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar PQRS'
      setError(errorMessage)
      console.error('Error submitting PQRS:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      setLoading(true)
      setError(null)

      // Search by radicado number first
      const pqrsByRadicado = await pqrsClientService.getByRadicado(query.trim())

      if (pqrsByRadicado) {
        // Found by radicado - show result
        alert(`PQRS encontrada: ${pqrsByRadicado.asunto}\nEstado: ${pqrsByRadicado.estado}\nFecha: ${new Date(pqrsByRadicado.created_at).toLocaleDateString()}`)
      } else {
        // Search by general query
        const searchResults = await pqrsClientService.search({ query: query.trim(), limit: 10 })

        if (searchResults.data.length > 0) {
          alert(`Se encontraron ${searchResults.data.length} PQRS relacionadas con "${query}"`)
        } else {
          alert(`No se encontraron PQRS con el término "${query}"`)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la búsqueda'
      setError(errorMessage)
      console.error('Error searching PQRS:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="PQRS - Peticiones, Quejas, Reclamos y Sugerencias"
          description="Sistema de atención ciudadana de la Alcaldía de Chía"
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container-custom py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center p-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡PQRS Enviada Exitosamente!
              </h2>
              <p className="text-gray-600 mb-6">
                Su solicitud ha sido recibida y será procesada en un plazo máximo de 15 días hábiles.
                Recibirá una notificación por correo electrónico con el número de radicado.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  <strong>Número de radicado:</strong> {createdPQRS?.numero_radicado || 'N/A'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowSuccess(false)}
                  className="w-full sm:w-auto"
                >
                  Enviar Nueva PQRS
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="PQRS - Peticiones, Quejas, Reclamos y Sugerencias"
        description="Sistema de atención ciudadana de la Alcaldía de Chía"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Section */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Consultar Estado de PQRS
            </h3>
            <SearchBar
              placeholder="Buscar por número de radicado, asunto o estado..."
              onSearch={handleSearch}
              className="mb-4"
            />
            <p className="text-sm text-gray-600">
              Ingrese el número de radicado para consultar el estado de su PQRS
            </p>
          </Card>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Qué es PQRS?
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong className="text-primary-green">Petición:</strong> Solicitud de información o actuación administrativa
                </div>
                <div>
                  <strong className="text-primary-green">Queja:</strong> Manifestación de inconformidad por un servicio
                </div>
                <div>
                  <strong className="text-primary-green">Reclamo:</strong> Solicitud de corrección de una situación irregular
                </div>
                <div>
                  <strong className="text-primary-green">Sugerencia:</strong> Propuesta para mejorar los servicios
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tiempos de Respuesta
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>Peticiones:</strong> 15 días hábiles
                </div>
                <div>
                  <strong>Quejas y Reclamos:</strong> 15 días hábiles
                </div>
                <div>
                  <strong>Sugerencias:</strong> 30 días hábiles
                </div>
                <div className="mt-4 p-3 bg-primary-yellow/10 rounded-lg">
                  <strong className="text-primary-green">Nota:</strong> Recibirá confirmación por correo electrónico
                </div>
              </div>
            </Card>
          </div>

          {/* PQRS Form */}
          <Card>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Enviar Nueva PQRS
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="text-red-400 text-xl mr-3">⚠️</div>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tipo de PQRS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de PQRS *
                </label>
                <Select
                  value={formData.tipo}
                  onChange={(value) => handleInputChange('tipo', value as PQRSForm['tipo'])}
                  options={tiposPQRS}
                  placeholder="Seleccione el tipo de PQRS"
                  required
                />
              </div>

              {/* Información Personal */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingrese su nombre completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dependencia *
                  </label>
                  <Select
                    value={formData.dependencia_id}
                    onChange={(value) => handleInputChange('dependencia_id', value)}
                    options={[
                      { value: '', label: 'Seleccione la dependencia' },
                      ...dependencias.map(dep => ({
                        value: dep.id,
                        label: dep.nombre
                      }))
                    ]}
                    placeholder="Seleccione la dependencia"
                    required
                    disabled={loading}
                  />
                  {loading && (
                    <p className="text-xs text-gray-500 mt-1">Cargando dependencias...</p>
                  )}
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto *
                </label>
                <Input
                  type="text"
                  value={formData.asunto}
                  onChange={(e) => handleInputChange('asunto', e.target.value)}
                  placeholder="Resumen del asunto de su PQRS"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Describa detalladamente su petición, queja, reclamo o sugerencia..."
                  rows={6}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({
                    tipo: 'peticion',
                    nombre: '',
                    email: '',
                    telefono: '',
                    dependencia: '',
                    asunto: '',
                    descripcion: '',
                  })}
                >
                  Limpiar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={
                    isSubmitting ||
                    loading ||
                    !formData.nombre ||
                    !formData.email ||
                    !formData.dependencia_id ||
                    !formData.asunto ||
                    !formData.descripcion
                  }
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar PQRS'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
