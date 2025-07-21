'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@/components'
import { useAuth } from '@/hooks'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    const { error } = await signUp(formData.email, formData.password, {
      nombre: formData.nombre,
      apellido: formData.apellido,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow/10 to-primary-green/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, revisa tu
              bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <Link href="/auth/login">
              <Button variant="primary" size="lg" fullWidth>
                Ir al Login
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-yellow/10 to-primary-green/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">🏛️</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="mt-2 text-gray-600">Únete al Portal de Atención Ciudadana de Chía</p>
        </div>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan"
                required
                disabled={loading}
              />

              <Input
                label="Apellido"
                name="apellido"
                type="text"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
                disabled={loading}
              />
            </div>

            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              fullWidth
              disabled={loading}
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              helperText="Mínimo 8 caracteres"
              required
              fullWidth
              disabled={loading}
            />

            <Input
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              fullWidth
              disabled={loading}
            />

            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                Acepto los{' '}
                <Link href="/terminos" className="text-primary-green hover:text-primary-green-dark">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link
                  href="/privacidad"
                  className="text-primary-green hover:text-primary-green-dark"
                >
                  Política de Privacidad
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/auth/login">
                <Button variant="outline" size="lg" fullWidth>
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
