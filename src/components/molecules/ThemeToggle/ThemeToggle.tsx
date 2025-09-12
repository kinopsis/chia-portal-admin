'use client'

import React from 'react'
import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { clsx } from 'clsx'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'menu-item'
  showLabel?: boolean
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  size = 'md',
  variant = 'button',
  showLabel = false,
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const iconSize = sizeClasses[size]

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  if (variant === 'menu-item') {
    return (
      <>
        {/* Light Theme Option */}
        <button
          onClick={() => handleThemeChange('light')}
          className={clsx(
            'flex items-center w-full px-3 py-2 text-sm transition-colors duration-200 rounded-md',
            theme === 'light'
              ? 'bg-primary-green/10 text-primary-green'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
          aria-pressed={theme === 'light' ? true : false}
        >
          <SunIcon className={clsx(iconSize, 'mr-3 flex-shrink-0')} />
          <span>Modo claro</span>
          {showLabel && resolvedTheme === 'light' && (
            <span className="ml-auto text-xs text-primary-green">Actual</span>
          )}
        </button>

        {/* Dark Theme Option */}
        <button
          onClick={() => handleThemeChange('dark')}
          className={clsx(
            'flex items-center w-full px-3 py-2 text-sm transition-colors duration-200 rounded-md',
            theme === 'dark'
              ? 'bg-primary-green/10 text-primary-green'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
          aria-pressed={theme === 'dark' ? true : false}
        >
          <MoonIcon className={clsx(iconSize, 'mr-3 flex-shrink-0')} />
          <span>Modo oscuro</span>
          {showLabel && resolvedTheme === 'dark' && theme === 'dark' && (
            <span className="ml-auto text-xs text-primary-green">Actual</span>
          )}
        </button>

        {/* System Theme Option */}
        <button
          onClick={() => handleThemeChange('system')}
          className={clsx(
            'flex items-center w-full px-3 py-2 text-sm transition-colors duration-200 rounded-md',
            theme === 'system'
              ? 'bg-primary-green/10 text-primary-green'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
          aria-pressed={theme === 'system' ? true : false}
        >
          <ComputerDesktopIcon className={clsx(iconSize, 'mr-3 flex-shrink-0')} />
          <span>Sistema</span>
          {showLabel && theme === 'system' && (
            <span className="ml-auto text-xs text-primary-green">Actual</span>
          )}
        </button>
      </>
    )
  }

  // Default button variant with toggle functionality
  const getToggleIcon = () => {
    if (theme === 'system') {
      return <ComputerDesktopIcon className={iconSize} />
    }
    return resolvedTheme === 'dark' ? (
      <MoonIcon className={iconSize} />
    ) : (
      <SunIcon className={iconSize} />
    )
  }

  const getToggleLabel = () => {
    if (theme === 'system') return 'Sistema'
    return resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'
  }

  return (
    <button
      onClick={() => {
        if (theme === 'system') {
          // From system, go to opposite of current resolved theme
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        } else if (theme === 'light') {
          setTheme('dark')
        } else {
          setTheme('system')
        }
      }}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg bg-background-secondary border border-border-medium transition-all duration-200',
        'hover:bg-background-tertiary hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        size === 'sm' ? 'p-1.5' : size === 'md' ? 'p-2' : 'p-2.5',
        className
      )}
      aria-label={`Cambiar tema: actualmente ${getToggleLabel()}`}
      title={`Cambiar tema (${getToggleLabel()})`}
    >
      {getToggleIcon()}
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-text-primary">
          {getToggleLabel()}
        </span>
      )}

      {/* Hidden screen reader text for better accessibility */}
      <span className="sr-only">
        Tema actual: {getToggleLabel()}.
        {theme === 'system' && ` Basado en preferencia del sistema (${resolvedTheme === 'dark' ? 'oscuro' : 'claro'})`}
      </span>
    </button>
  )
}

export default ThemeToggle
