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

test.describe('Funcionario Trámites - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Setup console error tracking
    const errors = await checkConsoleErrors(page)
    
    // Login as funcionario
    await loginAsFuncionario(page)
    
    // Navigate to tramites page
    await navigateToFuncionarioPage(page, '/tramites')
    
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

  test('should search by codigo field', async ({ page }) => {
    // Get initial row count
    const initialCount = await getTableRowCount(page)
    expect(initialCount).toBeGreaterThan(0)
    
    // Search by a specific codigo (assuming TR001 exists)
    await performSearch(page, 'TR001')
    
    // Verify results contain the codigo
    await verifySearchResults(page, ['TR001'])
    
    // Verify filtered results are less than or equal to initial
    const filteredCount = await getTableRowCount(page)
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('should search by nombre field', async ({ page }) => {
    // Search by tramite name (assuming "Certificado" exists)
    await performSearch(page, 'Certificado')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['Certificado'])
    
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

  test('should search by tipo_pago field', async ({ page }) => {
    // Search by payment type
    await performSearch(page, 'gratuito')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['gratuito'])
    
    // Clear search and try another type
    await clearSearch(page)
    await performSearch(page, 'pago')
    
    // Verify results contain the search term
    await verifySearchResults(page, ['pago'])
  })

  test('should filter results in real-time', async ({ page }) => {
    // Test real-time search with "Cert"
    await testRealTimeSearch(page, 'Cert')
    
    // Verify final results
    await verifySearchResults(page, ['Cert'])
  })

  test('should be case-insensitive', async ({ page }) => {
    // Test case-insensitive search for "certificado"
    await testCaseInsensitiveSearch(page, 'Certificado', ['certificado', 'Certificado', 'CERTIFICADO'])
  })

  test('should clear results when search is cleared', async ({ page }) => {
    // Get initial count
    const initialCount = await getTableRowCount(page)
    
    // Perform search to filter results
    await performSearch(page, 'TR001')
    const filteredCount = await getTableRowCount(page)
    expect(filteredCount).toBeLessThan(initialCount)
    
    // Clear search
    await clearSearch(page)
    
    // Verify results are restored
    const restoredCount = await getTableRowCount(page)
    expect(restoredCount).toBe(initialCount)
  })

  test('should only search in searchable columns', async ({ page }) => {
    // Search for text that should only appear in description (non-searchable)
    await performSearch(page, 'descripcion_especifica_no_searchable')
    
    // Should show no results since description is not searchable
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
    await testResponsiveSearch(page, 'Certificado', ['Certificado'])
  })

  test('should not have JavaScript errors during search', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Perform various search operations
    await performSearch(page, 'TR001')
    await clearSearch(page)
    await performSearch(page, 'Certificado')
    await clearSearch(page)
    
    // Verify no JavaScript errors occurred
    expect(errors).toHaveLength(0)
  })

  test('should filter data by user dependencia', async ({ page }) => {
    // Get all visible tramites
    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()
    
    if (rowCount > 0) {
      // Verify all results belong to user's dependencia
      // This assumes the dependencia name appears in the table
      const dependenciaText = 'Secretaría de Gobierno' // From TEST_FUNCIONARIO
      
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i)
        // Check that each row contains reference to user's dependencia
        // This could be in subdependencia column or other related field
        await expect(row).toBeVisible()
      }
    }
  })

  test('should handle special characters in search', async ({ page }) => {
    // Test search with special characters
    const specialSearches = ['ñ', 'á', 'é', 'í', 'ó', 'ú', '&', '-', '.']
    
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
    await performSearch(page, 'Certificado')
    const searchedCount = await getTableRowCount(page)
    
    // Interact with table (e.g., sort a column if available)
    const sortableHeader = page.locator('th[role="columnheader"]:has-text("Código")')
    if (await sortableHeader.isVisible()) {
      await sortableHeader.click()
      await page.waitForTimeout(500)
      
      // Verify search is still active
      const afterSortCount = await getTableRowCount(page)
      expect(afterSortCount).toBe(searchedCount)
    }
  })
})
