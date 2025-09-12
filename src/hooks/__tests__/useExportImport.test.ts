/**
 * useExportImport Hook Tests
 */

import { renderHook, act } from '@testing-library/react'
import { useExportImport } from '../useExportImport'

// Mock the exportImportService
jest.mock('@/services/exportImportService', () => ({
  exportImportService: {
    exportServicesToCSV: jest.fn().mockReturnValue('csv-content'),
    exportServicesToJSON: jest.fn().mockReturnValue('json-content'),
    parseCSVToServices: jest.fn().mockReturnValue([]),
    parseJSONToServices: jest.fn().mockReturnValue([]),
    importServices: jest.fn().mockResolvedValue({
      success: true,
      message: 'Import successful',
      created: 1,
      updated: 0,
      skipped: 0,
      errors: []
    }),
    validateServiceData: jest.fn().mockReturnValue({ isValid: true, errors: [] })
  }
}))

// Mock the fileUtils
jest.mock('@/utils/fileUtils', () => ({
  downloadFile: jest.fn()
}))

describe('useExportImport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with correct default states', () => {
    const { result } = renderHook(() => useExportImport())
    
    expect(result.current.exportLoading).toBe(false)
    expect(result.current.importLoading).toBe(false)
    expect(result.current.exportError).toBeNull()
    expect(result.current.importError).toBeNull()
    expect(result.current.importResult).toBeNull()
  })

  it('should export services to CSV', async () => {
    const { result } = renderHook(() => useExportImport())
    
    await act(async () => {
      await result.current.exportServices([], 'csv', 'test.csv')
    })
    
    expect(result.current.exportLoading).toBe(false)
    expect(result.current.exportError).toBeNull()
  })

  it('should export services to JSON', async () => {
    const { result } = renderHook(() => useExportImport())
    
    await act(async () => {
      await result.current.exportServices([], 'json', 'test.json')
    })
    
    expect(result.current.exportLoading).toBe(false)
    expect(result.current.exportError).toBeNull()
  })

  it('should handle export errors', async () => {
    // Mock an error
    jest.spyOn(global.console, 'error').mockImplementation()
    
    const { result } = renderHook(() => useExportImport())
    
    // Force an error by mocking the export function to throw
    const exportImportService = require('@/services/exportImportService').exportImportService
    exportImportService.exportServicesToCSV.mockImplementationOnce(() => {
      throw new Error('Export error')
    })
    
    await act(async () => {
      await result.current.exportServices([], 'csv')
    })
    
    expect(result.current.exportError).toContain('Error exportando servicios')
  })

  it('should import services from file', async () => {
    const { result } = renderHook(() => useExportImport())
    
    // Create a mock file
    const file = new File(['content'], 'test.csv', { type: 'text/csv' })
    
    await act(async () => {
      await result.current.importServices(file, 'update')
    })
    
    expect(result.current.importLoading).toBe(false)
    expect(result.current.importError).toBeNull()
    expect(result.current.importResult).not.toBeNull()
  })

  it('should handle unsupported file types', async () => {
    const { result } = renderHook(() => useExportImport())
    
    // Create a mock file with unsupported type
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    await act(async () => {
      await result.current.importServices(file, 'update')
    })
    
    expect(result.current.importError).toContain('Formato de archivo no soportado')
  })

  it('should reset import result', async () => {
    const { result } = renderHook(() => useExportImport())
    
    // Set some result
    const file = new File(['content'], 'test.csv', { type: 'text/csv' })
    await act(async () => {
      await result.current.importServices(file, 'update')
    })
    
    expect(result.current.importResult).not.toBeNull()
    
    // Reset
    act(() => {
      result.current.resetImportResult()
    })
    
    expect(result.current.importResult).toBeNull()
  })
})