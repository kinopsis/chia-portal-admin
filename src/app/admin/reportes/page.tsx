'use client'

import { useState } from 'react'
import { Card, Button, Badge } from '@/components/atoms'
import { RoleGuard } from '@/components/auth'

export default function ReportesAdminPage() {
  const [loading, setLoading] = useState(false)

  const reportTypes = [
    {
      id: 'usuarios',
      title: 'Reporte de Usuarios',
      description: 'Estadísticas y listado completo de usuarios del sistema',
      icon: '👥',
      status: 'available',
    },
    {
      id: 'tramites',
      title: 'Reporte de Trámites',
      description: 'Análisis de trámites por estado, dependencia y período',
      icon: '📋',
      status: 'available',
    },
    {
      id: 'opas',
      title: 'Reporte de OPAs',
      description: 'Estadísticas de Órdenes de Pago y Autorización',
      icon: '💰',
      status: 'available',
    },
    {
      id: 'citas',
      title: 'Reporte de Citas',
      description: 'Análisis de citas agendadas, canceladas y completadas',
      icon: '📅',
      status: 'coming_soon',
    },
    {
      id: 'dependencias',
      title: 'Reporte de Dependencias',
      description: 'Estadísticas por dependencia y subdependencia',
      icon: '🏢',
      status: 'available',
    },
    {
      id: 'actividad',
      title: 'Reporte de Actividad',
      description: 'Log de actividades y acciones del sistema',
      icon: '📊',
      status: 'coming_soon',
    },
  ]

  const handleGenerateReport = async (reportId: string) => {
    setLoading(true)
    try {
      // TODO: Implement report generation
      console.log(`Generating report: ${reportId}`)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Download or display report
      alert(`Reporte ${reportId} generado exitosamente`)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar el reporte')
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
            <h1 className="text-2xl font-bold text-text-primary">Reportes</h1>
            <p className="text-text-secondary">Generar reportes y estadísticas del sistema</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                  <span className="text-info text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Reportes Disponibles</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {reportTypes.filter((r) => r.status === 'available').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <span className="text-success text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Generados Hoy</p>
                <p className="text-2xl font-semibold text-text-primary">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="text-warning text-lg">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">En Desarrollo</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {reportTypes.filter((r) => r.status === 'coming_soon').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                  <span className="text-info text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Reportes</p>
                <p className="text-2xl font-semibold text-text-primary">{reportTypes.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-background-secondary rounded-lg flex items-center justify-center">
                      <span className="text-xl">{report.icon}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-text-primary">{report.title}</h3>
                  </div>
                </div>
                <Badge variant={report.status === 'available' ? 'success' : 'warning'} size="sm">
                  {report.status === 'available' ? 'Disponible' : 'Próximamente'}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-text-secondary">{report.description}</p>

              <div className="mt-6">
                <Button
                  variant={report.status === 'available' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={report.status !== 'available' || loading}
                  isLoading={loading}
                  className="w-full"
                >
                  {report.status === 'available' ? 'Generar Reporte' : 'Próximamente'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-text-primary mb-4">Instrucciones</h3>
          <div className="space-y-3 text-sm text-text-secondary">
            <p>• Los reportes se generan en formato PDF y Excel según el tipo de información.</p>
            <p>• Los reportes incluyen datos actualizados hasta el momento de la generación.</p>
            <p>
              • Algunos reportes pueden tardar varios minutos en generarse dependiendo del volumen
              de datos.
            </p>
            <p>
              • Los reportes marcados como "Próximamente" estarán disponibles en futuras
              actualizaciones.
            </p>
          </div>
        </Card>
      </div>
    </RoleGuard>
  )
}
