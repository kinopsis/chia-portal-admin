'use client'

import { PageHeader, DashboardStats, QuickActions, ActivityFeed, Card, Button } from '@/components'
import { ConnectionStatus } from '@/components/atoms/ConnectionStatus'
import { useAuth, useAdminBreadcrumbs } from '@/hooks'

function AdminDashboard() {
  const { userProfile } = useAuth()
  const breadcrumbs = useAdminBreadcrumbs()

  return (
    <div>
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      <PageHeader
        title="Panel de Administración"
        description="Gestión del Portal de Atención Ciudadana de Chía"
        breadcrumbs={breadcrumbs}
        variant="admin"
      />
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Quick Actions */}
          <QuickActions />

          {/* Additional Admin Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Gestionar usuarios del sistema y sus roles
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-xl">🏛️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Dependencias</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Administrar dependencias y subdependencias
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-yellow-600 text-xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Trámites</h3>
                <p className="text-gray-600 text-sm mb-4">Configurar trámites y procedimientos</p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">OPAs</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Administrar Órdenes de Pago y Autorización
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">❓</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">FAQs</h3>
                <p className="text-gray-600 text-sm mb-4">Gestionar preguntas frecuentes</p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 text-xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sistema</h3>
                <p className="text-gray-600 text-sm mb-4">Configuración general del sistema</p>
                <Button variant="outline" size="sm" fullWidth>
                  Configurar
                </Button>
              </div>
            </Card>
          </div>

          {/* Information Cards and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <ActivityFeed className="lg:col-span-1" />
            <Card>
              <h3 className="text-lg font-semibold mb-4">Estadísticas del Sistema</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Usuarios:</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trámites Activos:</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">OPAs Gestionadas:</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">FAQs Publicadas:</span>
                  <span className="font-semibold">234</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Información del Administrador</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">
                    {userProfile?.nombre} {userProfile?.apellido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{userProfile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rol:</span>
                  <span className="font-medium capitalize">{userProfile?.rol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Último acceso:</span>
                  <span className="font-medium">Ahora</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
