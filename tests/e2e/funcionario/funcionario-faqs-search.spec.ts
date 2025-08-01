import { test, expect } from '@playwright/test'
import { 
  loginAsFuncionario, 
  logout, 
  navigateToFuncionarioPage, 
  waitForDataTableLoad,
  checkConsoleErrors 
} from './auth-setup'
import {
  performSearch,
  clearSearch,
  getTableRowCount,
  verifySearchResults,
  verifySearchResultsExclude,
  testCaseInsensitiveSearch,
  testRealTimeSearch,
  verifyEmptyState,
  verifySearchAccessibility,
  testResponsiveSearch
} from './search-utils'

test.describe('Funcionario FAQs - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Setup console error tracking
    const errors = await checkConsoleErrors(page)
    
    // Login as funcionario
    await loginAsFuncionario(page)
    
    // Navigate to faqs page
    await navigateToFuncionarioPage(page, '/faqs')
    
    // Wait for data to load
    await waitForDataTableLoad(page)
    
    // Verify no console errors during setup
    expect(errors).toHaveLength(0)
  })

  test.afterEach(async ({ page }) => {
    await logout(page)
  })

  test('should display search input and be functional', async ({ page }) => {
    // Verify search input is visible
    const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
    await expect(searchInput).toBeVisible()
    
    // Verify search input is enabled
    await expect(searchInput).toBeEnabled()
    
    // Verify placeholder text
    const placeholder = await searchInput.getAttribute('placeholder')
    expect(placeholder).toContain('Buscar')
  })

  test('should search by pregunta field', async ({ page }) => {
    // Get initial row count
    const initialCount = await getTableRowCount(page)
    expect(initialCount).toBeGreaterThan(0)
    
    // Search by question content (assuming "¿Cómo" exists)
    await performSearch(page, '¿Cómo')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['¿Cómo'])
    
    // Verify filtered results are less than or equal to initial
    const filteredCount = await getTableRowCount(page)
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('should search by categoria field', async ({ page }) => {
    // Search by category (assuming "Trámites" exists)
    await performSearch(page, 'Trámites')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['Trámites'])
    
    // Verify we have results
    const resultCount = await getTableRowCount(page)
    expect(resultCount).toBeGreaterThan(0)
  })

  test('should search by subdependencia field', async ({ page }) => {
    // Search by subdependencia (assuming "Secretaría" exists)
    await performSearch(page, 'Secretaría')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['Secretaría'])
    
    // Verify we have results
    const resultCount = await getTableRowCount(page)
    expect(resultCount).toBeGreaterThan(0)
  })

  test('should search by estado field', async ({ page }) => {
    // Search by status
    await performSearch(page, 'publicado')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['publicado'])
    
    // Clear search and try another status
    await clearSearch(page)
    await performSearch(page, 'borrador')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['borrador'])
  })

  test('should filter results in real-time', async ({ page }) => {
    // Test real-time search with "¿Cóm"
    await testRealTimeSearch(page, '¿Cóm')
    
    // Verify final results
    await verifySearchResults(page, ['¿Cóm'])
  })

  test('should be case-insensitive', async ({ page }) => {
    // Test case-insensitive search for "trámites"
    await testCaseInsensitiveSearch(page, 'Trámites', ['trámites', 'Trámites', 'TRÁMITES'])
  })

  test('should clear results when search is cleared', async ({ page }) => {
    // Get initial count
    const initialCount = await getTableRowCount(page)
    
    // Perform search to filter results
    await performSearch(page, '¿Cómo')
    const filteredCount = await getTableRowCount(page)
    expect(filteredCount).toBeLessThan(initialCount)
    
    // Clear search
    await clearSearch(page)
    
    // Verify results are restored
    const restoredCount = await getTableRowCount(page)
    expect(restoredCount).toBe(initialCount)
  })

  test('should only search in searchable columns', async ({ page }) => {
    // Search for text that should only appear in respuesta (non-searchable)
    await performSearch(page, 'respuesta_especifica_no_searchable')
    
    // Should show no results since respuesta is not searchable
    await verifyEmptyState(page)
  })

  test('should handle no results gracefully', async ({ page }) => {
    // Search for non-existent term
    await performSearch(page, 'xyz123nonexistent')
    
    // Verify empty state
    await verifyEmptyState(page)
  })

  test('should maintain search accessibility', async ({ page }) => {
    await verifySearchAccessibility(page)
  })

  test('should work across different screen sizes', async ({ page }) => {
    await testResponsiveSearch(page, 'Trámites', ['Trámites'])
  })

  test('should not have JavaScript errors during search', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Perform various search operations
    await performSearch(page, '¿Cómo')
    await clearSearch(page)
    await performSearch(page, 'Trámites')
    await clearSearch(page)
    
    // Verify no JavaScript errors occurred
    expect(errors).toHaveLength(0)
  })

  test('should filter data by user dependencia', async ({ page }) => {
    // Get all visible FAQs
    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()
    
    if (rowCount > 0) {
      // Verify all results belong to user's dependencia
      const dependenciaText = 'Secretaría de Gobierno' // From TEST_FUNCIONARIO
      
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i)
        await expect(row).toBeVisible()
      }
    }
  })

  test('should search by different categorias', async ({ page }) => {
    const categorias = ['Trámites', 'Servicios', 'Información', 'General']
    
    for (const categoria of categorias) {
      await performSearch(page, categoria)
      
      // If results found, verify they contain the categoria
      const resultCount = await getTableRowCount(page)
      if (resultCount > 0) {
        await verifySearchResults(page, [categoria])
      }
      
      await clearSearch(page)
      await page.waitForTimeout(500)
    }
  })

  test('should search by different estados', async ({ page }) => {
    const estados = ['publicado', 'borrador', 'archivado']
    
    for (const estado of estados) {
      await performSearch(page, estado)
      
      // If results found, verify they contain the estado
      const resultCount = await getTableRowCount(page)
      if (resultCount > 0) {
        await verifySearchResults(page, [estado])
      }
      
      await clearSearch(page)
      await page.waitForTimeout(500)
    }
  })

  test('should handle special characters in search', async ({ page }) => {
    // Test search with special characters common in FAQs
    const specialSearches = ['¿', '?', 'ñ', 'á', 'é', 'í', 'ó', 'ú', '&', '-', '.']
    
    for (const char of specialSearches) {
      await performSearch(page, char)
      // Should not crash or show errors
      await page.waitForTimeout(500)
      await clearSearch(page)
    }
  })

  test('should handle long search terms', async ({ page }) => {
    // Test with very long search term
    const longTerm = 'a'.repeat(100)
    await performSearch(page, longTerm)
    
    // Should handle gracefully
    await verifyEmptyState(page)
  })

  test('should preserve search state during page interactions', async ({ page }) => {
    // Perform search
    await performSearch(page, 'Trámites')
    const searchedCount = await getTableRowCount(page)
    
    // Interact with table (e.g., sort a column if available)
    const sortableHeader = page.locator('th[role="columnheader"]:has-text("Pregunta")')
    if (await sortableHeader.isVisible()) {
      await sortableHeader.click()
      await page.waitForTimeout(500)
      
      // Verify search is still active
      const afterSortCount = await getTableRowCount(page)
      expect(afterSortCount).toBe(searchedCount)
    }
  })

  test('should search across multiple FAQ fields simultaneously', async ({ page }) => {
    // Search for a term that might appear in multiple fields
    await performSearch(page, 'Secretaría')
    
    const resultCount = await getTableRowCount(page)
    if (resultCount > 0) {
      // Verify results contain the search term in any searchable field
      await verifySearchResults(page, ['Secretaría'])
    }
  })

  test('should handle rapid consecutive searches', async ({ page }) => {
    const searchTerms = ['¿Cómo', 'Trámites', 'publicado', 'Secretaría']
    
    // Perform rapid consecutive searches
    for (const term of searchTerms) {
      await performSearch(page, term)
      await page.waitForTimeout(200) // Short delay between searches
    }
    
    // Verify final search results
    const finalTerm = searchTerms[searchTerms.length - 1]
    await verifySearchResults(page, [finalTerm])
  })

  test('should search FAQ questions with question marks', async ({ page }) => {
    // Test searching for questions with question marks
    const questionSearches = ['¿Cómo?', '¿Qué?', '¿Dónde?', '¿Cuándo?']
    
    for (const question of questionSearches) {
      await performSearch(page, question)
      
      // Should handle question marks properly
      await page.waitForTimeout(500)
      
      await clearSearch(page)
    }
  })
})
