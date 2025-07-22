/**
 * Integration tests for Trámites Page Enhancements
 * Tests the new features implemented in the tramites enhancement project:
 * - Requisitos section with real database data
 * - Government portal links (SUIT and GOV.CO)
 * - Enhanced filtering system
 * - Responsive design improvements
 */

import { unifiedSearchService } from '@/services/unifiedSearch'
import { tramitesClientService } from '@/services/tramites'

describe('Trámites Page Enhancements Integration Tests', () => {
  describe('Requisitos Feature', () => {
    it('should fetch trámites with requisitos from database', async () => {
      const result = await tramitesClientService.getAll({ limit: 5 })
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      
      // Check that at least some trámites have requisitos
      const tramitesWithRequisitos = result.data.filter(tramite => 
        tramite.requisitos && Array.isArray(tramite.requisitos) && tramite.requisitos.length > 0
      )
      
      expect(tramitesWithRequisitos.length).toBeGreaterThan(0)
      
      // Verify requisitos structure
      if (tramitesWithRequisitos.length > 0) {
        const sampleTramite = tramitesWithRequisitos[0]
        expect(Array.isArray(sampleTramite.requisitos)).toBe(true)
        expect(sampleTramite.requisitos.length).toBeGreaterThan(0)
        expect(typeof sampleTramite.requisitos[0]).toBe('string')
      }
    })

    it('should include requisitos in unified search results', async () => {
      const searchResult = await unifiedSearchService.search({
        tipo: 'tramite',
        limit: 5
      })

      expect(searchResult.success).toBe(true)
      expect(Array.isArray(searchResult.data)).toBe(true)
      
      // Check that search results include requisitos in originalData
      const tramitesWithRequisitos = searchResult.data.filter(item => 
        item.tipo === 'tramite' && 
        item.originalData.requisitos && 
        Array.isArray(item.originalData.requisitos) &&
        item.originalData.requisitos.length > 0
      )
      
      expect(tramitesWithRequisitos.length).toBeGreaterThan(0)
    })
  })

  describe('Government Portal Links Feature', () => {
    it('should fetch trámites with government portal URLs', async () => {
      const result = await tramitesClientService.getAll({ limit: 10 })
      
      expect(result.success).toBe(true)
      
      // Check for SUIT URLs
      const tramitesWithSuit = result.data.filter(tramite => 
        tramite.visualizacion_suit && 
        typeof tramite.visualizacion_suit === 'string' &&
        tramite.visualizacion_suit.includes('suit')
      )
      
      // Check for GOV.CO URLs  
      const tramitesWithGov = result.data.filter(tramite => 
        tramite.visualizacion_gov && 
        typeof tramite.visualizacion_gov === 'string' &&
        tramite.visualizacion_gov.includes('gov.co')
      )
      
      // At least some trámites should have government portal URLs
      expect(tramitesWithSuit.length + tramitesWithGov.length).toBeGreaterThan(0)
      
      // Verify URL format if URLs exist
      if (tramitesWithSuit.length > 0) {
        const sampleSuitUrl = tramitesWithSuit[0].visualizacion_suit
        expect(sampleSuitUrl).toMatch(/^https?:\/\//)
      }
      
      if (tramitesWithGov.length > 0) {
        const sampleGovUrl = tramitesWithGov[0].visualizacion_gov
        expect(sampleGovUrl).toMatch(/^https?:\/\//)
      }
    })

    it('should include government portal URLs in unified search', async () => {
      const searchResult = await unifiedSearchService.search({
        tipo: 'tramite',
        limit: 10
      })

      expect(searchResult.success).toBe(true)
      
      // Check that search results include government portal URLs
      const tramitesWithPortalUrls = searchResult.data.filter(item => 
        item.tipo === 'tramite' && (
          (item.originalData.visualizacion_suit && item.originalData.visualizacion_suit.includes('suit')) ||
          (item.originalData.visualizacion_gov && item.originalData.visualizacion_gov.includes('gov.co'))
        )
      )
      
      expect(tramitesWithPortalUrls.length).toBeGreaterThan(0)
    })
  })

  describe('Enhanced Filtering System', () => {
    it('should filter trámites by tipo correctly', async () => {
      const tramiteResult = await unifiedSearchService.search({
        tipo: 'tramite',
        limit: 5
      })

      expect(tramiteResult.success).toBe(true)
      expect(tramiteResult.data.every(item => item.tipo === 'tramite')).toBe(true)
    })

    it('should filter trámites by payment type', async () => {
      const freeResult = await unifiedSearchService.search({
        tipo: 'tramite',
        tipoPago: 'gratuito',
        limit: 5
      })

      expect(freeResult.success).toBe(true)
      
      if (freeResult.data.length > 0) {
        expect(freeResult.data.every(item => 
          item.tipo === 'tramite' && item.originalData.tiene_pago === false
        )).toBe(true)
      }

      const paidResult = await unifiedSearchService.search({
        tipo: 'tramite',
        tipoPago: 'con_pago',
        limit: 5
      })

      expect(paidResult.success).toBe(true)
      
      if (paidResult.data.length > 0) {
        expect(paidResult.data.every(item => 
          item.tipo === 'tramite' && item.originalData.tiene_pago === true
        )).toBe(true)
      }
    })

    it('should support text search in trámites', async () => {
      const searchResult = await unifiedSearchService.search({
        query: 'licencia',
        tipo: 'tramite',
        limit: 5
      })

      expect(searchResult.success).toBe(true)
      
      if (searchResult.data.length > 0) {
        // Results should contain the search term in name or description
        const hasSearchTerm = searchResult.data.some(item => 
          item.nombre.toLowerCase().includes('licencia') ||
          item.descripcion.toLowerCase().includes('licencia')
        )
        expect(hasSearchTerm).toBe(true)
      }
    })
  })

  describe('Database Integration', () => {
    it('should have proper database schema for new features', async () => {
      const result = await tramitesClientService.getAll({ limit: 1 })
      
      expect(result.success).toBe(true)
      
      if (result.data.length > 0) {
        const tramite = result.data[0]
        
        // Check that new columns exist in the response
        expect(tramite).toHaveProperty('requisitos')
        expect(tramite).toHaveProperty('visualizacion_suit')
        expect(tramite).toHaveProperty('visualizacion_gov')
        
        // Check data types
        if (tramite.requisitos !== null) {
          expect(Array.isArray(tramite.requisitos)).toBe(true)
        }
        
        if (tramite.visualizacion_suit !== null) {
          expect(typeof tramite.visualizacion_suit).toBe('string')
        }
        
        if (tramite.visualizacion_gov !== null) {
          expect(typeof tramite.visualizacion_gov).toBe('string')
        }
      }
    })

    it('should maintain data consistency across services', async () => {
      // Get data from both services
      const directResult = await tramitesClientService.getAll({ limit: 3 })
      const searchResult = await unifiedSearchService.search({
        tipo: 'tramite',
        limit: 3
      })

      expect(directResult.success).toBe(true)
      expect(searchResult.success).toBe(true)
      
      if (directResult.data.length > 0 && searchResult.data.length > 0) {
        // Find a common trámite
        const directTramite = directResult.data[0]
        const searchTramite = searchResult.data.find(item => 
          item.codigo === directTramite.codigo_unico
        )
        
        if (searchTramite) {
          // Verify data consistency
          expect(searchTramite.nombre).toBe(directTramite.nombre)
          expect(searchTramite.originalData.requisitos).toEqual(directTramite.requisitos)
          expect(searchTramite.originalData.visualizacion_suit).toBe(directTramite.visualizacion_suit)
          expect(searchTramite.originalData.visualizacion_gov).toBe(directTramite.visualizacion_gov)
        }
      }
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now()
      
      const result = await unifiedSearchService.search({
        limit: 50
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should handle empty results gracefully', async () => {
      const result = await unifiedSearchService.search({
        query: 'nonexistentquerythatshouldfindnothing12345',
        limit: 10
      })

      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBe(0)
      expect(result.pagination.total).toBe(0)
    })
  })
})
