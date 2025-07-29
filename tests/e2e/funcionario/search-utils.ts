import { Page, expect, Locator } from '@playwright/test'

/**
 * Search functionality utilities for funcionario E2E tests
 */

export interface SearchTestCase {
  searchTerm: string
  expectedResults: string[]
  shouldFindResults: boolean
  description: string
}

/**
 * Gets the search input element
 */
export async function getSearchInput(page: Page): Promise<Locator> {
  const searchInput = page.locator('input[placeholder*="Buscar"], input[aria-label*="Buscar"]')
  await expect(searchInput).toBeVisible()
  return searchInput
}

/**
 * Performs a search and waits for results
 */
export async function performSearch(page: Page, searchTerm: string) {
  const searchInput = await getSearchInput(page)
  
  // Clear existing search
  await searchInput.clear()
  
  // Type search term
  await searchInput.fill(searchTerm)
  
  // Wait for search to process (debounced)
  await page.waitForTimeout(500)
  
  // Wait for table to update
  await page.waitForFunction(() => {
    const tbody = document.querySelector('tbody')
    return tbody !== null
  }, { timeout: 5000 })
}

/**
 * Clears search input and waits for results to reset
 */
export async function clearSearch(page: Page) {
  const searchInput = await getSearchInput(page)
  await searchInput.clear()
  
  // Wait for search to clear
  await page.waitForTimeout(500)
  
  // Wait for table to update
  await page.waitForFunction(() => {
    const tbody = document.querySelector('tbody')
    return tbody !== null
  }, { timeout: 5000 })
}

/**
 * Gets all visible table rows
 */
export async function getTableRows(page: Page): Promise<Locator> {
  return page.locator('tbody tr')
}

/**
 * Gets the count of visible table rows
 */
export async function getTableRowCount(page: Page): Promise<number> {
  const rows = await getTableRows(page)
  return await rows.count()
}

/**
 * Verifies that search results contain expected text
 */
export async function verifySearchResults(page: Page, expectedTexts: string[]) {
  const rows = await getTableRows(page)
  const rowCount = await rows.count()
  
  if (expectedTexts.length === 0) {
    // Expecting no results
    expect(rowCount).toBe(0)
    return
  }
  
  // Check that we have results
  expect(rowCount).toBeGreaterThan(0)
  
  // Verify each expected text appears in results
  for (const expectedText of expectedTexts) {
    await expect(page.locator(`tbody tr:has-text("${expectedText}")`)).toBeVisible()
  }
}

/**
 * Verifies that search results do NOT contain specific text
 */
export async function verifySearchResultsExclude(page: Page, excludedTexts: string[]) {
  for (const excludedText of excludedTexts) {
    await expect(page.locator(`tbody tr:has-text("${excludedText}")`)).not.toBeVisible()
  }
}

/**
 * Tests case-insensitive search
 */
export async function testCaseInsensitiveSearch(page: Page, searchTerm: string, expectedResults: string[]) {
  // Test lowercase
  await performSearch(page, searchTerm.toLowerCase())
  await verifySearchResults(page, expectedResults)
  
  // Test uppercase
  await performSearch(page, searchTerm.toUpperCase())
  await verifySearchResults(page, expectedResults)
  
  // Test mixed case
  await performSearch(page, searchTerm)
  await verifySearchResults(page, expectedResults)
}

/**
 * Tests real-time search (typing character by character)
 */
export async function testRealTimeSearch(page: Page, searchTerm: string) {
  const searchInput = await getSearchInput(page)
  await searchInput.clear()
  
  // Type character by character
  for (let i = 1; i <= searchTerm.length; i++) {
    const partialTerm = searchTerm.substring(0, i)
    await searchInput.fill(partialTerm)
    
    // Wait for search to process
    await page.waitForTimeout(300)
    
    // Verify table updates after each character
    await page.waitForFunction(() => {
      const tbody = document.querySelector('tbody')
      return tbody !== null
    }, { timeout: 3000 })
  }
}

/**
 * Verifies empty state when no results found
 */
export async function verifyEmptyState(page: Page) {
  // Check for empty table body
  const rows = await getTableRows(page)
  const rowCount = await rows.count()
  expect(rowCount).toBe(0)
  
  // Check for empty state message (if implemented)
  const emptyStateMessages = [
    'No se encontraron resultados',
    'Sin resultados',
    'No hay datos',
    'No results found'
  ]
  
  let emptyStateFound = false
  for (const message of emptyStateMessages) {
    try {
      await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 1000 })
      emptyStateFound = true
      break
    } catch (error) {
      // Continue checking other messages
    }
  }
  
  // At minimum, table should be empty
  expect(rowCount).toBe(0)
}

/**
 * Verifies search accessibility
 */
export async function verifySearchAccessibility(page: Page) {
  const searchInput = await getSearchInput(page)
  
  // Check for proper ARIA labels
  const ariaLabel = await searchInput.getAttribute('aria-label')
  const placeholder = await searchInput.getAttribute('placeholder')
  
  expect(ariaLabel || placeholder).toBeTruthy()
  
  // Check that search input is focusable
  await searchInput.focus()
  await expect(searchInput).toBeFocused()
  
  // Check for proper input type
  const inputType = await searchInput.getAttribute('type')
  expect(inputType).toBe('text')
}

/**
 * Tests search across different screen sizes
 */
export async function testResponsiveSearch(page: Page, searchTerm: string, expectedResults: string[]) {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ]
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    
    // Verify search input is still visible and functional
    const searchInput = await getSearchInput(page)
    await expect(searchInput).toBeVisible()
    
    // Perform search
    await performSearch(page, searchTerm)
    await verifySearchResults(page, expectedResults)
    
    // Clear search
    await clearSearch(page)
  }
}
