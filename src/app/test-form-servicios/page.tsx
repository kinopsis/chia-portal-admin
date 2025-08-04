'use client'

import React, { useState } from 'react'
import { UnifiedServiceForm } from '@/components/organisms/UnifiedServiceForm/UnifiedServiceForm'
import { UnifiedServicesService } from '@/services/unifiedServices'
import type { CreateServiceData, UnifiedServiceItem } from '@/services/unifiedServices'
import type { Dependencia, Subdependencia } from '@/types'

export default function TestFormServiciosPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [createdService, setCreatedService] = useState<UnifiedServiceItem | null>(null)

  const unifiedService = new UnifiedServicesService()

  // Datos de prueba para dependencias y subdependencias
  const dependencias: Dependencia[] = [
    { id: 'c96b6c58-c29f-4f2a-8b06-fcb6f16118aa', nombre: 'Secretaria de Planeacion', codigo: '010', activo: true, created_at: '', updated_at: '' },
    { id: '40b8c8e8-8b8a-4f2a-8b06-fcb6f16118bb', nombre: 'Secretaria de Hacienda', codigo: '040', activo: true, created_at: '', updated_at: '' },
    { id: '50b8c8e8-8b8a-4f2a-8b06-fcb6f16118cc', nombre: 'Secretaria de Salud', codigo: '080', activo: true, created_at: '', updated_at: '' }
  ]

  const subdependencias: Subdependencia[] = [
    { id: 'e5f515ea-89e7-4ddd-abc3-c4936df2a329', nombre: 'Dirección de Servicios Públicos', codigo: '012', dependencia_id: 'c96b6c58-c29f-4f2a-8b06-fcb6f16118aa', activo: true, created_at: '', updated_at: '' },
    { id: 'f5f515ea-89e7-4ddd-abc3-c4936df2a330', nombre: 'Dirección de Rentas', codigo: '041', dependencia_id: '40b8c8e8-8b8a-4f2a-8b06-fcb6f16118bb', activo: true, created_at: '', updated_at: '' },
    { id: 'g5f515ea-89e7-4ddd-abc3-c4936df2a331', nombre: 'Dirección de Salud Publica', codigo: '081', dependencia_id: '50b8c8e8-8b8a-4f2a-8b06-fcb6f16118cc', activo: true, created_at: '', updated_at: '' }
  ]

  const handleCreateSubmit = async (data: CreateServiceData) => {
    setLoading(true)
    setMessage('')
    
    try {
      console.log('🧪 Datos enviados para crear servicio:', data)
      
      const newService = await unifiedService.create(data)
      
      console.log('✅ Servicio creado exitosamente:', newService)
      setCreatedService(newService)
      setMessage(`✅ Servicio "${newService.nombre}" creado exitosamente con código: ${newService.codigo}`)
      setMessageType('success')
    } catch (error: any) {
      console.error('❌ Error creando servicio:', error)
      setMessage(`❌ Error: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setMessage('')
    setCreatedService(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Prueba de Formulario de Servicios Unificados
          </h1>
          <p className="text-gray-600">
            Prueba end-to-end del formulario UnifiedServiceForm con validaciones completas
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Created Service Info */}
        {createdService && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Servicio Creado:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>ID:</strong> {createdService.id}</div>
              <div><strong>Código:</strong> {createdService.codigo}</div>
              <div><strong>Nombre:</strong> {createdService.nombre}</div>
              <div><strong>Tipo:</strong> {createdService.tipo_servicio}</div>
              <div><strong>Categoría:</strong> {createdService.categoria}</div>
              <div><strong>Estado:</strong> {createdService.activo ? 'Activo' : 'Inactivo'}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Crear Nuevo Servicio
            </h2>
            
            <UnifiedServiceForm
              mode="create"
              dependencias={dependencias}
              subdependencias={subdependencias}
              onSubmit={handleCreateSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">📝 Instrucciones de Prueba:</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Tipo:</strong> Selecciona 'tramite' o 'opa'</li>
            <li>• <strong>Nombre:</strong> Ingresa un nombre descriptivo (ej: "Certificado de Prueba E2E")</li>
            <li>• <strong>Categoría:</strong> Selecciona una categoría válida (ej: "atencion_ciudadana")</li>
            <li>• <strong>Subdependencia:</strong> Selecciona una subdependencia de la lista</li>
            <li>• <strong>Requisitos:</strong> Agrega al menos 2 requisitos usando el botón "+"</li>
            <li>• <strong>Tiempo de respuesta:</strong> Ej: "2 días hábiles"</li>
            <li>• <strong>Pago:</strong> Selecciona si requiere pago o es gratuito</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
