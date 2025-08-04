'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'
import {
  HomeIcon,
  DocumentTextIcon,
  BoltIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  children?: SidebarItem[]
  roles?: string[]
}

const FuncionarioSidebar: React.FC = () => {
  const pathname = usePathname()
  const { userProfile, signOut } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/funcionarios',
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      label: 'Servicios',
      href: '/funcionarios/servicios',
      icon: <CubeIcon className="w-5 h-5" />,
    },
    {
      label: 'FAQs',
      href: '/funcionarios/faqs',
      icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
    },
  ]

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
          <Link href={item.href} className="flex items-center space-x-3 flex-1 min-w-0">
            <span
              className={clsx(
                'flex-shrink-0',
                itemIsActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-green'
              )}
            >
              {item.icon}
            </span>
            {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
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
              title={isExpanded ? `Contraer ${item.label}` : `Expandir ${item.label}`}
              aria-label={isExpanded ? `Contraer ${item.label}` : `Expandir ${item.label}`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={clsx(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏛️</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Panel Funcionario</h2>
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
        {sidebarItems.map((item) => renderSidebarItem(item))}
      </nav>

      {/* User Info */}
      {!isCollapsed && userProfile && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {userProfile.nombre?.charAt(0) || 'U'}
                {userProfile.apellido?.charAt(0) || ''}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile.nombre || 'Usuario'} {userProfile.apellido || ''}
              </p>
              <p className="text-xs text-gray-500 capitalize">{userProfile.rol}</p>
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

export default FuncionarioSidebar
