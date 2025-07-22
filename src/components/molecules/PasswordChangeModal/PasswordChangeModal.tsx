'use client'

import React, { useState } from 'react'
import { User } from '@/types'
import { usersService } from '@/services'

export interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Send password reset email instead of direct password change
      await usersService.sendPasswordReset(user.email)

      console.log('Password reset email sent for user:', user.email)
      setSuccess(true)

      // Show success message for a moment, then close
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setSuccess(false)
        setNewPassword('')
        setConfirmPassword('')
      }, 3000)
    } catch (err) {
      console.error('Error sending password reset:', err)
      setError(err instanceof Error ? err.message : 'Error al enviar el correo de restablecimiento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      setSuccess(false)
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Restablecer Contraseña - {user?.nombre || 'Usuario'}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.nombre?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.nombre || 'Usuario'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.rol}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-green-400">✅</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">Correo de restablecimiento enviado exitosamente</p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Reset Confirmation */}
            {!success && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">📧</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Se enviará un correo electrónico de restablecimiento de contraseña a <strong>{user?.email}</strong>
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      El usuario recibirá un enlace para crear una nueva contraseña.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400">🔒</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota de Seguridad:</strong> El usuario recibirá un enlace seguro para restablecer su contraseña.
                    El enlace expirará en 24 horas por seguridad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handlePasswordChange}
              disabled={isLoading || success}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading
                ? 'Enviando...'
                : success
                  ? '✅ Correo Enviado'
                  : 'Enviar Correo de Restablecimiento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordChangeModal
