'use client'

/**
 * TramiteFooterInfo Component
 *
 * Footer component displaying key tramite information in 3 columns:
 * - Tiempo Respuesta
 * - Tiene Costo (Sí/No)
 * - Modalidad (Virtual/Presencial/Mixto)
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Clock, DollarSign, Monitor } from 'lucide-react'

export interface TramiteFooterInfoProps {
  /** Estimated response time */
  tiempoRespuesta?: string

  /** Whether the tramite has a cost */
  tieneCosto: boolean

  /** Processing modality */
  modalidad: 'virtual' | 'presencial' | 'mixto'

  /** Additional CSS classes */
  className?: string

  /** Test ID for testing */
  'data-testid'?: string
}

const modalidadConfig = {
  virtual: {
    label: 'Virtual',
    icon: '💻',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  presencial: {
    label: 'Presencial',
    icon: '🏢',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  mixto: {
    label: 'Mixto',
    icon: '🔄',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
}

export const TramiteFooterInfo: React.FC<TramiteFooterInfoProps> = ({
  tiempoRespuesta,
  tieneCosto,
  modalidad,
  className,
  'data-testid': testId,
}) => {
  const modalidadInfo = modalidadConfig[modalidad]

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background-secondary rounded-lg border border-border-medium',
        className
      )}
      data-testid={testId}
    >
      {/* Tiempo Respuesta */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Tiempo Respuesta
          </span>
        </div>
        <span className="text-sm font-semibold text-text-primary">
          {tiempoRespuesta || 'No especificado'}
        </span>
      </div>

      {/* Tiene Costo */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Tiene Costo
          </span>
        </div>
        <span
          className={cn(
            'text-sm font-semibold px-2 py-1 rounded-full',
            tieneCosto
              ? 'bg-warning-light text-warning-dark border border-warning-dark/20'
              : 'bg-success-light text-success-dark border border-success-dark/20'
          )}
        >
          {tieneCosto ? 'SÍ' : 'NO'}
        </span>
      </div>

      {/* Modalidad */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1">
          <Monitor className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Modalidad
          </span>
        </div>
        <span
          className={cn(
            'text-sm font-semibold px-2 py-1 rounded-full border border-border-medium flex items-center gap-1',
            modalidad === 'virtual'
              ? 'bg-info-light text-info-dark'
              : modalidad === 'presencial'
                ? 'bg-success-light text-success-dark'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
          )}
        >
          <span aria-hidden="true">{modalidadInfo.icon}</span>
          {modalidadInfo.label}
        </span>
      </div>
    </div>
  )
}

export default TramiteFooterInfo
