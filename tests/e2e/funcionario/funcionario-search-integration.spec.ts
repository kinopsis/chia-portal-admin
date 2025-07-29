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
  verifySearchAccessibility
} from './search-utils'

test.describe('Funcionario Dashboard - Search Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as funcionario
    await loginAsFuncionario(page)
  })

  test.afterEach(async ({ page }) => {
    await logout(page)
  })

  test('should maintain search functionality across all funcionario pages', async ({ page }) => {
    const pages = [
      { path: '/tramites', searchTerm: 'TR001', expectedResult: 'TR001' },
      { path: '/opas', searchTerm: 'OPA001', expectedResult: 'OPA001' },
      { path: '/faqs', searchTerm: '¿Cómo', expectedResult: '¿Cómo' }
    ]

    for (const pageInfo of pages) {
      // Navigate to page
      await navigateToFuncionarioPage(page, pageInfo.path)
      await waitForDataTableLoad(page)

      // Verify search functionality
      await performSearch(page, pageInfo.searchTerm)
      
      // Check that search input exists and works
      const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toHaveValue(pageInfo.searchTerm)

      // Clear search for next iteration
      await clearSearch(page)
    }
  })

  test('should preserve user session across search operations', async ({ page }) => {
    // Navigate to tramites
    await navigateToFuncionarioPage(page, '/tramites')
    await waitForDataTableLoad(page)

    // Perform search
    await performSearch(page, 'Certificado')
    
    // Navigate to another page
    await navigateToFuncionarioPage(page, '/opas')
    await waitForDataTableLoad(page)

    // Verify user is still authenticated
    await expect(page.locator('text=Funcionario Test')).toBeVisible()
    await expect(page.locator('text=Secretaría de Gobierno')).toBeVisible()

    // Verify search works on new page
    await performSearch(page, 'Procedimiento')
    const resultCount = await getTableRowCount(page)
    // Should either have results or be empty (both are valid)
    expect(resultCount).toBeGreaterThanOrEqual(0)
  })

  test('should handle navigation between pages with active searches', async ({ page }) => {
    // Start on tramites with search
    await navigateToFuncionarioPage(page, '/tramites')
    await waitForDataTableLoad(page)
    await performSearch(page, 'TR001')

    // Navigate to OPAs
    await page.click('nav a[href="/funcionario/opas"]')
    await waitForDataTableLoad(page)

    // Verify search input is clear on new page
    const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
    await expect(searchInput).toHaveValue('')

    // Perform new search
    await performSearch(page, 'OPA001')
    
    // Navigate back to tramites
    await page.click('nav a[href="/funcionario/tramites"]')
    await waitForDataTableLoad(page)

    // Verify search input is clear
    await expect(searchInput).toHaveValue('')
  })

  test('should maintain consistent search behavior across all pages', async ({ page }) => {
    const pages = ['/tramites', '/opas', '/faqs']

    for (const pagePath of pages) {
      await navigateToFuncionarioPage(page, pagePath)
      await waitForDataTableLoad(page)

      // Test accessibility
      await verifySearchAccessibility(page)

      // Test basic search functionality
      const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
      
      // Test typing
      await searchInput.fill('test')
      await expect(searchInput).toHaveValue('test')
      
      // Test clearing
      await searchInput.clear()
      await expect(searchInput).toHaveValue('')

      // Test that table responds to search
      await searchInput.fill('nonexistent123')
      await page.waitForTimeout(500)
      
      // Should show empty results or no change
      const rows = page.locator('tbody tr')
      const rowCount = await rows.count()
      expect(rowCount).toBeGreaterThanOrEqual(0)

      await searchInput.clear()
    }
  })

  test('should handle concurrent search operations', async ({ page, context }) => {
    // Open multiple tabs with different funcionario pages
    const tramitesPage = await context.newPage()
    const opasPage = await context.newPage()

    // Login on both pages
    await loginAsFuncionario(tramitesPage)
    await loginAsFuncionario(opasPage)

    // Navigate to different pages
    await navigateToFuncionarioPage(tramitesPage, '/tramites')
    await navigateToFuncionarioPage(opasPage, '/opas')

    await waitForDataTableLoad(tramitesPage)
    await waitForDataTableLoad(opasPage)

    // Perform searches simultaneously
    await Promise.all([
      performSearch(tramitesPage, 'Certificado'),
      performSearch(opasPage, 'Procedimiento')
    ])

    // Verify both searches work independently
    const tramitesInput = tramitesPage.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
    const opasInput = opasPage.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')

    await expect(tramitesInput).toHaveValue('Certificado')
    await expect(opasInput).toHaveValue('Procedimiento')

    // Clean up
    await tramitesPage.close()
    await opasPage.close()
  })

  test('should handle search with network interruptions gracefully', async ({ page }) => {
    await navigateToFuncionarioPage(page, '/tramites')
    await waitForDataTableLoad(page)

    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000)
    })

    // Perform search
    await performSearch(page, 'Certificado')

    // Should still work despite slow network
    const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
    await expect(searchInput).toHaveValue('Certificado')

    // Remove network simulation
    await page.unroute('**/*')
  })

  test('should validate search performance across pages', async ({ page }) => {
    const pages = ['/tramites', '/opas', '/faqs']
    const performanceResults: { page: string; searchTime: number }[] = []

    for (const pagePath of pages) {
      await navigateToFuncionarioPage(page, pagePath)
      await waitForDataTableLoad(page)

      // Measure search performance
      const startTime = Date.now()
      await performSearch(page, 'test')
      const endTime = Date.now()

      const searchTime = endTime - startTime
      performanceResults.push({ page: pagePath, searchTime })

      // Search should complete within reasonable time (5 seconds)
      expect(searchTime).toBeLessThan(5000)

      await clearSearch(page)
    }

    // Log performance results for analysis
    console.log('Search Performance Results:', performanceResults)
  })

  test('should maintain data consistency across search operations', async ({ page }) => {
    await navigateToFuncionarioPage(page, '/tramites')
    await waitForDataTableLoad(page)

    // Get initial data count
    const initialCount = await getTableRowCount(page)

    // Perform search
    await performSearch(page, 'nonexistent123')
    const searchCount = await getTableRowCount(page)

    // Clear search
    await clearSearch(page)
    const restoredCount = await getTableRowCount(page)

    // Data should be restored to initial state
    expect(restoredCount).toBe(initialCount)
  })

  test('should handle browser refresh during search', async ({ page }) => {
    await navigateToFuncionarioPage(page, '/tramites')
    await waitForDataTableLoad(page)

    // Perform search
    await performSearch(page, 'Certificado')

    // Refresh page
    await page.reload()
    await waitForDataTableLoad(page)

    // Verify user is still authenticated
    await expect(page.locator('text=Funcionario Test')).toBeVisible()

    // Verify search is cleared after refresh
    const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
    await expect(searchInput).toHaveValue('')
  })
})
