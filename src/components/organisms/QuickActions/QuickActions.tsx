import React from 'react'
import Link from 'next/link'
import { Card, Button } from '@/components/atoms'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface QuickActionItem {
  title: string
  description: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'primary'
  roles?: string[]
  badge?: string
  external?: boolean
}

export interface QuickActionsProps {
  title?: string
  description?: string
  actions?: QuickActionItem[]
  columns?: 1 | 2 | 3 | 4
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

const QuickActions: React.FC<QuickActionsProps> = ({
  title = 'Acciones Rápidas',
  description = 'Accede rápidamente a las funcionalidades más utilizadas',
  actions,
  columns = 3,
  variant = 'default',
  className,
}) => {
  const { userProfile } = useAuth()

  const defaultActions: QuickActionItem[] = [
    {
      title: 'Gestionar Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: '👥',
      href: '/admin/usuarios',
      color: 'blue',
      roles: ['admin'],
    },
    {
      title: 'Ver Dependencias',
      description: 'Consultar y gestionar dependencias',
      icon: '🏛️',
      href: '/admin/dependencias',
      color: 'green',
      roles: ['funcionario', 'admin'],
    },
    {
      title: 'Trámites Pendientes',
      description: 'Revisar trámites en proceso',
      icon: '📋',
      href: '/admin/tramites',
      color: 'yellow',
      roles: ['funcionario', 'admin'],
      badge: '12',
    },
    {
      title: 'Gestionar OPAs',
      description: 'Administrar órdenes de pago',
      icon: '⚡',
      href: '/admin/opas',
      color: 'purple',
      roles: ['funcionario', 'admin'],
    },
    {
      title: 'Preguntas Frecuentes',
      description: 'Gestionar FAQs del sistema',
      icon: '❓',
      href: '/admin/faqs',
      color: 'indigo',
      roles: ['funcionario', 'admin'],
    },
    {
      title: 'Ver Reportes',
      description: 'Consultar estadísticas y reportes',
      icon: '📊',
      href: '/admin/reportes',
      color: 'red',
      roles: ['funcionario', 'admin'],
    },
    {
      title: 'Configuración',
      description: 'Configurar parámetros del sistema',
      icon: '⚙️',
      href: '/admin/configuracion',
      color: 'primary',
      roles: ['admin'],
    },
    {
      title: 'Soporte Técnico',
      description: 'Contactar con soporte técnico',
      icon: '🛠️',
      href: '/soporte',
      color: 'blue',
      external: true,
    },
  ]

  const actionsToShow = actions || defaultActions

  // Filter actions based on user role
  const visibleActions = actionsToShow.filter((action) => {
    if (!action.roles || action.roles.length === 0) return true
    return userProfile && action.roles.includes(userProfile.rol)
  })

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      hover: 'hover:bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      hover: 'hover:bg-green-100',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      hover: 'hover:bg-yellow-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      hover: 'hover:bg-red-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      hover: 'hover:bg-purple-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      hover: 'hover:bg-indigo-100',
    },
    primary: {
      bg: 'bg-primary-green/10',
      text: 'text-primary-green',
      border: 'border-primary-green/20',
      iconBg: 'bg-primary-green/20',
      hover: 'hover:bg-primary-green/20',
    },
  }

  const getGridClasses = () => {
    const baseClasses = 'grid gap-4'
    switch (columns) {
      case 1:
        return `${baseClasses} grid-cols-1`
      case 2:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2`
      case 3:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
      case 4:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
      default:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
    }
  }

  const renderAction = (action: QuickActionItem, index: number) => {
    const colors = colorClasses[action.color || 'blue']

    const content = (
      <Card
        className={clsx(
          'transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105',
          colors.bg,
          colors.hover,
          variant === 'compact' ? 'p-4' : 'p-6'
        )}
      >
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div
            className={clsx(
              'flex-shrink-0 rounded-lg flex items-center justify-center',
              variant === 'compact' ? 'w-10 h-10' : 'w-12 h-12',
              colors.iconBg
            )}
          >
            <span className={clsx(colors.text, variant === 'compact' ? 'text-lg' : 'text-xl')}>
              {action.icon}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3
                className={clsx(
                  'font-semibold truncate',
                  variant === 'compact' ? 'text-sm' : 'text-base',
                  'text-gray-900'
                )}
              >
                {action.title}
              </h3>

              {action.badge && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                  {action.badge}
                </span>
              )}

              {action.external && <span className="ml-2 text-gray-400 text-xs">↗</span>}
            </div>

            {variant !== 'compact' && (
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            )}
          </div>
        </div>
      </Card>
    )

    if (action.href) {
      return (
        <Link
          key={index}
          href={action.href}
          target={action.external ? '_blank' : undefined}
          rel={action.external ? 'noopener noreferrer' : undefined}
        >
          {content}
        </Link>
      )
    }

    return (
      <div key={index} onClick={action.onClick}>
        {content}
      </div>
    )
  }

  if (visibleActions.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <p className="text-gray-500">No hay acciones disponibles para tu rol</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      {/* Actions Grid */}
      <div className={getGridClasses()}>{visibleActions.map(renderAction)}</div>
    </div>
  )
}

export default QuickActions
