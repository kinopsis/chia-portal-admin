'use client'

import { useAuth } from '@/hooks'
import { Card, Button, AuthenticatedRoute, RoleGuard } from '@/components'

function DashboardContent() {
  const { userProfile } = useAuth()

  if (!userProfile) {
    return (
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Cargando perfil de usuario...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido, {userProfile.nombre}!</h1>
          <p className="text-gray-600 mt-2">
            Panel de control del Portal de Atención Ciudadana de Chía
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mi Perfil</h3>
              <p className="text-gray-600 text-sm mb-4">
                Gestiona tu información personal y configuración de cuenta
              </p>
              <Button variant="outline" size="sm" fullWidth>
                Ver Perfil
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mis Trámites</h3>
              <p className="text-gray-600 text-sm mb-4">
                Consulta el estado de tus trámites y solicitudes
              </p>
              <Button variant="outline" size="sm" fullWidth>
                Ver Trámites
              </Button>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Soporte</h3>
              <p className="text-gray-600 text-sm mb-4">
                Obtén ayuda y contacta con nuestro equipo de soporte
              </p>
              <Button variant="outline" size="sm" fullWidth>
                Contactar
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Información de la Cuenta</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">
                  {userProfile.nombre} {userProfile.apellido}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{userProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rol:</span>
                <span className="font-medium capitalize">{userProfile.rol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span
                  className={`font-medium ${userProfile.activo ? 'text-green-600' : 'text-red-600'}`}
                >
                  {userProfile.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Miembro desde:</span>
                <span className="font-medium">
                  {new Date(userProfile.created_at).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
            <div className="space-y-3">
              <Button variant="ghost" fullWidth className="justify-start">
                📄 Consultar Trámites
              </Button>
              <Button variant="ghost" fullWidth className="justify-start">
                ⚡ Ver OPAs
              </Button>
              <Button variant="ghost" fullWidth className="justify-start">
                ❓ Preguntas Frecuentes
              </Button>
              <Button variant="ghost" fullWidth className="justify-start">
                🏛️ Dependencias
              </Button>
              <RoleGuard allowedRoles={['funcionario', 'admin']}>
                <Button variant="ghost" fullWidth className="justify-start">
                  ⚙️ Panel de Administración
                </Button>
              </RoleGuard>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthenticatedRoute>
      <DashboardContent />
    </AuthenticatedRoute>
  )
}
