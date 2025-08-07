'use client'

/**
 * TramiteBadgeSystem Component
 * 
 * Comprehensive badge system for displaying tramite/opa information
 * including type, payment status, modality, and active status
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/atoms'

export interface TramiteBadgeSystemProps {
  /** Service type */
  tipo: 'tramite' | 'opa'
  
  /** Whether service has payment */
  tienePago: boolean
  
  /** Processing modality */
  modalidad: 'virtual' | 'presencial' | 'mixto'
  
  /** Whether service is active */
  activo: boolean
  
  /** Layout variant */
  variant?: 'horizontal' | 'vertical'
  
  /** Additional CSS classes */
  className?: string
  
  /** Test ID for testing */
  'data-testid'?: string
}

const tipoConfig = {
  tramite: {
    label: 'Trámite',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  opa: {
    label: 'OPA',
    className: 'bg-purple-100 text-purple-800 border-purple-200'
  }
}

const pagoConfig = {
  true: {
    label: 'Con Costo',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  false: {
    label: 'Gratuito',
    className: 'bg-green-100 text-green-800 border-green-200'
  }
}

const modalidadConfig = {
  virtual: {
    label: 'Virtual',
    icon: '💻',
    className: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  presencial: {
    label: 'Presencial',
    icon: '🏢',
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  mixto: {
    label: 'Mixto',
    icon: '🔄',
    className: 'bg-purple-50 text-purple-700 border-purple-200'
  }
}

export const TramiteBadgeSystem: React.FC<TramiteBadgeSystemProps> = ({
  tipo,
  tienePago,
  modalidad,
  activo,
  variant = 'horizontal',
  className,
  'data-testid': testId,
}) => {
  const tipoInfo = tipoConfig[tipo]
  // Handle null/undefined tienePago values
  const pagoKey = tienePago === null || tienePago === undefined ? 'false' : tienePago.toString()
  const pagoInfo = pagoConfig[pagoKey as keyof typeof pagoConfig]
  const modalidadInfo = modalidadConfig[modalidad]

  const containerClasses = cn(
    'flex gap-2',
    variant === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    className
  )

  return (
    <div className={containerClasses} data-testid={testId}>
      {/* Type Badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium border',
          tipoInfo.className
        )}
      >
        {tipoInfo.label}
      </Badge>

      {/* Payment Badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium border',
          pagoInfo.className
        )}
      >
        {pagoInfo.label}
      </Badge>

      {/* Modality Badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-medium border flex items-center gap-1',
          modalidadInfo.className
        )}
      >
        <span aria-hidden="true">{modalidadInfo.icon}</span>
        {modalidadInfo.label}
      </Badge>

      {/* Active Status Badge (only show if inactive) */}
      {!activo && (
        <Badge
          variant="outline"
          className="text-xs font-medium border bg-red-50 text-red-700 border-red-200"
        >
          Inactivo
        </Badge>
      )}
    </div>
  )
}

export default TramiteBadgeSystem
