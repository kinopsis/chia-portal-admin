/**
 * Tests for text normalization utilities
 * Validates Spanish accent/diacritic handling for search functionality
 */

import { 
  normalizeText, 
  normalizeForSearch, 
  searchMatches, 
  testNormalization,
  SPANISH_TEST_WORDS 
} from '@/utils/textNormalization'

describe('Text Normalization', () => {
  describe('normalizeText', () => {
    test('should remove accents from Spanish vowels', () => {
      expect(normalizeText('á')).toBe('a')
      expect(normalizeText('é')).toBe('e')
      expect(normalizeText('í')).toBe('i')
      expect(normalizeText('ó')).toBe('o')
      expect(normalizeText('ú')).toBe('u')
      expect(normalizeText('ñ')).toBe('n')
    })

    test('should handle uppercase accented characters', () => {
      expect(normalizeText('Á')).toBe('a')
      expect(normalizeText('É')).toBe('e')
      expect(normalizeText('Í')).toBe('i')
      expect(normalizeText('Ó')).toBe('o')
      expect(normalizeText('Ú')).toBe('u')
      expect(normalizeText('Ñ')).toBe('n')
    })

    test('should normalize common Spanish words', () => {
      expect(normalizeText('trámite')).toBe('tramite')
      expect(normalizeText('información')).toBe('informacion')
      expect(normalizeText('certificación')).toBe('certificacion')
      expect(normalizeText('construcción')).toBe('construccion')
      expect(normalizeText('estratificación')).toBe('estratificacion')
    })

    test('should handle empty and invalid inputs', () => {
      expect(normalizeText('')).toBe('')
      expect(normalizeText(null as any)).toBe('')
      expect(normalizeText(undefined as any)).toBe('')
    })
  })

  describe('normalizeForSearch', () => {
    test('should normalize and clean text for search', () => {
      expect(normalizeForSearch('  Certificación de Residencia  ')).toBe('certificacion de residencia')
      expect(normalizeForSearch('Trámite-123: Información!')).toBe('tramite123 informacion')
      expect(normalizeForSearch('CONSTRUCCIÓN & URBANIZACIÓN')).toBe('construccion  urbanizacion')
    })

    test('should handle multiple spaces', () => {
      expect(normalizeForSearch('palabra    con    espacios')).toBe('palabra con espacios')
    })

    test('should remove punctuation', () => {
      expect(normalizeForSearch('¿Cómo solicitar información?')).toBe('como solicitar informacion')
      expect(normalizeForSearch('Art. 123, Inc. A')).toBe('art 123 inc a')
    })
  })

  describe('searchMatches', () => {
    test('should match normalized text', () => {
      expect(searchMatches('estratificacion', 'Estratificación Socioeconómica')).toBe(true)
      expect(searchMatches('tramite', 'Trámites y Servicios')).toBe(true)
      expect(searchMatches('informacion', 'Centro de Información')).toBe(true)
      expect(searchMatches('construccion', 'Licencia de Construcción')).toBe(true)
    })

    test('should handle partial matches', () => {
      expect(searchMatches('cert', 'Certificación')).toBe(true)
      expect(searchMatches('resid', 'Residencia')).toBe(true)
      expect(searchMatches('func', 'Funcionamiento')).toBe(true)
    })

    test('should be case insensitive', () => {
      expect(searchMatches('TRAMITE', 'trámite')).toBe(true)
      expect(searchMatches('tramite', 'TRÁMITE')).toBe(true)
      expect(searchMatches('TrAmItE', 'tRáMiTe')).toBe(true)
    })

    test('should handle whole word matching', () => {
      expect(searchMatches('art', 'Carta de Residencia', { wholeWord: true })).toBe(false)
      expect(searchMatches('carta', 'Carta de Residencia', { wholeWord: true })).toBe(true)
    })

    test('should not match unrelated text', () => {
      expect(searchMatches('vehiculo', 'Certificado de Residencia')).toBe(false)
      expect(searchMatches('medicina', 'Licencia de Construcción')).toBe(false)
    })
  })

  describe('Spanish Test Words', () => {
    test('should normalize all test word variations correctly', () => {
      const results = testNormalization()
      
      // Should have more passed than failed tests
      expect(results.passed).toBeGreaterThan(results.failed)
      
      // Check specific important words
      expect(normalizeForSearch('trámite')).toBe('tramite')
      expect(normalizeForSearch('información')).toBe('informacion')
      expect(normalizeForSearch('certificación')).toBe('certificacion')
      expect(normalizeForSearch('construcción')).toBe('construccion')
      expect(normalizeForSearch('estratificación')).toBe('estratificacion')
    })

    test('should handle all variations in SPANISH_TEST_WORDS', () => {
      Object.entries(SPANISH_TEST_WORDS).forEach(([expected, variations]) => {
        variations.forEach(variation => {
          const normalized = normalizeForSearch(variation)
          expect(normalized).toBe(expected)
        })
      })
    })
  })

  describe('Real-world search scenarios', () => {
    const testData = [
      { nombre: 'Certificado de Residencia', descripcion: 'Documento que certifica la residencia' },
      { nombre: 'Licencia de Construcción', descripcion: 'Permiso para construcción de edificaciones' },
      { nombre: 'Trámite de Estratificación', descripcion: 'Proceso de estratificación socioeconómica' },
      { nombre: 'Información General', descripcion: 'Centro de información y atención' },
      { nombre: 'Permiso de Funcionamiento', descripcion: 'Autorización para funcionamiento comercial' }
    ]

    test('should find items with accented search queries', () => {
      const query = 'certificación'
      const matches = testData.filter(item => 
        searchMatches(query, item.nombre) || searchMatches(query, item.descripcion)
      )
      expect(matches.length).toBeGreaterThan(0)
      expect(matches[0].nombre).toContain('Certificado')
    })

    test('should find items with non-accented search queries', () => {
      const query = 'construccion'
      const matches = testData.filter(item => 
        searchMatches(query, item.nombre) || searchMatches(query, item.descripcion)
      )
      expect(matches.length).toBeGreaterThan(0)
      expect(matches[0].nombre).toContain('Construcción')
    })

    test('should find items with partial queries', () => {
      const query = 'estratific'
      const matches = testData.filter(item => 
        searchMatches(query, item.nombre) || searchMatches(query, item.descripcion)
      )
      expect(matches.length).toBeGreaterThan(0)
      expect(matches[0].nombre).toContain('Estratificación')
    })

    test('should handle common typos and variations', () => {
      // Common typos where users forget accents
      expect(searchMatches('tramite', 'Trámite de Estratificación')).toBe(true)
      expect(searchMatches('informacion', 'Información General')).toBe(true)
      expect(searchMatches('permiso', 'Permiso de Funcionamiento')).toBe(true)
      
      // Mixed case scenarios
      expect(searchMatches('LICENCIA', 'Licencia de Construcción')).toBe(true)
      expect(searchMatches('funcionamiento', 'PERMISO DE FUNCIONAMIENTO')).toBe(true)
    })
  })

  describe('Performance', () => {
    test('should normalize text efficiently', () => {
      const longText = 'Certificación de Información para Construcción y Estratificación '.repeat(100)
      
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        normalizeForSearch(longText)
      }
      const end = performance.now()
      
      // Should complete 1000 normalizations in reasonable time (< 100ms)
      expect(end - start).toBeLessThan(100)
    })

    test('should search efficiently', () => {
      const items = Array(1000).fill(0).map((_, i) => ({
        nombre: `Trámite ${i} de Información`,
        descripcion: `Descripción del trámite número ${i} para certificación`
      }))
      
      const start = performance.now()
      const matches = items.filter(item => 
        searchMatches('informacion', item.nombre) || searchMatches('informacion', item.descripcion)
      )
      const end = performance.now()
      
      // Should search through 1000 items quickly (< 50ms)
      expect(end - start).toBeLessThan(50)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
