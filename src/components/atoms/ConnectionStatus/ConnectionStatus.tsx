'use client'

import React, { useState, useEffect } from 'react'
import { analyzeNetworkError } from '@/lib/errors'
import { supabase } from '@/lib/supabase/client'

export interface ConnectionStatusProps {
  className?: string
  showWhenOnline?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

export type ConnectionState = 'online' | 'offline' | 'checking' | 'error'

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showWhenOnline = false,
  autoHide = true,
  autoHideDelay = 3000
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking')
  const [lastError, setLastError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Check connection status
  const checkConnection = async () => {
    try {
      setConnectionState('checking')
      
      // Simple ping to Supabase
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      if (error) {
        const networkInfo = analyzeNetworkError(error)
        if (networkInfo.isNetworkError) {
          setConnectionState('offline')
          setLastError(error.message)
        } else {
          setConnectionState('online')
          setLastError(null)
        }
      } else {
        setConnectionState('online')
        setLastError(null)
      }
    } catch (error) {
      const networkInfo = analyzeNetworkError(error)
      if (networkInfo.isNetworkError) {
        setConnectionState('offline')
        setLastError(error instanceof Error ? error.message : 'Network error')
      } else {
        setConnectionState('error')
        setLastError(error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  // Auto-hide when online
  useEffect(() => {
    if (autoHide && connectionState === 'online' && !showWhenOnline) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, autoHideDelay)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [connectionState, autoHide, showWhenOnline, autoHideDelay])

  // Check connection on mount and periodically
  useEffect(() => {
    checkConnection()
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    
    // Listen to online/offline events
    const handleOnline = () => checkConnection()
    const handleOffline = () => {
      setConnectionState('offline')
      setLastError('No internet connection')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't render if not visible
  if (!isVisible) return null

  // Don't render if online and showWhenOnline is false
  if (connectionState === 'online' && !showWhenOnline) return null

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'online':
        return {
          icon: '✅',
          text: 'Conectado',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        }
      case 'offline':
        return {
          icon: '🔴',
          text: 'Sin conexión',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        }
      case 'checking':
        return {
          icon: '🔄',
          text: 'Verificando...',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        }
      case 'error':
        return {
          icon: '⚠️',
          text: 'Error de conexión',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      border rounded-lg px-3 py-2 shadow-sm
      transition-all duration-300 ease-in-out
      ${className}
    `}>
      <div className="flex items-center space-x-2">
        <span className={connectionState === 'checking' ? 'animate-spin' : ''}>
          {config.icon}
        </span>
        <span className="text-sm font-medium">
          {config.text}
        </span>
        {connectionState !== 'online' && (
          <button
            onClick={checkConnection}
            className="text-xs underline hover:no-underline"
            disabled={connectionState === 'checking'}
          >
            Reintentar
          </button>
        )}
      </div>
      
      {lastError && connectionState !== 'online' && (
        <div className="mt-1 text-xs opacity-75">
          {lastError}
        </div>
      )}
    </div>
  )
}

export default ConnectionStatus
