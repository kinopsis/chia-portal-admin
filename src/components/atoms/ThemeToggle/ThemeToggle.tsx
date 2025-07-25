'use client'

/**
 * Theme Toggle Component
 * 
 * Provides an accessible theme switching interface with:
 * - Light/Dark/System options
 * - Keyboard navigation
 * - Screen reader support
 * - Visual feedback
 * - Mobile-friendly design
 */

import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import Button from '@/components/atoms/Button'

// Icons for theme options
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636a9 9 0 1011.314 0z"
    />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
)

const ComputerIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
    />
  </svg>
)

interface ThemeOption {
  value: Theme
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    icon: SunIcon,
    description: 'Tema claro siempre activo'
  },
  {
    value: 'dark',
    label: 'Oscuro',
    icon: MoonIcon,
    description: 'Tema oscuro siempre activo'
  },
  {
    value: 'system',
    label: 'Sistema',
    icon: ComputerIcon,
    description: 'Sigue la preferencia del sistema'
  }
]

export interface ThemeToggleProps {
  /** Show as dropdown or toggle button */
  variant?: 'dropdown' | 'toggle' | 'compact'
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
  /** Show labels */
  showLabels?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  size = 'md',
  className,
  showLabels = true,
}) => {
  const { theme, setTheme, resolvedTheme, isLoading } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (variant !== 'dropdown') return

    switch (event.key) {
      case 'Escape':
        setIsOpen(false)
        buttonRef.current?.focus()
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        }
        break
    }
  }

  // Get current theme option
  const currentOption = themeOptions.find(option => option.value === theme) || themeOptions[2]
  const CurrentIcon = currentOption.icon

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'h-8 w-8 text-sm',
      icon: 'h-4 w-4',
      dropdown: 'text-sm',
    },
    md: {
      button: 'h-10 w-10 text-base',
      icon: 'h-5 w-5',
      dropdown: 'text-base',
    },
    lg: {
      button: 'h-12 w-12 text-lg',
      icon: 'h-6 w-6',
      dropdown: 'text-lg',
    },
  }

  if (isLoading) {
    return (
      <div className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg',
        sizeClasses[size].button,
        className
      )} />
    )
  }

  // Toggle variant - simple light/dark toggle
  if (variant === 'toggle') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={clsx(
          'relative transition-colors duration-200',
          sizeClasses[size].button,
          className
        )}
        aria-label={`Cambiar a tema ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`}
        title={`Cambiar a tema ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`}
      >
        <CurrentIcon className={sizeClasses[size].icon} />
      </Button>
    )
  }

  // Compact variant - shows current theme icon only
  if (variant === 'compact') {
    return (
      <div className={clsx('relative', className)} ref={dropdownRef}>
        <Button
          ref={buttonRef}
          variant="ghost"
          size={size}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={clsx(
            'relative transition-colors duration-200',
            sizeClasses[size].button
          )}
          aria-label={`Tema actual: ${currentOption.label}. Hacer clic para cambiar`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <CurrentIcon className={sizeClasses[size].icon} />
        </Button>

        {isOpen && (
          <div className={clsx(
            'absolute right-0 mt-2 py-2 w-48',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            'z-50',
            sizeClasses[size].dropdown
          )}>
            {themeOptions.map((option) => {
              const OptionIcon = option.icon
              const isSelected = option.value === theme

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setIsOpen(false)
                  }}
                  className={clsx(
                    'w-full px-4 py-2 text-left',
                    'flex items-center gap-3',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'transition-colors duration-150',
                    isSelected && 'bg-gray-50 dark:bg-gray-700/50'
                  )}
                  role="menuitem"
                >
                  <OptionIcon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {showLabels && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 bg-primary-green rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="outline"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={clsx(
          'flex items-center gap-2 min-w-0',
          showLabels ? 'px-3' : sizeClasses[size].button
        )}
        aria-label={`Tema actual: ${currentOption.label}. Hacer clic para cambiar`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <CurrentIcon className={sizeClasses[size].icon} />
        {showLabels && (
          <span className="hidden sm:inline truncate">
            {currentOption.label}
          </span>
        )}
        <svg
          className={clsx(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className={clsx(
          'absolute right-0 mt-2 py-2 w-56',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg shadow-lg',
          'z-50',
          sizeClasses[size].dropdown
        )}>
          {themeOptions.map((option) => {
            const OptionIcon = option.icon
            const isSelected = option.value === theme

            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setIsOpen(false)
                }}
                className={clsx(
                  'w-full px-4 py-3 text-left',
                  'flex items-center gap-3',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'transition-colors duration-150',
                  isSelected && 'bg-gray-50 dark:bg-gray-700/50'
                )}
                role="menuitem"
              >
                <OptionIcon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="h-2 w-2 bg-primary-green rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle
