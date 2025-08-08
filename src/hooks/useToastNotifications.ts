'use client'

/**
 * useToastNotifications Hook
 * Provides convenient methods for showing toast notifications
 * with consistent messaging patterns for the application
 */

import { useToast } from '@/components/ui/toast'

export function useToastNotifications() {
  const { addToast } = useToast()

  const showSuccess = (title: string, message?: string, duration?: number) => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: duration ?? 5000
    })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: duration ?? 7000 // Errors stay longer
    })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: duration ?? 5000
    })
  }

  // Specific notification patterns for common actions
  const showServiceCreated = (serviceName: string, serviceCode: string) => {
    return showSuccess(
      'Servicio creado exitosamente',
      `"${serviceName}" ha sido creado con el código ${serviceCode}`,
      6000
    )
  }

  const showServiceUpdated = (serviceName: string) => {
    return showSuccess(
      'Servicio actualizado',
      `"${serviceName}" ha sido actualizado correctamente`
    )
  }

  const showServiceDeleted = (serviceName: string) => {
    return showSuccess(
      'Servicio eliminado',
      `"${serviceName}" ha sido eliminado correctamente`
    )
  }

  const showServiceToggled = (serviceName: string, isActive: boolean) => {
    return showSuccess(
      `Servicio ${isActive ? 'activado' : 'desactivado'}`,
      `"${serviceName}" ha sido ${isActive ? 'activado' : 'desactivado'} correctamente`
    )
  }

  const showServiceError = (action: string, serviceName?: string, error?: string) => {
    const baseMessage = serviceName ? `Error al ${action} "${serviceName}"` : `Error al ${action} servicio`
    return showError(
      baseMessage,
      error || 'Por favor, intenta de nuevo o contacta al administrador'
    )
  }

  const showNetworkError = () => {
    return showError(
      'Error de conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    )
  }

  const showValidationError = (message: string) => {
    return showError(
      'Error de validación',
      message
    )
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showServiceCreated,
    showServiceUpdated,
    showServiceDeleted,
    showServiceToggled,
    showServiceError,
    showNetworkError,
    showValidationError
  }
}

export default useToastNotifications
