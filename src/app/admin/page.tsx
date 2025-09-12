'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

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
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Gestionar usuarios del sistema y sus roles
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-success text-xl">🏛️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Dependencias</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Administrar dependencias y subdependencias
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-warning text-xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Trámites</h3>
                <p className="text-text-secondary text-sm mb-4">Configurar trámites y procedimientos</p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-info text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">OPAs</h3>
                <p className="text-text-secondary text-sm mb-4">
                  Administrar Órdenes de Pago y Autorización
                </p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-error text-xl">❓</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">FAQs</h3>
                <p className="text-text-secondary text-sm mb-4">Gestionar preguntas frecuentes</p>
                <Button variant="outline" size="sm" fullWidth>
                  Gestionar
                </Button>
              </div>
            </Card>

            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sistema</h3>
                <p className="text-text-secondary text-sm mb-4">Configuración general del sistema</p>
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
                  <span className="text-text-secondary">Total Usuarios:</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Trámites Activos:</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">OPAs Gestionadas:</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">FAQs Publicadas:</span>
                  <span className="font-semibold">234</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Información del Administrador</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Nombre:</span>
                  <span className="font-medium">
                    {userProfile?.nombre} {userProfile?.apellido}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Email:</span>
                  <span className="font-medium">{userProfile?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Rol:</span>
                  <span className="font-medium capitalize">{userProfile?.rol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Último acceso:</span>
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
