/**
 * useExportImport Hook
 * Custom hook for handling export/import functionality for services
 */

import { useState, useCallback } from 'react'
import { exportImportService, type ConflictStrategy } from '@/services/exportImportService'
import type { ServiceEnhanced } from '@/types'
import { downloadFile } from '@/utils/fileUtils'

// Export format types
export type ExportFormat = 'csv' | 'json'

// Import result interface
export interface ImportResult {
  success: boolean
  message: string
  created: number
  updated: number
  skipped: number
  errors: string[]
}

/**
 * useExportImport hook
 */
export function useExportImport() {
  // Loading and error states
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  /**
   * Export services to file
   */
  const exportServices = useCallback(
    async (
      services: ServiceEnhanced[],
      format: ExportFormat = 'csv',
      filename?: string
    ) => {
      try {
        setExportLoading(true)
        setExportError(null)

        let content = ''
        let mimeType = ''
        let extension = ''

        if (format === 'csv') {
          content = exportImportService.exportServicesToCSV(services)
          mimeType = 'text/csv'
          extension = 'csv'
        } else {
          content = exportImportService.exportServicesToJSON(services)
          mimeType = 'application/json'
          extension = 'json'
        }

        const finalFilename = filename || `servicios-${new Date().toISOString().split('T')[0]}.${extension}`
        downloadFile(content, finalFilename, mimeType)

        return { success: true, error: null }
      } catch (error) {
        const errorMessage = `Error exportando servicios: ${(error as Error).message}`
        setExportError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setExportLoading(false)
      }
    },
    []
  )

  /**
   * Import services from file
   */
  const importServices = useCallback(
    async (
      file: File,
      conflictStrategy: ConflictStrategy = 'update'
    ) => {
      try {
        setImportLoading(true)
        setImportError(null)
        setImportResult(null)

        // Check file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !['csv', 'json'].includes(fileExtension)) {
          throw new Error('Formato de archivo no soportado. Use CSV o JSON.')
        }

        // Read file content
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = (e) => reject(new Error('Error leyendo el archivo'))
          reader.readAsText(file)
        })

        // Parse content based on file type
        let services: ServiceEnhanced[] = []
        if (fileExtension === 'csv') {
          services = exportImportService.parseCSVToServices(content)
        } else {
          services = exportImportService.parseJSONToServices(content)
        }

        // Validate services
        const validationErrors: string[] = []
        services.forEach((service, index) => {
          const validation = exportImportService.validateServiceData(service)
          if (!validation.isValid) {
            validationErrors.push(
              `Fila ${index + 1}: ${validation.errors.join(', ')}`
            )
          }
        })

        if (validationErrors.length > 0) {
          throw new Error(
            `Errores de validación:\n${validationErrors.join('\n')}`
          )
        }

        // Import services
        const result = await exportImportService.importServices(
          services,
          conflictStrategy
        )

        setImportResult(result)
        return result
      } catch (error) {
        const errorMessage = `Error importando servicios: ${(error as Error).message}`
        setImportError(errorMessage)
        return {
          success: false,
          message: errorMessage,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: [errorMessage]
        }
      } finally {
        setImportLoading(false)
      }
    },
    []
  )

  /**
   * Reset import result
   */
  const resetImportResult = useCallback(() => {
    setImportResult(null)
  }, [])

  return {
    // States
    exportLoading,
    importLoading,
    exportError,
    importError,
    importResult,

    // Functions
    exportServices,
    importServices,
    resetImportResult
  }
}