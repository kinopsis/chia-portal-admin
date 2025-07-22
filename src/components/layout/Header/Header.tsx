'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { Button } from '@/components/atoms'
import Navigation, { getMainNavigation } from '../Navigation'
import MobileDrawer from '../MobileDrawer'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface HeaderProps {
  className?: string
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, userProfile, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const mainNavItems = getMainNavigation()

  // Add admin navigation for authorized users
  const adminNavItem =
    user && userProfile && ['funcionario', 'admin'].includes(userProfile.rol)
      ? [
          {
            label: userProfile.rol === 'admin' ? 'Administración' : 'Panel',
            href: '/admin',
            icon: <span className="text-base">{userProfile.rol === 'admin' ? '⚙️' : '📊'}</span>,
          },
        ]
      : []

  const allNavItems = [...mainNavItems, ...adminNavItem]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header
      className={clsx('bg-white border-b border-gray-200 sticky top-0 z-50', className)}
      role="banner"
      aria-label="Encabezado principal del sitio"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 xs:h-14 sm:h-16 md:h-18">
          {/* Logo Section - Touch Optimized */}
          <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 xs:space-x-3 no-touch:hover:opacity-80 transition-opacity min-h-touch-sm min-w-touch-sm p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              aria-label="Ir al inicio - Portal Ciudadano Alcaldía de Chía"
            >
              <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm xs:text-base sm:text-lg" aria-hidden="true">🏛️</span>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-sm xs:text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  Portal Ciudadano
                </h1>
                <p className="text-xs xs:text-sm text-gray-600 leading-tight">
                  Alcaldía de Chía
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation
              items={allNavItems}
              orientation="horizontal"
              variant="pills"
              className="space-x-1"
            />
          </div>

          {/* Right Section - Touch Optimized */}
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
            {/* Search Button - Touch Friendly */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden xs:flex min-h-touch-sm min-w-touch-sm p-2 no-touch:hover:bg-gray-100 focus:ring-2 focus:ring-primary-green"
              title="Buscar"
              aria-label="Abrir búsqueda"
              aria-describedby="search-description"
            >
              <MagnifyingGlassIcon className="w-4 h-4 xs:w-5 xs:h-5" aria-hidden="true" />
              <span id="search-description" className="sr-only">
                Buscar trámites, servicios y información
              </span>
            </Button>

            {/* Notifications (for authenticated users) */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex hover:bg-gray-100 relative"
                title="Notificaciones"
              >
                <span className="w-5 h-5">🔔</span>
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
            )}

            {/* User Section */}
            {user && userProfile ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile.nombre} {userProfile.apellido}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile.rol}</p>
                </div>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                    title="Perfil de usuario"
                  >
                    <UserIcon className="w-5 h-5" />
                  </Button>

                  {/* User Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile.nombre} {userProfile.apellido}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{userProfile.rol}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        👤 Mi Perfil
                      </Link>
                      <button
                        type="button"
                        onClick={signOut}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/register">
                  <Button variant="ghost" size="sm" disabled={loading}>
                    Registrarse
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="primary" size="sm" disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Touch Optimized */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden min-h-touch-sm min-w-touch-sm p-2 no-touch:hover:bg-gray-100 focus:ring-2 focus:ring-primary-green"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Bars3Icon className="w-5 h-5 xs:w-6 xs:h-6" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          id="mobile-navigation"
        />
      </div>
    </header>
  )
}

export default Header
