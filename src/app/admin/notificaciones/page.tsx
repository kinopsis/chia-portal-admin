'use client'

import { useState } from 'react'
import { Card, Button, Badge, Modal } from '@/components/atoms'
import { Form } from '@/components/molecules'
import { RoleGuard } from '@/components/auth'
import { FormField } from '@/types'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  target: 'all' | 'admins' | 'users' | 'specific'
  status: 'draft' | 'sent' | 'scheduled'
  created_at: string
  sent_at?: string
  scheduled_for?: string
}

export default function NotificacionesAdminPage() {
  const [loading, setLoading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data - replace with real API calls
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Mantenimiento Programado',
      message: 'El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 6:00 AM.',
      type: 'warning',
      target: 'all',
      status: 'sent',
      created_at: '2024-01-15T10:00:00Z',
      sent_at: '2024-01-15T10:05:00Z',
    },
    {
      id: '2',
      title: 'Nueva Funcionalidad',
      message: 'Ya está disponible la nueva funcionalidad de citas en línea.',
      type: 'success',
      target: 'users',
      status: 'draft',
      created_at: '2024-01-14T15:30:00Z',
    },
    {
      id: '3',
      title: 'Actualización de Seguridad',
      message: 'Se ha implementado una nueva actualización de seguridad.',
      type: 'info',
      target: 'admins',
      status: 'scheduled',
      created_at: '2024-01-13T09:00:00Z',
      scheduled_for: '2024-01-16T08:00:00Z',
    },
  ])

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'success',
      scheduled: 'warning',
    } as const

    const labels = {
      draft: 'Borrador',
      sent: 'Enviada',
      scheduled: 'Programada',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} size="sm">
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      info: 'primary',
      success: 'success',
      warning: 'warning',
      error: 'danger',
    } as const

    const labels = {
      info: 'Información',
      success: 'Éxito',
      warning: 'Advertencia',
      error: 'Error',
    }

    return (
      <Badge variant={variants[type as keyof typeof variants]} size="sm">
        {labels[type as keyof typeof labels]}
      </Badge>
    )
  }

  const getTargetLabel = (target: string) => {
    const labels = {
      all: 'Todos los usuarios',
      admins: 'Solo administradores',
      users: 'Solo usuarios',
      specific: 'Usuarios específicos',
    }

    return labels[target as keyof typeof labels] || target
  }

  const formFields: FormField[] = [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Título de la notificación',
    },
    {
      name: 'message',
      label: 'Mensaje',
      type: 'textarea',
      required: true,
      placeholder: 'Contenido de la notificación',
      rows: 4,
    },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar tipo', disabled: true },
        { value: 'info', label: 'Información' },
        { value: 'success', label: 'Éxito' },
        { value: 'warning', label: 'Advertencia' },
        { value: 'error', label: 'Error' },
      ],
    },
    {
      name: 'target',
      label: 'Destinatarios',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Seleccionar destinatarios', disabled: true },
        { value: 'all', label: 'Todos los usuarios' },
        { value: 'admins', label: 'Solo administradores' },
        { value: 'users', label: 'Solo usuarios' },
        { value: 'specific', label: 'Usuarios específicos' },
      ],
    },
    {
      name: 'scheduled_for',
      label: 'Programar para (opcional)',
      type: 'datetime-local',
      required: false,
      helpText: 'Dejar vacío para enviar inmediatamente',
    },
  ]

  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleSubmitCreate = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    try {
      setIsSubmitting(true)

      // TODO: Implement notification creation
      console.log('Creating notification:', formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsCreateModalOpen(false)
      alert('Notificación creada exitosamente')
    } catch (err) {
      console.error('Error creating notification:', err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendNotification = async (id: string) => {
    try {
      setLoading(true)

      // TODO: Implement send notification
      console.log('Sending notification:', id)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert('Notificación enviada exitosamente')
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Error al enviar la notificación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-gray-600">Gestionar notificaciones del sistema</p>
          </div>
          <Button variant="primary" onClick={handleCreate} className="flex items-center space-x-2">
            <span>➕</span>
            <span>Nueva Notificación</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📧</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Enviadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.filter((n) => n.status === 'sent').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Programadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.filter((n) => n.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 text-lg">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Borradores</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {notifications.filter((n) => n.status === 'draft').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones Recientes</h3>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        {getTypeBadge(notification.type)}
                        {getStatusBadge(notification.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Destinatarios: {getTargetLabel(notification.target)}</span>
                        <span>
                          Creada: {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {notification.sent_at && (
                          <span>
                            Enviada: {new Date(notification.sent_at).toLocaleDateString()}
                          </span>
                        )}
                        {notification.scheduled_for && (
                          <span>
                            Programada: {new Date(notification.scheduled_for).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status === 'draft' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSendNotification(notification.id)}
                          disabled={loading}
                        >
                          Enviar
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Crear Nueva Notificación"
          size="lg"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="create-notification-form"
                variant="primary"
                isLoading={isSubmitting}
              >
                Crear Notificación
              </Button>
            </>
          }
        >
          <Form
            id="create-notification-form"
            fields={formFields}
            onSubmit={handleSubmitCreate}
            validateOnChange
            validateOnBlur
          />
        </Modal>
      </div>
    </RoleGuard>
  )
}
