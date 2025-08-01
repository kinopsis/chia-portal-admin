// UX-001: Test for accent normalization in search functionality
// This test verifies that searches work correctly with and without accents

import { normalizeSpanishText } from '@/lib/utils'

describe('UX-001: Accent Normalization in Search', () => {
  describe('normalizeSpanishText function', () => {
    test('should remove accents from Spanish text', () => {
      expect(normalizeSpanishText('estratificación')).toBe('estratificacion')
      expect(normalizeSpanishText('trámite')).toBe('tramite')
      expect(normalizeSpanishText('información')).toBe('informacion')
      expect(normalizeSpanishText('Bogotá')).toBe('bogota')
      expect(normalizeSpanishText('Chía')).toBe('chia')
    })

    test('should handle mixed case and accents', () => {
      expect(normalizeSpanishText('ESTRATIFICACIÓN')).toBe('estratificacion')
      expect(normalizeSpanishText('Información Básica')).toBe('informacion basica')
      expect(normalizeSpanishText('Trámites y Servicios')).toBe('tramites y servicios')
    })

    test('should handle text without accents', () => {
      expect(normalizeSpanishText('certificado')).toBe('certificado')
      expect(normalizeSpanishText('residencia')).toBe('residencia')
      expect(normalizeSpanishText('PQRS')).toBe('pqrs')
    })

    test('should handle empty and special cases', () => {
      expect(normalizeSpanishText('')).toBe('')
      expect(normalizeSpanishText('   ')).toBe('   ')
      expect(normalizeSpanishText('123')).toBe('123')
      expect(normalizeSpanishText('test@email.com')).toBe('test@email.com')
    })
  })

  describe('Search scenarios', () => {
    const mockTramites = [
      { nombre: 'Certificado de Estratificación', descripcion: 'Documento oficial' },
      { nombre: 'Trámite de Información', descripcion: 'Solicitud de datos' },
      { nombre: 'Permiso de Construcción', descripcion: 'Autorización para obras' },
      { nombre: 'Licencia de Funcionamiento', descripcion: 'Permiso comercial' }
    ]

    test('should find items when searching without accents', () => {
      const query = 'estratificacion'
      const normalizedQuery = normalizeSpanishText(query)
      
      const results = mockTramites.filter(item => {
        const normalizedNombre = normalizeSpanishText(item.nombre)
        return normalizedNombre.includes(normalizedQuery)
      })

      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Certificado de Estratificación')
    })

    test('should find items when searching with accents', () => {
      const query = 'información'
      const normalizedQuery = normalizeSpanishText(query)
      
      const results = mockTramites.filter(item => {
        const normalizedNombre = normalizeSpanishText(item.nombre)
        return normalizedNombre.includes(normalizedQuery)
      })

      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Trámite de Información')
    })

    test('should find items when searching "tramite" without accent', () => {
      const query = 'tramite'
      const normalizedQuery = normalizeSpanishText(query)
      
      const results = mockTramites.filter(item => {
        const normalizedNombre = normalizeSpanishText(item.nombre)
        return normalizedNombre.includes(normalizedQuery)
      })

      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Trámite de Información')
    })

    test('should be case insensitive', () => {
      const query = 'CONSTRUCCION'
      const normalizedQuery = normalizeSpanishText(query)
      
      const results = mockTramites.filter(item => {
        const normalizedNombre = normalizeSpanishText(item.nombre)
        return normalizedNombre.includes(normalizedQuery)
      })

      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Permiso de Construcción')
    })

    test('should handle partial matches', () => {
      const query = 'licen'
      const normalizedQuery = normalizeSpanishText(query)
      
      const results = mockTramites.filter(item => {
        const normalizedNombre = normalizeSpanishText(item.nombre)
        return normalizedNombre.includes(normalizedQuery)
      })

      expect(results).toHaveLength(1)
      expect(results[0].nombre).toBe('Licencia de Funcionamiento')
    })
  })

  describe('Performance considerations', () => {
    test('should normalize text efficiently', () => {
      const longText = 'Información sobre trámites de estratificación y certificación'.repeat(100)
      
      const startTime = performance.now()
      const result = normalizeSpanishText(longText)
      const endTime = performance.now()
      
      expect(result).toContain('informacion')
      expect(result).toContain('tramites')
      expect(result).toContain('estratificacion')
      expect(result).toContain('certificacion')
      
      // Should complete in reasonable time (less than 10ms for large text)
      expect(endTime - startTime).toBeLessThan(10)
    })
  })
})
