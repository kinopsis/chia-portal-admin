/**
 * Export Modal Component
 * Modal for exporting services (trámites and OPAs) to CSV or JSON
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Modal } from '@/components/atoms'
import { Button } from '@/components/ui'
import type { ServiceEnhanced } from '@/types'
import { useExportImport, type ExportFormat } from '@/hooks/useExportImport'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  services: ServiceEnhanced[]
  onExportComplete?: () => void
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  services,
  onExportComplete
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all')
  const { exportServices, exportLoading, exportError } = useExportImport()

  const handleExport = useCallback(async () => {
    // Determine which services to export
    const servicesToExport = exportScope === 'all' ? services : services
    
    // Perform export
    const result = await exportServices(servicesToExport, format)
    
    if (result.success) {
      onExportComplete?.()
      onClose()
    }
  }, [services, format, exportScope, exportServices, onExportComplete, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportar Servicios"
      size="md"
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Formato de exportación</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="format-csv"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="format-csv" className="ml-3 block text-sm text-gray-700">
                CSV (Valores separados por comas)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="format-json"
                name="format"
                value="json"
                checked={format === 'json'}
                onChange={() => setFormat('json')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="format-json" className="ml-3 block text-sm text-gray-700">
                JSON (Formato de intercambio de datos)
              </label>
            </div>
          </div>
        </div>

        {/* Export Scope */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Servicios a exportar</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="scope-all"
                name="scope"
                value="all"
                checked={exportScope === 'all'}
                onChange={() => setExportScope('all')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="scope-all" className="ml-3 block text-sm text-gray-700">
                Todos los servicios ({services.length} registros)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="scope-filtered"
                name="scope"
                value="filtered"
                checked={exportScope === 'filtered'}
                onChange={() => setExportScope('filtered')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                disabled
              />
              <label htmlFor="scope-filtered" className="ml-3 block text-sm text-gray-700">
                Solo servicios visibles (filtrados)
              </label>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nota: Actualmente se exportarán todos los servicios
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Vista previa</h3>
          <div className="text-sm text-gray-600">
            <p>Formato: {format.toUpperCase()}</p>
            <p>Servicios a exportar: {services.length}</p>
            <p>Campos incluidos: Código, Nombre, Descripción, Tipo, etc.</p>
          </div>
        </div>

        {/* Error Message */}
        {exportError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{exportError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={exportLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportLoading}
          >
            {exportLoading ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ExportModal
