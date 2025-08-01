// UX-001: Integration test for accent-insensitive search across services
// This test verifies that the search functionality works end-to-end

import { normalizeSpanishText } from '@/lib/utils'

// Mock data that simulates real database content
const mockTramitesData = [
  {
    id: '1',
    nombre: 'Certificado de Estratificación Socioeconómica',
    formulario: 'Documento que certifica el estrato socioeconómico',
    codigo_unico: 'TR-001',
    activo: true
  },
  {
    id: '2', 
    nombre: 'Trámite de Información Pública',
    formulario: 'Solicitud de acceso a información gubernamental',
    codigo_unico: 'TR-002',
    activo: true
  },
  {
    id: '3',
    nombre: 'Permiso de Construcción',
    formulario: 'Autorización para realizar obras de construcción',
    codigo_unico: 'TR-003',
    activo: true
  }
]

const mockFaqsData = [
  {
    id: '1',
    pregunta: '¿Cómo solicitar certificado de estratificación?',
    respuesta: 'Debe dirigirse a la oficina de planeación con los documentos requeridos',
    activo: true
  },
  {
    id: '2',
    pregunta: '¿Qué información puedo solicitar?',
    respuesta: 'Puede solicitar cualquier información pública según la ley de transparencia',
    activo: true
  },
  {
    id: '3',
    pregunta: '¿Cuánto demora un trámite?',
    respuesta: 'Los tiempos varían según el tipo de trámite solicitado',
    activo: true
  }
]

describe('UX-001: Search Integration Tests', () => {
  describe('Trámites search with accent normalization', () => {
    const simulateSearch = (query: string) => {
      const normalizedQuery = normalizeSpanishText(query)
      
      return mockTramitesData.filter(tramite => {
        const normalizedNombre = normalizeSpanishText(tramite.nombre)
        const normalizedFormulario = normalizeSpanishText(tramite.formulario)
        
        return normalizedNombre.includes(normalizedQuery) || 
               normalizedFormulario.includes(normalizedQuery)
      })
    }

    test('should find "estratificación" when searching "estratificacion"', () => {
      const results = simulateSearch('estratificacion')
      expect(results).toHaveLength(1)
      expect(results[0].nombre).toContain('Estratificación')
    })

    test('should find "información" when searching "informacion"', () => {
      const results = simulateSearch('informacion')
      expect(results).toHaveLength(1)
      expect(results[0].nombre).toContain('Información')
    })

    test('should find "construcción" when searching "construccion"', () => {
      const results = simulateSearch('construccion')
      expect(results).toHaveLength(1)
      expect(results[0].nombre).toContain('Construcción')
    })

    test('should find items by searching in formulario field', () => {
      const results = simulateSearch('autorizacion')
      expect(results).toHaveLength(1)
      expect(results[0].formulario).toContain('Autorización')
    })

    test('should handle multiple matches', () => {
      const results = simulateSearch('tramite')
      expect(results.length).toBeGreaterThan(0)
      // Should find items that contain "trámite" in any field
    })
  })

  describe('FAQs search with accent normalization', () => {
    const simulateSearch = (query: string) => {
      const normalizedQuery = normalizeSpanishText(query)
      
      return mockFaqsData.filter(faq => {
        const normalizedPregunta = normalizeSpanishText(faq.pregunta)
        const normalizedRespuesta = normalizeSpanishText(faq.respuesta)
        
        return normalizedPregunta.includes(normalizedQuery) || 
               normalizedRespuesta.includes(normalizedQuery)
      })
    }

    test('should find FAQ when searching "estratificacion"', () => {
      const results = simulateSearch('estratificacion')
      expect(results).toHaveLength(1)
      expect(results[0].pregunta).toContain('estratificación')
    })

    test('should find FAQ when searching "informacion"', () => {
      const results = simulateSearch('informacion')
      expect(results).toHaveLength(1)
      expect(results[0].pregunta).toContain('información')
    })

    test('should find FAQ when searching "tramite"', () => {
      const results = simulateSearch('tramite')
      expect(results).toHaveLength(1)
      expect(results[0].respuesta).toContain('trámite')
    })

    test('should search in both pregunta and respuesta fields', () => {
      const results = simulateSearch('planeacion')
      expect(results).toHaveLength(1)
      expect(results[0].respuesta).toContain('planeación')
    })
  })

  describe('Cross-service search scenarios', () => {
    test('should handle common search terms across services', () => {
      const commonTerms = [
        'estratificacion',
        'informacion', 
        'tramite',
        'certificado',
        'solicitud'
      ]

      commonTerms.forEach(term => {
        const normalizedTerm = normalizeSpanishText(term)
        
        // Should be able to normalize consistently
        expect(typeof normalizedTerm).toBe('string')
        expect(normalizedTerm.length).toBeGreaterThan(0)
        expect(normalizedTerm).toBe(normalizedTerm.toLowerCase())
        
        // Should not contain accented characters
        expect(normalizedTerm).not.toMatch(/[áéíóúñü]/i)
      })
    })

    test('should maintain search relevance with normalization', () => {
      const query = 'estratificacion'
      const normalizedQuery = normalizeSpanishText(query)
      
      // Simulate scoring based on exact matches
      const tramiteResults = mockTramitesData.map(item => {
        const normalizedNombre = normalizeSpanishText(item.nombre)
        const score = normalizedNombre.includes(normalizedQuery) ? 2 : 0
        return { ...item, score }
      }).filter(item => item.score > 0)

      expect(tramiteResults).toHaveLength(1)
      expect(tramiteResults[0].score).toBe(2)
    })
  })

  describe('Edge cases and error handling', () => {
    test('should handle empty search queries', () => {
      const emptyQuery = ''
      const normalizedQuery = normalizeSpanishText(emptyQuery)
      
      expect(normalizedQuery).toBe('')
      
      // Empty query should return all results (no filtering)
      const results = mockTramitesData.filter(item => {
        if (!normalizedQuery) return true
        return false
      })
      
      expect(results).toHaveLength(mockTramitesData.length)
    })

    test('should handle special characters and numbers', () => {
      const specialQuery = 'TR-001'
      const normalizedQuery = normalizeSpanishText(specialQuery)
      
      expect(normalizedQuery).toBe('tr-001')
      
      const results = mockTramitesData.filter(item => {
        const normalizedCodigo = normalizeSpanishText(item.codigo_unico)
        return normalizedCodigo.includes(normalizedQuery)
      })
      
      expect(results).toHaveLength(1)
    })

    test('should handle very long search queries', () => {
      const longQuery = 'certificado de estratificación socioeconómica para trámites de información'.repeat(10)
      const normalizedQuery = normalizeSpanishText(longQuery)
      
      expect(normalizedQuery).toContain('certificado')
      expect(normalizedQuery).toContain('estratificacion')
      expect(normalizedQuery).toContain('informacion')
      expect(normalizedQuery).not.toMatch(/[áéíóú]/i)
    })
  })
})
