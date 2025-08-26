'use client'

/**
 * UnifiedServiceCard Component
 * 
 * A comprehensive, unified card component for displaying both Trámites and OPAs
 * with consistent visual design, management actions, and responsive behavior.
 * 
 * Features:
 * - Unified design matching /tramites page visual standard
 * - Role-based management buttons (edit, toggle, delete, view, duplicate)
 * - Responsive design for all viewports
 * - Accessibility support with ARIA labels
 * - Loading and error states
 * - Expandable sections (requirements, description)
 * - Proper text truncation and formatting
 */

import React, { useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { Card, Button, Badge } from '@/components/atoms'
import { ToggleSwitch } from '@/components/atoms/ToggleSwitch'
import { getServiceDescription, truncateByChars, isMeaningfulText } from '@/utils/textUtils'

// Types
export interface UnifiedServiceData {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo: 'tramite' | 'opa'
  activo: boolean
  dependencia?: string
  subdependencia?: string
  tiempo_estimado?: string
  vistas?: number
  created_at?: string
  updated_at?: string
  originalData?: {
    tiene_pago?: boolean
    requiere_pago?: boolean
    requisitos?: string[]
    formulario?: string
    visualizacion_suit?: string
    visualizacion_gov?: string
    [key: string]: any
  }
}

export interface ManagementActions {
  onEdit?: (service: UnifiedServiceData) => void
  onToggle?: (service: UnifiedServiceData, newState: boolean) => void
  onDelete?: (service: UnifiedServiceData) => void
  onView?: (service: UnifiedServiceData) => void
  onDuplicate?: (service: UnifiedServiceData) => void
}

export interface UnifiedServiceCardProps {
  /** Service data */
  service: UnifiedServiceData
  
  /** Management actions */
  actions?: ManagementActions
  
  /** User role for determining available actions */
  userRole?: 'admin' | 'funcionario' | 'ciudadano'
  
  /** Context where the card is displayed */
  context?: 'public' | 'admin' | 'funcionario'
  
  /** Loading states for specific actions */
  loadingStates?: {
    toggle?: boolean
    edit?: boolean
    delete?: boolean
    view?: boolean
    duplicate?: boolean
  }
  
  /** Error states */
  errorStates?: {
    toggle?: string
    edit?: string
    delete?: string
    view?: string
    duplicate?: string
  }
  
  /** Permissions for actions */
  permissions?: {
    edit?: boolean
    toggle?: boolean
    delete?: boolean
    view?: boolean
    duplicate?: boolean
  }
  
  /** Show expanded details by default */
  defaultExpanded?: boolean
  
  /** Additional CSS classes */
  className?: string
  
  /** Test ID for testing */
  'data-testid'?: string
}

export const UnifiedServiceCard: React.FC<UnifiedServiceCardProps> = ({
  service,
  actions = {},
  userRole = 'ciudadano',
  context = 'public',
  loadingStates = {},
  errorStates = {},
  permissions = {},
  defaultExpanded = false,
  className,
  'data-testid': testId,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Determine if management actions should be shown
  const showManagementActions = context !== 'public' && (userRole === 'admin' || userRole === 'funcionario')
  
  // Get service description with proper fallbacks
  const description = getServiceDescription(service)
  const truncatedDescription = truncateByChars(description, 200)
  const hasLongDescription = description.length > 200
  const showDescription = isMeaningfulText(description)

  // Payment status for trámites
  const hasPayment = service.tipo === 'tramite' && 
    (service.originalData?.tiene_pago === true || service.originalData?.requiere_pago === true)

  // Requirements for trámites
  const hasRequirements = service.tipo === 'tramite' && 
    service.originalData?.requisitos && 
    Array.isArray(service.originalData.requisitos) && 
    service.originalData.requisitos.length > 0

  // Handle management actions
  const handleToggle = useCallback((newState: boolean) => {
    actions.onToggle?.(service, newState)
  }, [actions.onToggle, service])

  const handleEdit = useCallback(() => {
    actions.onEdit?.(service)
  }, [actions.onEdit, service])

  const handleDelete = useCallback(() => {
    actions.onDelete?.(service)
  }, [actions.onDelete, service])

  const handleView = useCallback(() => {
    actions.onView?.(service)
  }, [actions.onView, service])

  const handleDuplicate = useCallback(() => {
    actions.onDuplicate?.(service)
  }, [actions.onDuplicate, service])

  return (
    <Card 
      className={clsx(
        'hover:shadow-lg transition-shadow duration-200',
        className
      )}
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 1. HEADER SECTION: Type badge + Payment badge + Code integrated with title */}
          <div className="mb-4">
            {/* Type and Payment badges BEFORE title */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={
                  service.tipo === 'tramite'
                    ? 'primary'
                    : service.tipo === 'opa'
                    ? 'secondary'
                    : 'success'
                }
                className="text-sm font-medium px-3 py-1"
              >
                {service.tipo === 'tramite'
                  ? `📄 TRÁMITE ${(service.codigo || 'SIN-CÓDIGO').replace('T-', '')}`
                  : `⚡ OPA ${(service.codigo || 'SIN-CÓDIGO').replace('O-', '')}`}
              </Badge>

              {/* Payment status badge for trámites */}
              {service.tipo === 'tramite' && (
                <Badge
                  variant={hasPayment ? "warning" : "success"}
                  className="text-xs font-medium"
                >
                  {hasPayment ? "💰 Con pago" : "🆓 Gratuito"}
                </Badge>
              )}

              {/* Status badge for admin/funcionario contexts */}
              {showManagementActions && (
                <Badge
                  variant={service.activo ? "success" : "danger"}
                  className="text-xs font-medium"
                >
                  {service.activo ? "✅ Activo" : "❌ Inactivo"}
                </Badge>
              )}
            </div>

            {/* Title without code (code now in badge) */}
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {service.nombre}
            </h4>

            {/* DEPENDENCY HIERARCHY SUBTITLE */}
            {(service.dependencia || service.subdependencia) && (
              <div className="mb-3">
                <div
                  className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border-l-4 border-blue-400"
                  role="region"
                  aria-label="Información de dependencia"
                >
                  <span className="text-blue-600 mr-2" aria-hidden="true">🏛️</span>
                  <span className="font-medium">
                    {service.dependencia}
                    {service.subdependencia && (
                      <>
                        <span className="mx-2 text-gray-400" aria-hidden="true">›</span>
                        <span className="text-gray-700">{service.subdependencia}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. SERVICE DESCRIPTION WITH PROPER TRUNCATION */}
          {showDescription && (
            <div
              className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400"
              role="region"
              aria-label="Descripción del servicio"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium text-sm">
                    <span aria-hidden="true">📝</span>
                    Descripción:
                  </span>
                </div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {showFullDescription ? description : truncatedDescription}
                  {hasLongDescription && (
                    <button 
                      type="button"
                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* 3. REQUIREMENTS SECTION (Expandible) - Only for trámites */}
          {hasRequirements && (
            <div className="mb-4">
              <button
                type="button"
                className="flex items-center justify-between w-full p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400 hover:bg-amber-100 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`requirements-${service.id}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-700 font-medium text-sm">
                    <span aria-hidden="true">📋</span>
                    Requisitos ({service.originalData?.requisitos?.length || 0})
                  </span>
                </div>
                <span className="text-amber-600" aria-hidden="true">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              
              {isExpanded && (
                <div 
                  id={`requirements-${service.id}`}
                  className="mt-2 p-3 bg-white rounded-lg border border-amber-200"
                >
                  <ul className="space-y-2">
                    {service.originalData?.requisitos?.map((requisito, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-amber-600 mt-1" aria-hidden="true">•</span>
                        <span>{requisito}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Government portal links - show only when URL is valid and flag is true */}
                  {(((service.originalData?.url_suit && /^https?:\/\//.test(service.originalData.url_suit)) && service.originalData?.visualizacion_suit === true) ||
                    ((service.originalData?.url_gov && /^https?:\/\//.test(service.originalData.url_gov)) && service.originalData?.visualizacion_gov === true)) && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Enlaces oficiales:</span>
                        {service.originalData?.url_suit && /^https?:\/\//.test(service.originalData.url_suit) && service.originalData?.visualizacion_suit === true && (
                          <a
                            href={service.originalData.url_suit}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Abrir trámite en SUIT (se abre en nueva pestaña)"
                          >
                            SUIT
                          </a>
                        )}
                        {service.originalData?.url_gov && /^https?:\/\//.test(service.originalData.url_gov) && service.originalData?.visualizacion_gov === true && (
                          <a
                            href={service.originalData.url_gov}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Abrir trámite en GOV.CO (se abre en nueva pestaña)"
                          >
                            GOV.CO
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. ESTIMATED TIME - Prominently displayed */}
          {service.tiempo_estimado && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium text-sm">⏱️ Tiempo estimado:</span>
                <span className="font-semibold text-gray-800">{service.tiempo_estimado}</span>
              </div>
            </div>
          )}

          {/* 5. ADDITIONAL INFORMATION */}
          <div className="space-y-2 text-sm text-gray-600">
            {service.vistas && (
              <div className="text-xs text-gray-500">
                👁️ {service.vistas} vistas
              </div>
            )}
            
            {service.updated_at && showManagementActions && (
              <div className="text-xs text-gray-500">
                📅 Actualizado: {new Date(service.updated_at).toLocaleDateString('es-CO')}
              </div>
            )}
          </div>
        </div>

        {/* MANAGEMENT ACTIONS PANEL */}
        {showManagementActions && (
          <div className="ml-4 flex flex-col gap-2 min-w-0">
            {/* Quick Toggle Switch */}
            {permissions.toggle !== false && actions.onToggle && (
              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={service.activo}
                  onChange={handleToggle}
                  loading={loadingStates.toggle}
                  size="sm"
                  confirmationRequired={true}
                  confirmationMessage={`¿Estás seguro de que deseas ${service.activo ? 'desactivar' : 'activar'} "${service.nombre}"?`}
                  data-testid={`toggle-${service.id}`}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              {permissions.view !== false && actions.onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleView}
                  loading={loadingStates.view}
                  className="text-xs px-2 py-1 justify-start"
                  data-testid={`view-${service.id}`}
                >
                  👁️ Ver
                </Button>
              )}

              {permissions.edit !== false && actions.onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  loading={loadingStates.edit}
                  className="text-xs px-2 py-1 justify-start"
                  data-testid={`edit-${service.id}`}
                >
                  ✏️ Editar
                </Button>
              )}

              {permissions.duplicate !== false && actions.onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDuplicate}
                  loading={loadingStates.duplicate}
                  className="text-xs px-2 py-1 justify-start"
                  data-testid={`duplicate-${service.id}`}
                >
                  📋 Duplicar
                </Button>
              )}

              {permissions.delete !== false && actions.onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  loading={loadingStates.delete}
                  className="text-xs px-2 py-1 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`delete-${service.id}`}
                >
                  🗑️ Eliminar
                </Button>
              )}
            </div>

            {/* Error Messages */}
            {Object.entries(errorStates).map(([action, error]) => 
              error && (
                <div key={action} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default UnifiedServiceCard
