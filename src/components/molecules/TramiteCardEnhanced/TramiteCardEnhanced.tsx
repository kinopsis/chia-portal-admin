'use client'

/**
 * TramiteCardEnhanced Component
 * 
 * Enhanced tramite card component based on the reference image design.
 * Features accordion sections, structured footer, and comprehensive information display.
 */

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Card, Button, Badge, ConfirmDialog } from '@/components/atoms'
import { ToggleSwitch } from '@/components/atoms/ToggleSwitch'
import { AccordionSection } from '@/components/molecules/AccordionSection/AccordionSection'
import { TramiteFooterInfo } from '@/components/molecules/TramiteFooterInfo/TramiteFooterInfo'

import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Tramite, ServiceEnhanced, TramiteEnhanced, OPAEnhanced } from '@/types'

// Management Actions Interface
export interface TramiteManagementActions {
  onEdit?: (service: ServiceEnhanced) => void
  onToggle?: (service: ServiceEnhanced, newState: boolean) => void
  onDelete?: (service: ServiceEnhanced) => void
  onView?: (service: ServiceEnhanced) => void
  onDuplicate?: (service: ServiceEnhanced) => void
}

export interface TramiteCardEnhancedProps {
  /** Service data - can be either Tramite or OPA */
  tramite: ServiceEnhanced

  /** Whether sections are expanded by default */
  defaultExpanded?: boolean

  /** Whether to show management actions */
  showManagementActions?: boolean

  /** Context where the card is displayed */
  context?: 'public' | 'admin' | 'funcionario'

  /** Management actions */
  actions?: TramiteManagementActions

  /** User role for determining available actions */
  userRole?: 'admin' | 'funcionario' | 'ciudadano'

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

  /** Additional CSS classes */
  className?: string

  /** Test ID for testing */
  'data-testid'?: string
}

export const TramiteCardEnhanced: React.FC<TramiteCardEnhancedProps> = ({
  tramite,
  defaultExpanded = false,
  showManagementActions = false,
  context = 'public',
  actions = {},
  userRole = 'ciudadano',
  loadingStates = {},
  errorStates = {},
  permissions = {},
  className,
  'data-testid': testId,
}) => {
  // Main accordion state - controls the entire card expansion
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Delete confirmation modal state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // Determine if management actions should be shown
  const shouldShowManagementActions = showManagementActions &&
    context !== 'public' &&
    (userRole === 'admin' || userRole === 'funcionario')

  // Siempre mostrar todas las secciones para paridad visual completa
  const hasRequisitos = true
  const hasInstructivo = true  // Siempre mostrar instrucciones
  const hasObservaciones = true  // Siempre mostrar observaciones
  const hasDescripcion = true  // Siempre mostrar descripción

  // Dynamic content based on service type
  const isOPA = tramite.tipo === 'opa'
  const isTramite = tramite.tipo === 'tramite'
  const serviceTypeLabel = isOPA ? 'OPA' : 'Trámite'
  const serviceTypeBgColor = isOPA ? 'bg-green-100' : 'bg-blue-100'
  const serviceTypeTextColor = isOPA ? 'text-green-800' : 'text-blue-800'
  const serviceTypeBorderColor = isOPA ? 'border-green-200' : 'border-blue-200'

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle management actions
  const handleToggle = useCallback((newState: boolean) => {
    actions.onToggle?.(tramite, newState)
  }, [actions.onToggle, tramite])

  const handleEdit = useCallback(() => {
    actions.onEdit?.(tramite)
  }, [actions.onEdit, tramite])

  const handleDelete = useCallback(() => {
    setShowDeleteConfirmation(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    actions.onDelete?.(tramite)
    setShowDeleteConfirmation(false)
  }, [actions.onDelete, tramite])

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false)
  }, [])

  const handleView = useCallback(() => {
    actions.onView?.(tramite)
  }, [actions.onView, tramite])

  const handleDuplicate = useCallback(() => {
    actions.onDuplicate?.(tramite)
  }, [actions.onDuplicate, tramite])

  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-shadow duration-200 overflow-hidden',
        className
      )}
      data-testid={testId}
    >
      <div className={cn(
        'flex',
        shouldShowManagementActions ? 'items-start' : 'items-center'
      )}>
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {/* CLICKABLE HEADER - Always visible */}
          <button
            type="button"
            className={cn(
              "w-full text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset",
              shouldShowManagementActions ? "p-3" : "p-4" // Reduced padding for management pages
            )}
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls={`service-content-${tramite.id}`}
          >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Title with Badge inline */}
            <div className={cn(
              "flex items-center gap-3",
              shouldShowManagementActions ? "mb-1" : "mb-2" // Reduced margin for management pages
            )}>
              <h3 className={cn(
                "font-semibold text-gray-900 leading-tight",
                shouldShowManagementActions ? "text-sm" : "text-base" // Smaller text for management pages
              )}>
                {tramite.nombre}
              </h3>
            </div>

            {/* Badge and Dependency Hierarchy in same line */}
            <div className="flex items-center gap-3 text-sm">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                serviceTypeBgColor,
                serviceTypeTextColor,
                serviceTypeBorderColor
              )}>
                {serviceTypeLabel}
              </span>

              {(tramite.dependencia || tramite.subdependencia) && (
                <span className="text-gray-600">
                  {tramite.dependencia}
                  {tramite.subdependencia && (
                    <>
                      <span className="mx-2">→</span>
                      {tramite.subdependencia}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <div className="ml-4 flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* EXPANDABLE CONTENT SECTION - Only visible when expanded */}
      {isExpanded && (
        <div
          id={`service-content-${tramite.id}`}
          className={cn(
            "animate-in slide-in-from-top-2 duration-300",
            shouldShowManagementActions
              ? "px-3 pb-3 space-y-2" // Compact spacing for management pages
              : "px-6 pb-6 space-y-4"  // Normal spacing for public pages
          )}
        >

        {/* Sección Descripción - Siempre visible */}
        {hasDescripcion && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-gray-600 text-sm" aria-hidden="true">📝</span>
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Descripción:</h4>
                <p className="text-sm text-gray-700">
                  {tramite.descripcion || tramite.formulario ||
                    'No se ha especificado una descripción para este servicio. Consulte con la dependencia correspondiente.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Requisitos Accordion - Siempre visible */}
        {hasRequisitos && (
          <AccordionSection
            title="Requisitos"
            count={tramite.requisitos?.length || 0}
            icon="📋"
            variant="requisitos"
            defaultExpanded={defaultExpanded}
          >
            {tramite.requisitos && tramite.requisitos.length > 0 ? (
              <ul className="space-y-2">
                {tramite.requisitos.map((requisito, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-600 mt-1 flex-shrink-0" aria-hidden="true">•</span>
                    <span>{requisito}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600 italic">
                No se han especificado requisitos para este trámite. Consulte con la dependencia correspondiente.
              </div>
            )}
          </AccordionSection>
        )}

        {/* Instrucciones Accordion - Siempre visible */}
        {hasInstructivo && (
          <AccordionSection
            title="Instrucciones"
            count={(tramite.instructivo || tramite.instrucciones)?.length || 0}
            icon="📝"
            variant="instrucciones"
            defaultExpanded={defaultExpanded}
          >
            {/* Fix: Support both instructivo and instrucciones field names */}
            {((tramite.instructivo || tramite.instrucciones) && (tramite.instructivo || tramite.instrucciones).length > 0) ? (
              <ol className="space-y-2">
                {(tramite.instructivo || tramite.instrucciones).map((instruccion, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{instruccion}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-gray-600 italic">
                No se han especificado instrucciones para este servicio. Consulte con la dependencia correspondiente.
              </div>
            )}
          </AccordionSection>
        )}

          {/* FOOTER SECTION */}
          <div className="mt-6">
            <TramiteFooterInfo
              tiempoRespuesta={tramite.tiempo_respuesta}
              tieneCosto={tramite.tiene_pago ?? false}
              modalidad={tramite.modalidad || 'presencial'}
            />
          </div>

        {/* Observaciones - Siempre visible */}
        {hasObservaciones && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 text-sm" aria-hidden="true">💡</span>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Observaciones:</h4>
                <p className="text-sm text-yellow-700">
                  {(tramite.observaciones && tramite.observaciones.trim() !== '')
                    ? tramite.observaciones
                    : 'No se han especificado observaciones adicionales para este servicio.'}
                </p>
              </div>
            </div>
          </div>
        )}

          {/* Government Portal Links - show only when URL is valid and flag is true */}
          {(((tramite.url_suit && /^https?:\/\//.test(tramite.url_suit)) && tramite.visualizacion_suit === true) ||
            ((tramite.url_gov && /^https?:\/\//.test(tramite.url_gov)) && tramite.visualizacion_gov === true)) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 font-medium">Enlaces oficiales:</span>
                {tramite.url_suit && /^https?:\/\//.test(tramite.url_suit) && tramite.visualizacion_suit === true && (
                  <a
                    href={tramite.url_suit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                    aria-label="Abrir trámite en SUIT (se abre en nueva pestaña)"
                  >
                    SUIT
                  </a>
                )}
                {tramite.url_gov && /^https?:\/\//.test(tramite.url_gov) && tramite.visualizacion_gov === true && (
                  <a
                    href={tramite.url_gov}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
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

        {/* MANAGEMENT ACTIONS PANEL - Compact Version */}
        {shouldShowManagementActions && (
          <div className="flex flex-col gap-1 p-2 min-w-0 border-l border-gray-200">
            {/* Status Badge */}
            <div className="mb-1">
              <Badge
                variant={tramite.activo ? "success" : "danger"}
                className="text-xs font-medium"
              >
                {tramite.activo ? "✅ Activo" : "❌ Inactivo"}
              </Badge>
            </div>

            {/* Quick Toggle Switch */}
            {permissions.toggle !== false && actions.onToggle && (
              <div className="flex items-center gap-1 mb-1">
                <ToggleSwitch
                  checked={tramite.activo}
                  onChange={handleToggle}
                  loading={loadingStates.toggle}
                  size="sm"
                  confirmationRequired={true}
                  confirmationMessage={`¿Estás seguro de que deseas ${tramite.activo ? 'desactivar' : 'activar'} "${tramite.nombre}"?`}
                  data-testid={`toggle-${tramite.id}`}
                />
              </div>
            )}

            {/* Action Buttons - Compact Version */}
            <div className="flex flex-col gap-0.5">
              {permissions.view !== false && actions.onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleView}
                  loading={loadingStates.view}
                  className="text-xs px-1.5 py-0.5 justify-start h-6"
                  data-testid={`view-${tramite.id}`}
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
                  className="text-xs px-1.5 py-0.5 justify-start h-6"
                  data-testid={`edit-${tramite.id}`}
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
                  className="text-xs px-1.5 py-0.5 justify-start h-6"
                  data-testid={`duplicate-${tramite.id}`}
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
                  className="text-xs px-1.5 py-0.5 justify-start h-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`delete-${tramite.id}`}
                >
                  🗑️ Eliminar
                </Button>
              )}
            </div>

            {/* Last Updated Timestamp */}
            {tramite.updated_at && (
              <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                📅 Actualizado: {new Date(tramite.updated_at).toLocaleDateString('es-CO')}
              </div>
            )}

            {/* Error Messages */}
            {Object.entries(errorStates).map(([action, error]) =>
              error ? (
                <div key={action} className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1">
                  {error}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${tramite.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        loading={loadingStates.delete}
        icon={
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        }
      />
    </Card>
  )
}

export default TramiteCardEnhanced
