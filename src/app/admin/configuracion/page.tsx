'use client'

import { useState } from 'react'
import { Card, Button, Badge } from '@/components/atoms'
import { Form, FormField } from '@/components/molecules'
import { RoleGuard } from '@/components/auth'

interface ConfigSection {
  id: string
  title: string
  description: string
  icon: string
  status: 'active' | 'inactive' | 'maintenance'
  settings: ConfigSetting[]
}

interface ConfigSetting {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select'
  value: any
  description?: string
  options?: { value: any; label: string }[]
}

export default function ConfiguracionAdminPage() {
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('general')

  // Mock configuration data - replace with real API calls
  const [configSections] = useState<ConfigSection[]>([
    {
      id: 'general',
      title: 'Configuración General',
      description: 'Configuraciones básicas del sistema',
      icon: '⚙️',
      status: 'active',
      settings: [
        {
          key: 'site_name',
          label: 'Nombre del Sitio',
          type: 'text',
          value: 'Portal Chía',
          description: 'Nombre que aparece en el encabezado del sitio',
        },
        {
          key: 'site_description',
          label: 'Descripción del Sitio',
          type: 'text',
          value: 'Portal de trámites y servicios de Chía',
          description: 'Descripción que aparece en metadatos',
        },
        {
          key: 'maintenance_mode',
          label: 'Modo Mantenimiento',
          type: 'boolean',
          value: false,
          description: 'Activar para mostrar página de mantenimiento',
        },
        {
          key: 'max_file_size',
          label: 'Tamaño Máximo de Archivo (MB)',
          type: 'number',
          value: 10,
          description: 'Tamaño máximo permitido para subir archivos',
        },
      ],
    },
    {
      id: 'auth',
      title: 'Autenticación',
      description: 'Configuraciones de seguridad y autenticación',
      icon: '🔐',
      status: 'active',
      settings: [
        {
          key: 'session_timeout',
          label: 'Tiempo de Sesión (minutos)',
          type: 'number',
          value: 60,
          description: 'Tiempo antes de cerrar sesión automáticamente',
        },
        {
          key: 'password_min_length',
          label: 'Longitud Mínima de Contraseña',
          type: 'number',
          value: 8,
          description: 'Número mínimo de caracteres para contraseñas',
        },
        {
          key: 'require_email_verification',
          label: 'Verificación de Email Requerida',
          type: 'boolean',
          value: true,
          description: 'Requerir verificación de email para nuevos usuarios',
        },
        {
          key: 'max_login_attempts',
          label: 'Intentos Máximos de Login',
          type: 'number',
          value: 5,
          description: 'Número máximo de intentos antes de bloquear cuenta',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configuraciones de notificaciones del sistema',
      icon: '📧',
      status: 'active',
      settings: [
        {
          key: 'email_notifications',
          label: 'Notificaciones por Email',
          type: 'boolean',
          value: true,
          description: 'Enviar notificaciones por correo electrónico',
        },
        {
          key: 'sms_notifications',
          label: 'Notificaciones por SMS',
          type: 'boolean',
          value: false,
          description: 'Enviar notificaciones por mensaje de texto',
        },
        {
          key: 'notification_frequency',
          label: 'Frecuencia de Notificaciones',
          type: 'select',
          value: 'immediate',
          description: 'Con qué frecuencia enviar notificaciones',
          options: [
            { value: 'immediate', label: 'Inmediata' },
            { value: 'hourly', label: 'Cada hora' },
            { value: 'daily', label: 'Diaria' },
            { value: 'weekly', label: 'Semanal' },
          ],
        },
      ],
    },
    {
      id: 'appointments',
      title: 'Citas',
      description: 'Configuraciones del sistema de citas',
      icon: '📅',
      status: 'maintenance',
      settings: [
        {
          key: 'appointment_duration',
          label: 'Duración de Cita (minutos)',
          type: 'number',
          value: 30,
          description: 'Duración predeterminada de las citas',
        },
        {
          key: 'advance_booking_days',
          label: 'Días de Anticipación',
          type: 'number',
          value: 30,
          description: 'Días máximos de anticipación para agendar citas',
        },
        {
          key: 'cancellation_hours',
          label: 'Horas para Cancelar',
          type: 'number',
          value: 24,
          description: 'Horas mínimas antes de la cita para cancelar',
        },
      ],
    },
  ])

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'success',
      inactive: 'neutral',
      maintenance: 'warning',
    } as const

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      maintenance: 'Mantenimiento',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} size="sm">
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const activeConfig = configSections.find((section) => section.id === activeSection)

  const getFormFields = (settings: ConfigSetting[]): FormField[] => {
    return settings.map((setting) => {
      const baseField: FormField = {
        name: setting.key,
        label: setting.label,
        type: setting.type === 'boolean' ? 'checkbox' : setting.type as FormField['type'],
        required: false,
      }

      if (setting.description) {
        baseField.helperText = setting.description
      }

      if (setting.options) {
        baseField.options = setting.options
      }

      return baseField
    })
  }

  const handleSaveConfig = async (formData: Record<string, any>, isValid: boolean) => {
    if (!isValid) return

    try {
      setLoading(true)

      // TODO: Implement configuration save

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert('Configuración guardada exitosamente')
    } catch (err) {
      console.error('Error saving configuration:', err)
      alert('Error al guardar la configuración')
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
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Administrar configuraciones del sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Secciones</h3>
              <nav className="space-y-2">
                {configSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{section.icon}</span>
                        <span>{section.title}</span>
                      </div>
                      {getStatusBadge(section.status)}
                    </div>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeConfig && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <span>{activeConfig.icon}</span>
                      <span>{activeConfig.title}</span>
                    </h2>
                    <p className="text-gray-600 mt-1">{activeConfig.description}</p>
                  </div>
                  {getStatusBadge(activeConfig.status)}
                </div>

                {activeConfig.status === 'maintenance' ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sección en Mantenimiento
                    </h3>
                    <p className="text-gray-600">
                      Esta sección está temporalmente deshabilitada para mantenimiento.
                    </p>
                  </div>
                ) : (
                  <Form
                    fields={getFormFields(activeConfig.settings)}
                    onSubmit={handleSaveConfig}
                    initialData={activeConfig.settings.reduce(
                      (acc, setting) => {
                        acc[setting.key] = setting.value
                        return acc
                      },
                      {} as Record<string, any>
                    )}
                    validateOnChange
                    validateOnBlur
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={loading}
                      className="w-full sm:w-auto"
                    >
                      Guardar Configuración
                    </Button>
                  </Form>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* System Info */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Versión</p>
              <p className="text-lg font-semibold text-gray-900">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Última Actualización</p>
              <p className="text-lg font-semibold text-gray-900">15 Ene 2024</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estado del Sistema</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-lg font-semibold text-gray-900">Operativo</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </RoleGuard>
  )
}
