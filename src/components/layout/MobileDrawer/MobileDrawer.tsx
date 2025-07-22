'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { XMarkIcon, MagnifyingGlassIcon, UserIcon, BellIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/atoms'
import Navigation, { getMainNavigation, getUserNavigation } from '../Navigation'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  id?: string
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, className, id }) => {
  const { user, userProfile, signOut } = useAuth()
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const mainNavItems = getMainNavigation()
  const userNavItems = getUserNavigation()

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  // Handle swipe to close
  useEffect(() => {
    let startX = 0
    let currentX = 0
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      isDragging = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      currentX = e.touches[0].clientX
      const deltaX = currentX - startX

      // Only allow swipe to close (left swipe)
      if (deltaX < 0 && Math.abs(deltaX) > 50) {
        const drawer = drawerRef.current
        if (drawer) {
          drawer.style.transform = `translateX(${deltaX}px)`
        }
      }
    }

    const handleTouchEnd = () => {
      if (!isDragging) return
      isDragging = false

      const deltaX = currentX - startX
      const drawer = drawerRef.current

      if (drawer) {
        if (deltaX < -100) {
          // Close drawer if swiped far enough
          onClose()
        } else {
          // Reset position
          drawer.style.transform = 'translateX(0)'
        }
      }
    }

    const drawer = drawerRef.current
    if (drawer && isOpen) {
      drawer.addEventListener('touchstart', handleTouchStart)
      drawer.addEventListener('touchmove', handleTouchMove)
      drawer.addEventListener('touchend', handleTouchEnd)

      return () => {
        drawer.removeEventListener('touchstart', handleTouchStart)
        drawer.removeEventListener('touchmove', handleTouchMove)
        drawer.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className={clsx('fixed inset-0 z-50 lg:hidden', className)}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        id={id}
        className="fixed inset-y-0 left-0 w-72 xs:w-80 sm:w-96 max-w-[85vw] xs:max-w-[80vw] sm:max-w-[75vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col reduced-motion:transition-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-description"
      >
        {/* Header - Touch Optimized */}
        <div className="flex items-center justify-between p-mobile-sm xs:p-mobile-md sm:p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 xs:space-x-3 flex-1 min-w-0">
            <div className="w-7 h-7 xs:w-8 xs:h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs xs:text-sm" aria-hidden="true">🏛️</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="drawer-title" className="text-base xs:text-lg font-semibold text-gray-900 truncate">
                Portal Ciudadano
              </h2>
              <p id="drawer-description" className="text-xs xs:text-sm text-gray-500 truncate">
                Menú de navegación principal - Alcaldía de Chía
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="min-h-touch-sm min-w-touch-sm p-2 ml-2 flex-shrink-0 no-touch:hover:bg-gray-100 focus:ring-2 focus:ring-primary-green"
            aria-label="Cerrar menú de navegación"
            title="Cerrar menú"
          >
            <XMarkIcon className="w-5 h-5 xs:w-6 xs:h-6" aria-hidden="true" />
          </Button>
        </div>

        {/* User Info */}
        {user && userProfile && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {userProfile.nombre.charAt(0)}
                  {userProfile.apellido.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userProfile.nombre} {userProfile.apellido}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userProfile.rol}</p>
              </div>
              <Button variant="ghost" size="sm" className="p-1">
                <BellIcon className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Navegación Principal
            </h3>
            <Navigation
              items={allNavItems}
              orientation="vertical"
              variant="pills"
              className="space-y-1"
            />
          </div>

          {/* User Navigation */}
          {user && (
            <div className="px-4 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Mi Cuenta
              </h3>
              <Navigation
                items={userNavItems}
                orientation="vertical"
                variant="pills"
                className="space-y-1"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Acciones Rápidas
            </h3>

            <Button variant="ghost" size="sm" className="w-full justify-start">
              <MagnifyingGlassIcon className="w-5 h-5 mr-3" />
              Buscar
            </Button>

            {user ? (
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <UserIcon className="w-5 h-5 mr-3" />
                Mi Perfil
              </Button>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/register" onClick={onClose}>
                  <Button variant="outline" size="sm" className="w-full">
                    Registrarse
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={onClose}>
                  <Button variant="primary" size="sm" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                signOut()
                onClose()
              }}
            >
              🚪 Cerrar Sesión
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-500">Portal de Atención Ciudadana</p>
              <p className="text-xs text-gray-400">Alcaldía de Chía © 2025</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileDrawer
