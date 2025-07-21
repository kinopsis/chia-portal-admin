'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'

export interface SwipeAction {
  key: string
  label: string
  icon?: React.ReactNode
  color: 'red' | 'green' | 'blue' | 'yellow' | 'gray'
  onClick: () => void
}

export interface SwipeActionsProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  threshold?: number
  disabled?: boolean
  className?: string
}

const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  disabled = false,
  className,
}) => {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxSwipeDistance = 120

  const colorClasses = {
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    gray: 'bg-gray-500 text-white',
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }, [disabled])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return

    const currentX = e.touches[0].clientX
    const deltaX = currentX - startX
    
    // Limit swipe distance
    const limitedDeltaX = Math.max(
      -maxSwipeDistance, 
      Math.min(maxSwipeDistance, deltaX)
    )
    
    setTranslateX(limitedDeltaX)
  }, [isDragging, startX, disabled, maxSwipeDistance])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || disabled) return

    setIsDragging(false)
    
    // Check if swipe threshold was reached
    const absTranslateX = Math.abs(translateX)
    
    if (absTranslateX >= threshold) {
      // Execute action if available
      if (translateX > 0 && leftActions.length > 0) {
        leftActions[0].onClick()
      } else if (translateX < 0 && rightActions.length > 0) {
        rightActions[0].onClick()
      }
    }
    
    // Reset position
    setTranslateX(0)
  }, [isDragging, translateX, threshold, leftActions, rightActions, disabled])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    
    setIsDragging(true)
    setStartX(e.clientX)
  }, [disabled])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return

    const deltaX = e.clientX - startX
    const limitedDeltaX = Math.max(
      -maxSwipeDistance, 
      Math.min(maxSwipeDistance, deltaX)
    )
    
    setTranslateX(limitedDeltaX)
  }, [isDragging, startX, disabled, maxSwipeDistance])

  const handleMouseUp = useCallback(() => {
    if (!isDragging || disabled) return

    setIsDragging(false)
    
    const absTranslateX = Math.abs(translateX)
    
    if (absTranslateX >= threshold) {
      if (translateX > 0 && leftActions.length > 0) {
        leftActions[0].onClick()
      } else if (translateX < 0 && rightActions.length > 0) {
        rightActions[0].onClick()
      }
    }
    
    setTranslateX(0)
  }, [isDragging, translateX, threshold, leftActions, rightActions, disabled])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null

    return (
      <div
        className={clsx(
          'absolute top-0 bottom-0 flex items-center',
          side === 'left' ? 'left-0' : 'right-0'
        )}
        style={{
          width: maxSwipeDistance,
          [side === 'left' ? 'transform' : 'transform']: 
            side === 'left' 
              ? `translateX(-${maxSwipeDistance}px)` 
              : `translateX(${maxSwipeDistance}px)`
        }}
      >
        {actions.map((action, index) => (
          <button
            key={action.key}
            className={clsx(
              'flex-1 h-full flex flex-col items-center justify-center text-sm font-medium transition-colors',
              colorClasses[action.color],
              'hover:opacity-90 active:opacity-75'
            )}
            onClick={(e) => {
              e.stopPropagation()
              action.onClick()
            }}
            aria-label={action.label}
          >
            {action.icon && (
              <div className="mb-1 text-lg">
                {action.icon}
              </div>
            )}
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={clsx('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Left actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right actions */}
      {renderActions(rightActions, 'right')}
      
      {/* Main content */}
      <div
        className={clsx(
          'relative z-10 transition-transform',
          isDragging ? 'duration-0' : 'duration-300 ease-out'
        )}
        style={{
          transform: `translateX(${translateX}px)`,
        }}
      >
        {children}
      </div>
      
      {/* Swipe hint overlay */}
      {Math.abs(translateX) > 20 && (
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 z-20 pointer-events-none',
            'transition-opacity duration-200'
          )}
        >
          <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
            {translateX > 0 && leftActions.length > 0 && (
              <span>← {leftActions[0].label}</span>
            )}
            {translateX < 0 && rightActions.length > 0 && (
              <span>{rightActions[0].label} →</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SwipeActions
