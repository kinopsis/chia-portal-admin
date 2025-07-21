import Link from 'next/link'
import { Button, Card } from '@/components'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow/10 to-primary-green/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso No Autorizado</h1>

          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta
            con el administrador del sistema.
          </p>

          <div className="space-y-3">
            <Link href="/">
              <Button variant="primary" size="lg" fullWidth>
                Volver al Inicio
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="lg" fullWidth>
                Ir al Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda?{' '}
              <Link
                href="/contacto"
                className="text-primary-green hover:text-primary-green-dark font-medium"
              >
                Contacta con soporte
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
