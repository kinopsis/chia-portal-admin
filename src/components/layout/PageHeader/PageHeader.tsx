import React from 'react'
import { Breadcrumb } from '@/components/molecules'
import { useBreadcrumbs } from '@/hooks'
import { clsx } from 'clsx'
import type { BreadcrumbItem } from '@/components/molecules/Breadcrumb/Breadcrumb'

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
  showBreadcrumbs?: boolean
  variant?: 'default' | 'admin' | 'minimal'
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs: customBreadcrumbs,
  actions,
  className,
  showBreadcrumbs = true,
  variant = 'default',
}) => {
  const autoBreadcrumbs = useBreadcrumbs(customBreadcrumbs)

  const getVariantClasses = () => {
    switch (variant) {
      case 'admin':
        return 'bg-white border-b border-gray-200'
      case 'minimal':
        return 'bg-transparent'
      default:
        return 'bg-gray-50 border-b border-gray-200'
    }
  }

  return (
    <div className={clsx('py-6', getVariantClasses(), className)}>
      <div className="container-custom">
        {/* Breadcrumbs */}
        {showBreadcrumbs && autoBreadcrumbs.length > 0 && (
          <div className="mb-4">
            <Breadcrumb items={autoBreadcrumbs} />
          </div>
        )}

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className={clsx(
              'font-bold text-gray-900 truncate',
              variant === 'minimal' ? 'text-2xl' : 'text-3xl'
            )}>
              {title}
            </h1>
            {description && (
              <p className={clsx(
                'text-gray-600 mt-2',
                variant === 'minimal' ? 'text-sm' : 'text-base'
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHeader
