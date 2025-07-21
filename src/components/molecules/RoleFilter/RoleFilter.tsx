import React from 'react'
import { Button } from '@/components/atoms'
import { useAuth } from '@/hooks'
import { clsx } from 'clsx'

export interface RoleFilterProps {
  selectedRoles: string[]
  onRoleChange: (roles: string[]) => void
  availableRoles?: string[]
  variant?: 'pills' | 'dropdown' | 'checkboxes'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showAllOption?: boolean
  multiSelect?: boolean
}

const RoleFilter: React.FC<RoleFilterProps> = ({
  selectedRoles,
  onRoleChange,
  availableRoles,
  variant = 'pills',
  size = 'md',
  className,
  showAllOption = true,
  multiSelect = true,
}) => {
  const { userProfile } = useAuth()

  const defaultRoles = ['ciudadano', 'funcionario', 'admin']
  const roles = availableRoles || defaultRoles

  // Filter roles based on user permissions
  const visibleRoles = roles.filter((role) => {
    if (userProfile?.rol === 'admin') return true
    if (userProfile?.rol === 'funcionario') return ['ciudadano', 'funcionario'].includes(role)
    return role === 'ciudadano'
  })

  const handleRoleToggle = (role: string) => {
    if (!multiSelect) {
      onRoleChange([role])
      return
    }

    if (selectedRoles.includes(role)) {
      onRoleChange(selectedRoles.filter((r) => r !== role))
    } else {
      onRoleChange([...selectedRoles, role])
    }
  }

  const handleAllToggle = () => {
    if (selectedRoles.length === visibleRoles.length) {
      onRoleChange([])
    } else {
      onRoleChange(visibleRoles)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      ciudadano: 'Ciudadanos',
      funcionario: 'Funcionarios',
      admin: 'Administradores',
    }
    return labels[role as keyof typeof labels] || role
  }

  const getRoleIcon = (role: string) => {
    const icons = {
      ciudadano: '👤',
      funcionario: '👨‍💼',
      admin: '👨‍💻',
    }
    return icons[role as keyof typeof icons] || '👤'
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1'
      case 'lg':
        return 'text-base px-4 py-3'
      default:
        return 'text-sm px-3 py-2'
    }
  }

  if (variant === 'pills') {
    return (
      <div className={clsx('flex flex-wrap gap-2', className)}>
        {showAllOption && (
          <Button
            variant={selectedRoles.length === visibleRoles.length ? 'primary' : 'outline'}
            size={size}
            onClick={handleAllToggle}
            className={getSizeClasses()}
          >
            Todos
          </Button>
        )}

        {visibleRoles.map((role) => (
          <Button
            key={role}
            variant={selectedRoles.includes(role) ? 'primary' : 'outline'}
            size={size}
            onClick={() => handleRoleToggle(role)}
            className={clsx('flex items-center space-x-2', getSizeClasses())}
          >
            <span>{getRoleIcon(role)}</span>
            <span>{getRoleLabel(role)}</span>
          </Button>
        ))}
      </div>
    )
  }

  if (variant === 'checkboxes') {
    return (
      <div className={clsx('space-y-3', className)}>
        {showAllOption && (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRoles.length === visibleRoles.length}
              onChange={handleAllToggle}
              className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Todos los roles</span>
          </label>
        )}

        {visibleRoles.map((role) => (
          <label key={role} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleRoleToggle(role)}
              className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded"
            />
            <span className="flex items-center space-x-2 text-sm text-gray-700">
              <span>{getRoleIcon(role)}</span>
              <span>{getRoleLabel(role)}</span>
            </span>
          </label>
        ))}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className={className}>
        <select
          value={multiSelect ? '' : selectedRoles[0] || ''}
          onChange={(e) => {
            if (multiSelect) return // Handle multiselect differently
            onRoleChange(e.target.value ? [e.target.value] : [])
          }}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-green focus:ring-primary-green',
            getSizeClasses()
          )}
        >
          {showAllOption && <option value="">Todos los roles</option>}
          {visibleRoles.map((role) => (
            <option key={role} value={role}>
              {getRoleIcon(role)} {getRoleLabel(role)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return null
}

export default RoleFilter
