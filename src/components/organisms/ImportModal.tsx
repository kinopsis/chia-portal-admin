/**
 * Import Modal Component
 * Modal for importing services (trámites and OPAs) from CSV or JSON files
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Modal } from '@/components/atoms'
import { Button } from '@/components/ui'
import { useExportImport, type ConflictStrategy } from '@/hooks/useExportImport'
import { formatFileSize } from '@/utils/fileUtils'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('update')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { importServices, importLoading, importError, importResult, resetImportResult } = useExportImport()

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase()
      
      if (fileExtension && ['csv', 'json'].includes(fileExtension)) {
        setFile(droppedFile)
        resetImportResult()
      } else {
        // Handle invalid file type
        alert('Formato de archivo no soportado. Use CSV o JSON.')
      }
    }
  }, [resetImportResult])

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      
      if (fileExtension && ['csv', 'json'].includes(fileExtension)) {
        setFile(selectedFile)
        resetImportResult()
      } else {
        // Handle invalid file type
        alert('Formato de archivo no soportado. Use CSV o JSON.')
      }
    }
  }, [resetImportResult])

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle import
  const handleImport = useCallback(async () => {
    if (!file) return

    const result = await importServices(file, conflictStrategy)
    
    if (result.success) {
      onImportComplete?.()
      // Keep modal open to show results
    }
  }, [file, conflictStrategy, importServices, onImportComplete])

  // Reset and close modal
  const handleReset = useCallback(() => {
    setFile(null)
    resetImportResult()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [resetImportResult])

  // Close modal
  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Servicios"
      size="md"
    >
      <div className="space-y-6">
        {/* File Upload Area */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Seleccionar archivo</h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Seleccionar archivo para importar servicios"
            />
            
            {file ? (
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReset()
                  }}
                >
                  Cambiar archivo
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">📁</span>
                </div>
                <p className="font-medium text-gray-900">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="text-sm text-gray-500">
                  o haz clic para seleccionar un archivo
                </p>
                <p className="text-xs text-gray-400">
                  Formatos soportados: CSV, JSON
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Resolution Strategy */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Manejo de conflictos</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="strategy-update"
                name="conflictStrategy"
                value="update"
                checked={conflictStrategy === 'update'}
                onChange={() => setConflictStrategy('update')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="strategy-update" className="ml-3 block text-sm text-gray-700">
                Actualizar servicios existentes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="strategy-skip"
                name="conflictStrategy"
                value="skip"
                checked={conflictStrategy === 'skip'}
                onChange={() => setConflictStrategy('skip')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="strategy-skip" className="ml-3 block text-sm text-gray-700">
                Omitir servicios existentes
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="strategy-create"
                name="conflictStrategy"
                value="create"
                checked={conflictStrategy === 'create'}
                onChange={() => setConflictStrategy('create')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="strategy-create" className="ml-3 block text-sm text-gray-700">
                Crear nuevos servicios (puede duplicar)
              </label>
            </div>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`rounded-md p-4 ${
            importResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-medium text-gray-900 mb-2">
              {importResult.success ? '✅ Importación completada' : '❌ Error en la importación'}
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>{importResult.message}</p>
              {importResult.success && (
                <>
                  <p>Creados: {importResult.created}</p>
                  <p>Actualizados: {importResult.updated}</p>
                  <p>Omitidos: {importResult.skipped}</p>
                </>
              )}
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Errores:</p>
                  <ul className="list-disc list-inside">
                    {importResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 3 && (
                      <li>+ {importResult.errors.length - 3} errores más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {importError && !importResult && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{importError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={importLoading}
          >
            {importResult?.success ? 'Cerrar' : 'Cancelar'}
          </Button>
          
          {!importResult?.success && (
            <Button
              onClick={handleImport}
              disabled={!file || importLoading}
            >
              {importLoading ? 'Importando...' : 'Importar'}
            </Button>
          )}
          
          {importResult?.success && (
            <Button
              onClick={handleClose}
            >
              Aceptar
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ImportModal
