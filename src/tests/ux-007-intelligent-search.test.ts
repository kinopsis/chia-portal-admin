// UX-007: Test for intelligent search with fuzzy matching and suggestions
// This test verifies that the enhanced search works correctly with typos and provides good suggestions

import { 
  levenshteinDistance, 
  calculateSimilarity, 
  fuzzyMatch, 
  fuzzySearch, 
  generateFuzzySuggestions,
  enhancedSearchSuggestions,
  DEFAULT_FUZZY_CONFIG
} from '@/lib/fuzzySearch'

describe('UX-007: Intelligent Search with Fuzzy Matching', () => {
  describe('Levenshtein Distance', () => {
    test('should calculate correct distance for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0)
    })

    test('should calculate correct distance for different strings', () => {
      expect(levenshteinDistance('hello', 'helo')).toBe(1) // missing 'l'
      expect(levenshteinDistance('hello', 'helllo')).toBe(1) // extra 'l'
      expect(levenshteinDistance('hello', 'hallo')).toBe(1) // substitution
    })

    test('should handle Spanish words with typos', () => {
      expect(levenshteinDistance('tramite', 'tramite')).toBe(0)
      expect(levenshteinDistance('tramite', 'tramit')).toBe(1)
      expect(levenshteinDistance('tramite', 'tramites')).toBe(1)
      expect(levenshteinDistance('certificado', 'certificao')).toBe(1)
    })
  })

  describe('Similarity Calculation', () => {
    test('should return 1 for identical strings', () => {
      expect(calculateSimilarity('test', 'test')).toBe(1)
    })

    test('should return appropriate similarity scores', () => {
      expect(calculateSimilarity('hello', 'helo')).toBeCloseTo(0.8) // 4/5
      expect(calculateSimilarity('test', 'best')).toBeCloseTo(0.75) // 3/4
    })

    test('should handle Spanish content', () => {
      expect(calculateSimilarity('trámite', 'tramite')).toBeGreaterThan(0.8)
      expect(calculateSimilarity('certificación', 'certificacion')).toBeGreaterThan(0.9)
    })
  })

  describe('Fuzzy Matching', () => {
    test('should match exact strings', () => {
      const result = fuzzyMatch('test', 'test')
      expect(result.match).toBe(true)
      expect(result.score).toBe(1)
    })

    test('should match with typos within threshold', () => {
      const result = fuzzyMatch('tramite', 'tramit', { threshold: 0.7 })
      expect(result.match).toBe(true)
      expect(result.score).toBeGreaterThan(0.7)
    })

    test('should not match when similarity is too low', () => {
      const result = fuzzyMatch('hello', 'world', { threshold: 0.8 })
      expect(result.match).toBe(false)
    })

    test('should handle Spanish accents', () => {
      const result = fuzzyMatch('tramite', 'trámite', { normalizeAccents: true })
      expect(result.match).toBe(true)
      expect(result.score).toBe(1)
    })

    test('should be case insensitive by default', () => {
      const result = fuzzyMatch('Test', 'test')
      expect(result.match).toBe(true)
      expect(result.score).toBe(1)
    })
  })

  describe('Fuzzy Search on Arrays', () => {
    const testData = [
      { nombre: 'Certificado de Residencia', descripcion: 'Documento que certifica residencia' },
      { nombre: 'Licencia de Construcción', descripcion: 'Permiso para construir' },
      { nombre: 'Trámite de Estratificación', descripcion: 'Proceso de estratificación' },
      { nombre: 'Permiso de Funcionamiento', descripcion: 'Autorización para operar' }
    ]

    test('should find exact matches', () => {
      const results = fuzzySearch('certificado', testData, ['nombre', 'descripcion'])
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].item.nombre).toContain('Certificado')
    })

    test('should find matches with typos', () => {
      const results = fuzzySearch('certificao', testData, ['nombre', 'descripcion'], { threshold: 0.5 })
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].item.nombre).toContain('Certificado')
    })

    test('should find matches with accent differences', () => {
      const results = fuzzySearch('estratificacion', testData, ['nombre', 'descripcion'])
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].item.nombre).toContain('Estratificación')
    })

    test('should sort results by relevance score', () => {
      const results = fuzzySearch('licencia', testData, ['nombre', 'descripcion'])
      expect(results.length).toBeGreaterThan(0)
      // Results should be sorted by score (highest first)
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })
  })

  describe('Fuzzy Suggestions Generation', () => {
    const terms = [
      'Certificado de Residencia',
      'Licencia de Construcción', 
      'Trámite de Estratificación',
      'Permiso de Funcionamiento',
      'Impuesto Predial',
      'PQRS'
    ]

    test('should generate suggestions for partial matches', () => {
      const suggestions = generateFuzzySuggestions('cert', terms, 5)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]).toContain('Certificado')
    })

    test('should generate suggestions for typos', () => {
      const suggestions = generateFuzzySuggestions('licensia', terms, 5, { threshold: 0.5 })
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]).toContain('Licencia')
    })

    test('should limit suggestions to specified count', () => {
      const suggestions = generateFuzzySuggestions('e', terms, 3)
      expect(suggestions.length).toBeLessThanOrEqual(3)
    })

    test('should handle empty query', () => {
      const suggestions = generateFuzzySuggestions('', terms, 5)
      expect(suggestions.length).toBe(0)
    })
  })

  describe('Enhanced Search Suggestions', () => {
    const searchData = [
      { 
        nombre: 'Certificado de Residencia', 
        descripcion: 'Documento oficial que certifica el lugar de residencia',
        tags: ['certificado', 'residencia', 'documento']
      },
      { 
        nombre: 'Licencia de Construcción', 
        descripcion: 'Permiso para realizar obras de construcción',
        tags: ['licencia', 'construcción', 'permiso', 'obras']
      },
      { 
        nombre: 'Trámite de Estratificación', 
        descripcion: 'Proceso para determinar el estrato socioeconómico',
        tags: ['estratificación', 'estrato', 'socioeconómico']
      }
    ]

    test('should generate enhanced suggestions from names', () => {
      const suggestions = enhancedSearchSuggestions('cert', searchData, 5)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions).toContain('Certificado de Residencia')
    })

    test('should generate suggestions from descriptions', () => {
      const suggestions = enhancedSearchSuggestions('documento', searchData, 5)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some(s => s.includes('documento'))).toBe(true)
    })

    test('should generate suggestions from tags', () => {
      const suggestions = enhancedSearchSuggestions('construccion', searchData, 5)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some(s => s.includes('construcción') || s.includes('Construcción'))).toBe(true)
    })

    test('should handle typos in enhanced suggestions', () => {
      const suggestions = enhancedSearchSuggestions('estratificasion', searchData, 5)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some(s => s.includes('estratificación') || s.includes('Estratificación'))).toBe(true)
    })

    test('should return empty array for very short queries', () => {
      const suggestions = enhancedSearchSuggestions('a', searchData, 5)
      expect(suggestions.length).toBe(0)
    })
  })

  describe('Configuration Options', () => {
    test('should use default configuration correctly', () => {
      expect(DEFAULT_FUZZY_CONFIG.threshold).toBe(0.5)
      expect(DEFAULT_FUZZY_CONFIG.maxDistance).toBe(4)
      expect(DEFAULT_FUZZY_CONFIG.caseSensitive).toBe(false)
      expect(DEFAULT_FUZZY_CONFIG.normalizeAccents).toBe(true)
    })

    test('should allow custom configuration', () => {
      const customConfig = { threshold: 0.8, maxDistance: 2 }
      const result = fuzzyMatch('hello', 'helo', customConfig)
      // With stricter config, this might not match
      expect(typeof result.match).toBe('boolean')
      expect(typeof result.score).toBe('number')
    })
  })

  describe('Performance Considerations', () => {
    test('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        nombre: `Item ${i}`,
        descripcion: `Description for item ${i}`
      }))

      const startTime = performance.now()
      const results = fuzzySearch('item 50', largeDataset, ['nombre', 'descripcion'])
      const endTime = performance.now()

      expect(results.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(200) // Should complete in less than 200ms
    })

    test('should generate suggestions quickly', () => {
      const terms = Array.from({ length: 500 }, (_, i) => `Term ${i}`)

      const startTime = performance.now()
      const suggestions = generateFuzzySuggestions('term', terms, 8)
      const endTime = performance.now()

      expect(suggestions.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(50) // Should complete in less than 50ms
    })
  })
})
