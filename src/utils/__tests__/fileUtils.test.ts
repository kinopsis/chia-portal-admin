/**
 * File Utilities Tests
 */

import {
  downloadFile,
  parseCSV,
  convertToCSV,
  formatFileSize,
  isValidFileType,
  readFileAsText
} from '../fileUtils'

describe('fileUtils', () => {
  describe('downloadFile', () => {
    it('should create and download a file', () => {
      // Create a mock anchor element
      const mockAnchor = document.createElement('a')
      mockAnchor.click = jest.fn()
      
      // Mock DOM APIs
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation()
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation()
      
      // Mock URL methods
      const mockUrl = 'blob-url'
      URL.createObjectURL = jest.fn().mockReturnValue(mockUrl)
      URL.revokeObjectURL = jest.fn()
      
      // Test the function
      downloadFile('test content', 'test.txt', 'text/plain')
      
      // Verify calls
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor)
      expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor)
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
      
      // Restore mocks
      jest.restoreAllMocks()
    })
  })

  // ... rest of the tests remain the same ...
  describe('parseCSV', () => {
    it('should parse simple CSV', () => {
      const csv = 'name,age\nJohn,30\nJane,25'
      const result = parseCSV(csv)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'John', age: '30' })
      expect(result[1]).toEqual({ name: 'Jane', age: '25' })
    })

    it('should handle quoted fields', () => {
      const csv = 'name,description\nJohn,"Software Engineer"\nJane,"Data Scientist, PhD"'
      const result = parseCSV(csv)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'John', description: 'Software Engineer' })
      expect(result[1]).toEqual({ name: 'Jane', description: 'Data Scientist, PhD' })
    })

    it('should handle empty CSV', () => {
      const result = parseCSV('')
      expect(result).toHaveLength(0)
    })
  })

  describe('convertToCSV', () => {
    it('should convert objects to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
      const csv = convertToCSV(data)
      
      expect(csv).toContain('name,age')
      expect(csv).toContain('John,30')
      expect(csv).toContain('Jane,25')
    })

    it('should handle arrays in data', () => {
      const data = [
        { name: 'John', skills: ['JavaScript', 'TypeScript'] },
        { name: 'Jane', skills: ['Python', 'Data Science'] }
      ]
      const csv = convertToCSV(data)
      
      expect(csv).toContain('name,skills')
      expect(csv).toContain('John,JavaScript|TypeScript')
      expect(csv).toContain('Jane,Python|Data Science')
    })

    it('should handle empty data', () => {
      const csv = convertToCSV([])
      expect(csv).toBe('')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1023)).toBe('1023 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('isValidFileType', () => {
    it('should validate file types', () => {
      const csvFile = new File([''], 'test.csv', { type: 'text/csv' })
      const jsonFile = new File([''], 'test.json', { type: 'application/json' })
      const txtFile = new File([''], 'test.txt', { type: 'text/plain' })
      
      expect(isValidFileType(csvFile, ['text/csv', 'application/json'])).toBe(true)
      expect(isValidFileType(jsonFile, ['text/csv', 'application/json'])).toBe(true)
      expect(isValidFileType(txtFile, ['text/csv', 'application/json'])).toBe(false)
    })

    it('should validate by file extension', () => {
      const csvFile = new File([''], 'test.csv')
      const jsonFile = new File([''], 'test.json')
      const txtFile = new File([''], 'test.txt')
      
      expect(isValidFileType(csvFile, ['csv', 'json'])).toBe(true)
      expect(isValidFileType(jsonFile, ['csv', 'json'])).toBe(true)
      expect(isValidFileType(txtFile, ['csv', 'json'])).toBe(false)
    })
  })

  describe('readFileAsText', () => {
    it('should read file as text', async () => {
      const content = 'file content'
      const file = new File([content], 'test.txt')
      
      const result = await readFileAsText(file)
      expect(result).toBe(content)
    })

    it('should handle read errors', async () => {
      // Create a file that will cause an error when reading
      const file = new File([''], 'test.txt')
      
      // Mock FileReader to simulate an error
      const originalFileReader = window.FileReader
      ;(window as any).FileReader = jest.fn(() => {
        return {
          readAsText: jest.fn().mockImplementation(function(this: FileReader) {
            this.onerror?.(new ProgressEvent('error'))
          }),
          onerror: null as any,
          onload: null as any
        }
      })
      
      await expect(readFileAsText(file)).rejects.toThrow('Error reading file')
      
      // Restore original FileReader
      window.FileReader = originalFileReader
    })
  })
})