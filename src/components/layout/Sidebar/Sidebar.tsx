'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BoltIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface SidebarProps {
  className?: string
}

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
  children?: SidebarItem[]
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { userProfile, signOut } = useAuth()
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      label: 'Usuarios',
      href: '/admin/usuarios',
      icon: <UserGroupIcon className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      label: 'Dependencias',
      href: '/admin/dependencias',
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      children: [
        { label: 'Gestionar', href: '/admin/dependencias', icon: <></> },
        { label: 'Subdependencias', href: '/admin/subdependencias', icon: <></> },
      ],
    },
    {
      label: 'Trámites',
      href: '/admin/tramites',
      icon: <DocumentTextIcon className="w-5 h-5" />,
    },
    {
      label: 'OPAs',
      href: '/admin/opas',
      icon: <BoltIcon className="w-5 h-5" />,
    },
    {
      label: 'FAQs',
      href: '/admin/faqs',
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
    },
    {
      label: 'Reportes',
      href: '/admin/reportes',
      icon: <ChartBarIcon className="w-5 h-5" />,
      children: [
        { label: 'Estadísticas', href: '/admin/reportes/estadisticas', icon: <></> },
        { label: 'Usuarios', href: '/admin/reportes/usuarios', icon: <></> },
        { label: 'Trámites', href: '/admin/reportes/tramites', icon: <></> },
      ],
    },
    {
      label: 'Notificaciones',
      href: '/admin/notificaciones',
      icon: <BellIcon className="w-5 h-5" />,
    },
    {
      label: 'Configuración',
      href: '/admin/configuracion',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      roles: ['admin'],
      children: [
        { label: 'General', href: '/admin/configuracion/general', icon: <></> },
        { label: 'Seguridad', href: '/admin/configuracion/seguridad', icon: <></> },
        { label: 'Integrations', href: '/admin/configuracion/integraciones', icon: <></> },
      ],
    },
  ]

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => 
      prev.includes(itemLabel) 
        ? prev.filter(item => item !== itemLabel)
        : [...prev, itemLabel]
    )
  }

  const isItemVisible = (item: SidebarItem) => {
    if (!item.roles) return true
    return userProfile && item.roles.includes(userProfile.rol)
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    if (!isItemVisible(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const itemIsActive = isActive(item.href)

    return (
      <div key={item.label}>
        <div
          className={clsx(
            'flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group',
            level > 0 ? 'ml-6 text-sm' : '',
            itemIsActive 
              ? 'bg-primary-green text-white shadow-md' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-primary-green'
          )}
        >
          <Link
            href={item.href}
            className="flex items-center space-x-3 flex-1 min-w-0"
          >
            <span className={clsx(
              'flex-shrink-0',
              itemIsActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-green'
            )}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="truncate font-medium">
                {item.label}
              </span>
            )}
          </Link>
          
          {hasChildren && !isCollapsed && (
            <button
              type="button"
              onClick={() => toggleExpanded(item.label)}
              className={clsx(
                'p-1 rounded transition-transform duration-200',
                itemIsActive ? 'text-white' : 'text-gray-400 hover:text-primary-green',
                isExpanded ? 'rotate-90' : ''
              )}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className={clsx(
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏛️</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Chía Portal</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>

      {/* User Info */}
      {!isCollapsed && userProfile && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {userProfile.nombre?.charAt(0) || 'U'}{userProfile.apellido?.charAt(0) || ''}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile.nombre || 'Usuario'} {userProfile.apellido || ''}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userProfile.rol}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                await signOut()
              } catch (error) {
                console.error('Error signing out:', error)
              }
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
            title="Cerrar Sesión"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
