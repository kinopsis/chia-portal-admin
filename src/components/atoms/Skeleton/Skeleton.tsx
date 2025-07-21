import React from 'react'
import { clsx } from 'clsx'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: 'pulse' | 'wave' | 'none'
  lines?: number
}

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
  variant = 'text',
  animation = 'pulse',
  lines = 1,
}) => {
  const baseClasses = 'bg-gray-200 rounded'

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: '',
  }

  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-12',
    circular: 'rounded-full',
  }

  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (lines > 1) {
    return (
      <div className={clsx('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              baseClasses,
              animationClasses[animation],
              variantClasses[variant],
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={index === 0 ? skeletonStyle : undefined}
            role="status"
            aria-label="Cargando contenido"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={clsx(baseClasses, animationClasses[animation], variantClasses[variant], className)}
      style={skeletonStyle}
      role="status"
      aria-label="Cargando contenido"
    />
  )
}

export default Skeleton
