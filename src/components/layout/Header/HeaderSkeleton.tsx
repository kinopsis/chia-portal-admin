import React from 'react'
import { clsx } from 'clsx'

const HeaderSkeleton = () => {
  return (
    <header className={clsx('bg-background border-b border-border sticky top-0 z-50')}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 xs:h-14 sm:h-16 md:h-18">
          {/* Logo Section Skeleton */}
          <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 flex-shrink-0">
            <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-gradient-primary rounded-lg animate-pulse flex-shrink-0"></div>
            <div className="hidden xs:block min-w-0 space-y-1 animate-pulse">
              <div className="h-4 bg-background-secondary rounded w-24"></div>
              <div className="h-3 bg-background-secondary rounded w-20"></div>
            </div>
            <div className="xs:hidden space-y-0.5 animate-pulse">
              <div className="h-3 bg-background-secondary rounded w-12"></div>
              <div className="h-3 bg-background-secondary rounded w-8"></div>
            </div>
          </div>

          {/* Desktop Navigation Skeleton */}
          <div className="hidden md:block">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-16 bg-background-secondary rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Right Section Skeleton */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Placeholder */}
            <div className="w-8 h-8 bg-background-secondary rounded-full animate-pulse"></div>

            {/* Notifications Placeholder (if applicable) */}
            <div className="hidden sm:block w-8 h-8 bg-background-secondary rounded-full animate-pulse"></div>

            {/* User Section Placeholder */}
            <div className="flex items-center space-x-2">
              <div className="hidden lg:block space-y-1 animate-pulse">
                <div className="h-4 bg-background-secondary rounded w-24"></div>
                <div className="h-3 bg-background-secondary rounded w-16"></div>
              </div>
              <div className="w-8 h-8 bg-background-secondary rounded-full animate-pulse"></div>
            </div>

            {/* Mobile Menu Button Skeleton */}
            <div className="md:hidden w-8 h-8 bg-background-secondary rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderSkeleton