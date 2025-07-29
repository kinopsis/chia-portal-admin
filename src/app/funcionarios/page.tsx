'use client'

// Force dynamic rendering to avoid build-time data fetching issues
export const dynamic = 'force-dynamic'

import { PageHeader, DashboardStats, QuickActions, ActivityFeed, Card, Button } from '@/components'
import { ConnectionStatus } from '@/components/atoms/ConnectionStatus'
import { useAuth } from '@/hooks'
import Link from 'next/link'

function FuncionariosDashboard() {
  const { userProfile } = useAuth()

  // Breadcrumbs for funcionarios dashboard
  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Panel Funcionarios', href: '/funcionarios' },
  ]

  // Funcionario-specific modules
  const funcionarioModules = [
    {
      title: 'FAQs',
      description: 'Gestionar preguntas frecuentes',
      icon: '❓',
      color: 'red',
      href: '/funcionarios/faqs',
    },
    {
      title: 'Trámites',
      description: 'Configurar trámites y procedimientos',
      icon: '📋',
      color: 'yellow',
      href: '/funcionarios/tramites',
    },
    {
      title: 'OPAs',
      description: 'Administrar Órdenes de Pago y Autorización',
      icon: '⚡',
      color: 'purple',
      href: '/funcionarios/opas',
    },
    {
      title: 'Servicios',
      description: 'Gestionar servicios municipales',
      icon: '🏛️',
      color: 'blue',
      href: '/funcionarios/servicios',
    },
  ]

  return (
    <div>
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      <PageHeader
        title="Panel de Funcionarios"
        description="Gestión de contenido del Portal de Atención Ciudadana de Chía"
        breadcrumbs={breadcrumbs}
        variant="funcionario"
      />
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Dashboard Stats */}
          <DashboardStats />

          {/* Quick Actions */}
          <QuickActions />

          {/* Funcionario Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {funcionarioModules.map((module) => (
              <Card key={module.title} hover>
                <div className="text-center">
                  <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <span className={`text-${module.color}-600 text-xl`}>{module.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {module.description}
                  </p>
                  <Link href={module.href}>
                    <Button variant="outline" size="sm" fullWidth>
                      Gestionar
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Information Cards and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <ActivityFeed className="lg:col-span-1" />
            
            <Card>
              <h3 className="text-lg font-semibold mb-4">Estadísticas de Gestión</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trámites Gestionados:</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">OPAs Procesadas:</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">FAQs Publicadas:</span>
                  <span className="font-semibold">234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Servicios Activos:</span>
                  <span className="font-semibold">45</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Información del Funcionario</h3>
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
                  <span className="text-gray-600">Dependencia:</span>
                  <span className="font-medium">
                    {userProfile?.dependencia?.nombre || 'No asignada'}
                  </span>
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

export default FuncionariosDashboard
