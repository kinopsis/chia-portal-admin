import { Page, expect } from '@playwright/test'

/**
 * Authentication utilities for funcionario E2E tests
 */

export interface FuncionarioUser {
  email: string
  password: string
  nombre: string
  dependencia: string
}

// Test funcionario user credentials
// Note: This user should exist in the development database
export const TEST_FUNCIONARIO: FuncionarioUser = {
  email: 'demo@demo.com',
  password: 'chibcha123',
  nombre: 'Demo User',
  dependencia: 'Demo Department'
}

/**
 * Logs in as a funcionario user
 */
export async function loginAsFuncionario(page: Page, user: FuncionarioUser = TEST_FUNCIONARIO) {
  // Navigate to login page
  await page.goto('/auth/login')
  
  // Wait for login form to be visible
  await expect(page.locator('form')).toBeVisible()
  
  // Fill login credentials - use more specific selectors to avoid multiple matches
  await page.locator('input[type="email"]').first().fill(user.email)
  await page.locator('input[type="password"]').first().fill(user.password)
  
  // Submit login form
  await page.click('button[type="submit"]')
  
  // Wait for redirect to funcionario dashboard
  await page.waitForURL('/funcionario**', { timeout: 10000 })
  
  // Verify we're logged in as funcionario
  await expect(page.locator('text=' + user.nombre)).toBeVisible()
  await expect(page.locator('text=' + user.dependencia)).toBeVisible()
}

/**
 * Ensures user is logged out
 */
export async function logout(page: Page) {
  // Try to find and click logout button
  try {
    const logoutButton = page.locator('button:has-text("Cerrar Sesión"), button:has-text("Salir")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }
  } catch (error) {
    // If logout button not found, navigate to login page directly
    await page.goto('/auth/login')
  }
  
  // Verify we're on login page
  await expect(page.locator('input[type="email"]').first()).toBeVisible()
}

/**
 * Verifies funcionario authentication state
 */
export async function verifyFuncionarioAuth(page: Page, user: FuncionarioUser = TEST_FUNCIONARIO) {
  // Check that we're on funcionario dashboard
  await expect(page).toHaveURL(/\/funcionario/)
  
  // Check user info is displayed
  await expect(page.locator('text=' + user.nombre)).toBeVisible()
  await expect(page.locator('text=' + user.dependencia)).toBeVisible()
  
  // Check funcionario navigation is available
  await expect(page.locator('nav a[href="/funcionario/tramites"]')).toBeVisible()
  await expect(page.locator('nav a[href="/funcionario/opas"]')).toBeVisible()
  await expect(page.locator('nav a[href="/funcionario/faqs"]')).toBeVisible()
}

/**
 * Navigates to a funcionario page and verifies access
 */
export async function navigateToFuncionarioPage(page: Page, path: string) {
  await page.goto(`/funcionario${path}`)
  
  // Wait for page to load
  await page.waitForLoadState('networkidle')
  
  // Verify we're on the correct page
  await expect(page).toHaveURL(`/funcionario${path}`)
  
  // Verify no unauthorized access errors
  await expect(page.locator('text=No autorizado')).not.toBeVisible()
  await expect(page.locator('text=Unauthorized')).not.toBeVisible()
}

/**
 * Checks for JavaScript errors in console
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  return errors
}

/**
 * Waits for data table to load with content
 */
export async function waitForDataTableLoad(page: Page) {
  // Wait for table to be visible
  await expect(page.locator('table')).toBeVisible()
  
  // Wait for either data rows or empty state
  await page.waitForFunction(() => {
    const tbody = document.querySelector('tbody')
    const emptyState = document.querySelector('[data-testid="empty-state"]')
    return (tbody && tbody.children.length > 0) || emptyState
  }, { timeout: 10000 })
}
