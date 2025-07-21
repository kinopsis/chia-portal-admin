import React from 'react'
import { Card } from '@/components/atoms'
import { clsx } from 'clsx'

export interface MetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label: string
    period?: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'primary' | 'secondary' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'gradient' | 'outlined' | 'minimal'
  onClick?: () => void
  loading?: boolean
  className?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon,
  trend,
  color = 'blue',
  size = 'md',
  variant = 'default',
  onClick,
  loading = false,
  className,
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      gradient: 'from-blue-500 to-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      gradient: 'from-green-500 to-green-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      gradient: 'from-red-500 to-red-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      gradient: 'from-purple-500 to-purple-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    primary: {
      bg: 'bg-primary-green/10',
      text: 'text-primary-green',
      border: 'border-primary-green/20',
      iconBg: 'bg-primary-green/20',
      gradient: 'from-primary-green to-primary-green-dark',
    },
    secondary: {
      bg: 'bg-primary-yellow/10',
      text: 'text-primary-yellow-dark',
      border: 'border-primary-yellow/20',
      iconBg: 'bg-primary-yellow/20',
      gradient: 'from-primary-yellow to-primary-yellow-dark',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      gradient: 'from-green-500 to-green-600',
    },
    warning: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      gradient: 'from-orange-500 to-orange-600',
    },
  }

  const sizeClasses = {
    sm: {
      card: 'p-4',
      icon: 'w-8 h-8',
      iconText: 'text-lg',
      title: 'text-xs',
      value: 'text-lg',
      subtitle: 'text-xs',
    },
    md: {
      card: 'p-6',
      icon: 'w-12 h-12',
      iconText: 'text-xl',
      title: 'text-sm',
      value: 'text-2xl',
      subtitle: 'text-xs',
    },
    lg: {
      card: 'p-8',
      icon: 'w-16 h-16',
      iconText: 'text-2xl',
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-sm',
    },
  }

  const colors = colorClasses[color]
  const sizes = sizeClasses[size]

  const getCardClasses = () => {
    const baseClasses = clsx(
      'transition-all duration-200',
      sizes.card,
      onClick && 'cursor-pointer hover:shadow-lg hover:scale-105'
    )

    switch (variant) {
      case 'gradient':
        return clsx(
          baseClasses,
          `bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
        )
      case 'outlined':
        return clsx(
          baseClasses,
          `border-2 ${colors.border} ${colors.bg}`
        )
      case 'minimal':
        return clsx(
          baseClasses,
          'bg-white border border-gray-100'
        )
      default:
        return clsx(
          baseClasses,
          colors.bg,
          'border border-gray-100'
        )
    }
  }

  const getTextColor = () => {
    if (variant === 'gradient') return 'text-white'
    if (variant === 'minimal') return 'text-gray-600'
    return colors.text
  }

  const getValueColor = () => {
    if (variant === 'gradient') return 'text-white'
    return 'text-gray-900'
  }

  if (loading) {
    return (
      <Card className={clsx(getCardClasses(), 'animate-pulse', className)}>
        <div className="flex items-center space-x-4">
          <div className={clsx('rounded-lg', sizes.icon, colors.iconBg)} />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={clsx(getCardClasses(), className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Icon */}
          <div className={clsx(
            'rounded-lg flex items-center justify-center flex-shrink-0',
            sizes.icon,
            variant === 'gradient' ? 'bg-white/20' : colors.iconBg
          )}>
            <span className={clsx(
              sizes.iconText,
              variant === 'gradient' ? 'text-white' : colors.text
            )}>
              {icon}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={clsx(
              'font-medium truncate',
              sizes.title,
              getTextColor()
            )}>
              {title}
            </p>

            <p className={clsx(
              'font-bold truncate',
              sizes.value,
              getValueColor()
            )}>
              {value}
            </p>

            {subtitle && (
              <p className={clsx(
                'truncate mt-1',
                sizes.subtitle,
                variant === 'gradient' ? 'text-white/80' : 'text-gray-500'
              )}>
                {subtitle}
              </p>
            )}

            {description && (
              <p className={clsx(
                'mt-2 text-xs leading-relaxed',
                variant === 'gradient' ? 'text-white/70' : 'text-gray-400'
              )}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex-shrink-0 ml-4">
            <div className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1',
              variant === 'gradient'
                ? 'bg-white/20 text-white'
                : trend.isPositive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
            )}>
              <span>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              <span>{trend.value}%</span>
            </div>
            {trend.label && (
              <p className={clsx(
                'text-xs mt-1 text-center',
                variant === 'gradient' ? 'text-white/70' : 'text-gray-500'
              )}>
                {trend.label}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default MetricCard
