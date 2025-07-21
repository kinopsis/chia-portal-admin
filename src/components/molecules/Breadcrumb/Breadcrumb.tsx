'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  showHome?: boolean
  className?: string
  maxItems?: number
  separator?: React.ReactNode
}

// Function to generate breadcrumbs from pathname
const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Route mappings for better labels
  const routeLabels: Record<string, string> = {
    admin: 'Administración',
    dependencias: 'Dependencias',
    subdependencias: 'Subdependencias',
    tramites: 'Trámites',
    opas: 'OPAs',
    faqs: 'Preguntas Frecuentes',
    usuarios: 'Usuarios',
    reportes: 'Reportes',
    configuracion: 'Configuración',
    dashboard: 'Dashboard',
    profile: 'Mi Perfil',
    auth: 'Autenticación',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    'forgot-password': 'Recuperar Contraseña',
  }

  let currentPath = ''

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1

    breadcrumbs.push({
      label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
      current: isLast,
    })
  })

  return breadcrumbs
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  className,
  maxItems = 5,
  separator,
}) => {
  const pathname = usePathname()

  // Use provided items or generate from pathname
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  const allItems = showHome
    ? [{ label: 'Inicio', href: '/', icon: <HomeIcon className="w-4 h-4" /> }, ...breadcrumbItems]
    : breadcrumbItems

  // Truncate items if they exceed maxItems
  const displayItems =
    allItems.length > maxItems
      ? [
          allItems[0], // Always show home
          { label: '...', href: undefined, icon: null },
          ...allItems.slice(-maxItems + 2), // Show last few items
        ]
      : allItems

  const separatorElement = separator || <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />

  return (
    <nav className={clsx('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isCurrent = item.current || isLast

          return (
            <li key={index} className="flex items-center">
              {index > 0 && separatorElement}

              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary-green transition-colors"
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={clsx(
                    'flex items-center space-x-1',
                    isCurrent ? 'text-gray-900 font-medium' : 'text-gray-500'
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
