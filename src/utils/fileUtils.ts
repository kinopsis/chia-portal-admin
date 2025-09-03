/**
 * File Utilities
 * Utility functions for file handling, parsing, and generation
 */

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) {
    return []
  }

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
  const results: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    // Parse CSV line handling quoted fields
    const fields: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      
      if (char === '"' && !inQuotes) {
        inQuotes = true
      } else if (char === '"' && inQuotes) {
        if (j + 1 < line.length && line[j + 1] === '"') {
          // Double quote inside quoted field
          currentField += '"'
          j++ // Skip next quote
        } else {
          inQuotes = false
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField)
        currentField = ''
      } else {
        currentField += char
      }
    }
    fields.push(currentField) // Add last field

    // Map fields to object
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = fields[index] || ''
    })
    
    results.push(row)
  }

  return results
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) {
    return ''
  }

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  )

  // Create header row
  const headerRow = keys.join(',')

  // Create data rows
  const dataRows = data.map(obj => {
    return keys.map(key => {
      const value = obj[key]
      // Handle arrays by joining with pipe
      const stringValue = Array.isArray(value) 
        ? value.join('|') 
        : value !== undefined && value !== null 
          ? String(value) 
          : ''
      
      // Escape commas and quotes in fields
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type) || 
         allowedTypes.includes(file.name.split('.').pop()?.toLowerCase() || '')
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

/**
 * Read file content as JSON
 */
export function readFileAsJSON(file: File): Promise<any> {
  return readFileAsText(file).then(content => JSON.parse(content))
}