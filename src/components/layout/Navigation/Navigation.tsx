'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'
import type { UserRole } from '@/types'

export interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  roles?: UserRole[]
  description?: string
  badge?: string
  external?: boolean
}

export interface NavigationProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  orientation = 'horizontal',
  variant = 'default',
  className,
}) => {
  const { userProfile } = useAuth()
  const pathname = usePathname()

  const isItemVisible = (item: NavigationItem) => {
    if (!item.roles || item.roles.length === 0) return true
    return userProfile && item.roles.includes(userProfile.rol)
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const getItemClasses = (item: NavigationItem) => {
    const baseClasses = 'transition-all duration-200 font-medium'
    const isItemActive = isActive(item.href)

    switch (variant) {
      case 'pills':
        return clsx(
          baseClasses,
          'px-4 py-2 rounded-lg',
          isItemActive
            ? 'bg-primary-green text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-primary-green'
        )
      case 'underline':
        return clsx(
          baseClasses,
          'px-3 py-2 border-b-2',
          isItemActive
            ? 'border-primary-green text-primary-green'
            : 'border-transparent text-gray-700 hover:text-primary-green hover:border-gray-300'
        )
      default:
        return clsx(
          baseClasses,
          'px-3 py-2',
          isItemActive ? 'text-primary-green' : 'text-gray-700 hover:text-primary-green'
        )
    }
  }

  const visibleItems = items.filter(isItemVisible)

  if (visibleItems.length === 0) return null

  return (
    <nav
      id="main-navigation"
      className={clsx(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1',
        className
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      {visibleItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx('flex items-center space-x-2 relative group', getItemClasses(item))}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          title={item.description}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
          {item.external && <span className="text-xs opacity-60">↗</span>}
        </Link>
      ))}
    </nav>
  )
}

// Predefined navigation configurations for different contexts
export const getMainNavigation = (): NavigationItem[] => [
  {
    label: 'Inicio',
    href: '/',
    icon: <span className="text-base">🏠</span>,
    description: 'Página principal del portal',
  },
  {
    label: 'Dependencias',
    href: '/dependencias',
    icon: <span className="text-base">🏛️</span>,
    description: 'Directorio de dependencias municipales',
  },
  {
    label: 'Trámites y Servicios',
    href: '/tramites',
    icon: <span className="text-base">📋</span>,
    description: 'Búsqueda global: trámites, OPAs y FAQs',
  },
  {
    label: 'FAQ',
    href: '/faqs',
    icon: <span className="text-base">❓</span>,
    description: 'Preguntas frecuentes y centro de ayuda',
  },
  {
    label: 'PQRS',
    href: '/pqrs',
    icon: <span className="text-base">📝</span>,
    description: 'Peticiones, Quejas, Reclamos y Sugerencias',
  },
]

export const getAdminNavigation = (): NavigationItem[] => [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <span className="text-base">📊</span>,
    description: 'Panel de control administrativo',
    roles: ['funcionario', 'admin'],
  },
  {
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: <span className="text-base">👥</span>,
    description: 'Gestión de usuarios del sistema',
    roles: ['admin'],
  },
  {
    label: 'Dependencias',
    href: '/admin/dependencias',
    icon: <span className="text-base">🏛️</span>,
    description: 'Administrar dependencias',
    roles: ['funcionario', 'admin'],
  },
  {
    label: 'Trámites',
    href: '/admin/tramites',
    icon: <span className="text-base">📋</span>,
    description: 'Gestionar trámites',
    roles: ['funcionario', 'admin'],
  },
  {
    label: 'OPAs',
    href: '/admin/opas',
    icon: <span className="text-base">⚡</span>,
    description: 'Administrar OPAs',
    roles: ['funcionario', 'admin'],
  },
  {
    label: 'FAQs',
    href: '/admin/faqs',
    icon: <span className="text-base">❓</span>,
    description: 'Gestionar preguntas frecuentes',
    roles: ['funcionario', 'admin'],
  },
  {
    label: 'Reportes',
    href: '/admin/reportes',
    icon: <span className="text-base">📈</span>,
    description: 'Reportes y estadísticas',
    roles: ['funcionario', 'admin'],
  },
  {
    label: 'Configuración',
    href: '/admin/configuracion',
    icon: <span className="text-base">⚙️</span>,
    description: 'Configuración del sistema',
    roles: ['admin'],
  },
]

export const getUserNavigation = (): NavigationItem[] => [
  {
    label: 'Mi Dashboard',
    href: '/dashboard',
    icon: <span className="text-base">📊</span>,
    description: 'Panel personal del usuario',
    roles: ['ciudadano', 'funcionario', 'admin'],
  },
  {
    label: 'Mi Perfil',
    href: '/profile',
    icon: <span className="text-base">👤</span>,
    description: 'Configuración del perfil',
    roles: ['ciudadano', 'funcionario', 'admin'],
  },
  {
    label: 'Mis Trámites',
    href: '/mis-tramites',
    icon: <span className="text-base">📋</span>,
    description: 'Historial de trámites',
    roles: ['ciudadano'],
  },
  {
    label: 'Notificaciones',
    href: '/notificaciones',
    icon: <span className="text-base">🔔</span>,
    description: 'Centro de notificaciones',
    roles: ['ciudadano', 'funcionario', 'admin'],
    badge: '3',
  },
]

export default Navigation
