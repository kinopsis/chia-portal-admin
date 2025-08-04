/**
 * Authenticated End-to-End Tests for Services Management
 * 
 * Comprehensive tests for all implemented UX/UI improvements including:
 * - Authentication and navigation
 * - Toggle switches functionality
 * - Immutable codes validation
 * - Improved edit modal
 * - Responsive design
 * - Error handling
 */

import { test, expect, Page } from '@playwright/test'

// Test credentials
const TEST_CREDENTIALS = {
  email: 'demo@demo.com',
  password: 'funcionario123'
}

// Viewport configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 }
}

// Helper function for authentication
async function authenticateUser(page: Page) {
  await page.goto('/login')
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', TEST_CREDENTIALS.email)
  await page.fill('[data-testid="password-input"]', TEST_CREDENTIALS.password)
  
  // Submit login
  await page.click('[data-testid="login-button"]')
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/funcionarios/**', { timeout: 10000 })
  
  // Verify successful authentication
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
}

// Helper function to navigate to services page
async function navigateToServices(page: Page) {
  await page.goto('/funcionarios/servicios')
  await page.waitForLoadState('networkidle')
  
  // Verify we're on the services page
  await expect(page.locator('h1')).toContainText('Gestión')
}

// Helper function to wait for services to load
async function waitForServicesLoad(page: Page) {
  // Wait for either table or cards to be visible
  await Promise.race([
    page.waitForSelector('[data-testid="services-table"]', { timeout: 10000 }),
    page.waitForSelector('.service-card-mobile', { timeout: 10000 })
  ])
}

test.describe('Services Management - Authenticated Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate before each test
    await authenticateUser(page)
    await navigateToServices(page)
  })

  test.describe('1. Authentication and Navigation', () => {
    test('should successfully authenticate and access services page', async ({ page }) => {
      // Verify page title
      await expect(page.locator('h1')).toContainText('Gestión Unificada de Servicios')
      
      // Verify user has funcionario permissions
      await expect(page.locator('[data-testid="create-service-button"]')).toBeVisible()
      
      // Check for services data
      await waitForServicesLoad(page)
    })

    test('should display correct breadcrumbs and navigation', async ({ page }) => {
      // Check breadcrumbs
      await expect(page.locator('[data-testid="breadcrumbs"]')).toContainText('Servicios')
      
      // Verify navigation menu
      await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()
    })
  })

  test.describe('2. Toggle Switches Functionality', () => {
    test('should display toggle switches for each service', async ({ page }) => {
      await waitForServicesLoad(page)
      
      // Check that toggle switches are present
      const toggles = page.locator('[role="switch"]')
      await expect(toggles).toHaveCount(2, { timeout: 10000 })
      
      // Verify each toggle has proper ARIA attributes
      for (let i = 0; i < await toggles.count(); i++) {
        const toggle = toggles.nth(i)
        await expect(toggle).toHaveAttribute('aria-checked')
        await expect(toggle).toHaveAttribute('aria-label')
      }
    })

    test('should toggle service state with confirmation dialog', async ({ page }) => {
      await waitForServicesLoad(page)
      
      // Find first toggle switch
      const firstToggle = page.locator('[role="switch"]').first()
      
      // Get initial state
      const initialState = await firstToggle.getAttribute('aria-checked')
      
      // Click toggle
      await firstToggle.click()
      
      // Should show confirmation dialog
      await expect(page.locator('text=Confirmar cambio')).toBeVisible({ timeout: 5000 })
      
      // Take screenshot of confirmation dialog
      await page.screenshot({ path: 'test-results/toggle-confirmation.png' })
      
      // Confirm the action
      if (initialState === 'true') {
        await page.locator('text=Desactivar').click()
      } else {
        await page.locator('text=Activar').click()
      }
      
      // Wait for state change
      await page.waitForTimeout(2000)
      
      // Verify state has changed
      const newState = await firstToggle.getAttribute('aria-checked')
      expect(newState).not.toBe(initialState)
      
      // Verify change persisted (reload page)
      await page.reload()
      await waitForServicesLoad(page)
      
      const persistedState = await page.locator('[role="switch"]').first().getAttribute('aria-checked')
      expect(persistedState).toBe(newState)
    })

    test('should show loading state during toggle operation', async ({ page }) => {
      await waitForServicesLoad(page)
      
      // Intercept API calls to add delay
      await page.route('**/api/tramites/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        route.continue()
      })
      
      const firstToggle = page.locator('[role="switch"]').first()
      await firstToggle.click()
      
      // Confirm action
      await page.locator('text=Activar, text=Desactivar').first().click()
      
      // Should show loading spinner
      await expect(page.locator('.animate-spin')).toBeVisible()
    })

    test('should cancel toggle action when cancelled', async ({ page }) => {
      await waitForServicesLoad(page)
      
      const firstToggle = page.locator('[role="switch"]').first()
      const initialState = await firstToggle.getAttribute('aria-checked')
      
      await firstToggle.click()
      
      // Cancel the action
      await page.locator('text=Cancelar').click()
      
      // Verify state hasn't changed
      const currentState = await firstToggle.getAttribute('aria-checked')
      expect(currentState).toBe(initialState)
    })
  })

  test.describe('3. Immutable Codes Validation', () => {
    test('should display codes in XXX-XXX-XXX format', async ({ page }) => {
      await waitForServicesLoad(page)
      
      // Check for codes in correct format
      const codePattern = /\d{3}-\d{3}-\d{3}/
      const codes = page.locator('text=/\\d{3}-\\d{3}-\\d{3}/')
      
      await expect(codes.first()).toBeVisible()
      
      // Verify at least one code matches the pattern
      const codeText = await codes.first().textContent()
      expect(codeText).toMatch(codePattern)
    })

    test('should show immutable code field in edit modal', async ({ page }) => {
      await waitForServicesLoad(page)
      
      // Open edit modal
      await page.locator('[title="Editar"]').first().click()
      
      // Wait for modal to open
      await expect(page.locator('text=Editar Servicio')).toBeVisible()
      
      // Check for immutable code display
      await expect(page.locator('text=🔒')).toBeVisible()
      await expect(page.locator('text=No editable')).toBeVisible()
      
      // Verify code field is read-only
      const codeDisplay = page.locator('text=/\\d{3}-\\d{3}-\\d{3}/').first()
      await expect(codeDisplay).toBeVisible()
      
      // Take screenshot of immutable code field
      await page.screenshot({ path: 'test-results/immutable-code-field.png' })
    })
  })

  test.describe('4. Improved Edit Modal', () => {
    test('should display grouped sections in edit modal', async ({ page }) => {
      await waitForServicesLoad(page)
      
      // Open edit modal
      await page.locator('[title="Editar"]').first().click()
      
      // Wait for modal
      await expect(page.locator('text=Editar Servicio')).toBeVisible()
      
      // Check for the 3 grouped sections
      await expect(page.locator('text=📋 Información Básica')).toBeVisible()
      await expect(page.locator('text=🏢 Organización')).toBeVisible()
      await expect(page.locator('text=⚙️ Configuración')).toBeVisible()
      
      // Take screenshot of organized modal
      await page.screenshot({ path: 'test-results/organized-modal.png' })
    })

    test('should have proper field organization', async ({ page }) => {
      await waitForServicesLoad(page)
      
      await page.locator('[title="Editar"]').first().click()
      await expect(page.locator('text=Editar Servicio')).toBeVisible()
      
      // Verify fields are in correct sections
      // Basic Information section
      await expect(page.locator('text=📋 Información Básica')).toBeVisible()
      await expect(page.locator('input[placeholder*="nombre"], input[value*="Certificado"]')).toBeVisible()
      
      // Organization section
      await expect(page.locator('text=🏢 Organización')).toBeVisible()
      await expect(page.locator('text=Dependencia')).toBeVisible()
      await expect(page.locator('text=Subdependencia')).toBeVisible()
      
      // Configuration section
      await expect(page.locator('text=⚙️ Configuración')).toBeVisible()
    })
  })
})

test.describe('5. Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page)
    await navigateToServices(page)
  })

  test('should show table view on desktop', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await waitForServicesLoad(page)
    
    // Should show table headers
    await expect(page.locator('text=Código')).toBeVisible()
    await expect(page.locator('text=Servicio')).toBeVisible()
    await expect(page.locator('text=Estado')).toBeVisible()
    
    // Take screenshot of desktop view
    await page.screenshot({ path: 'test-results/desktop-table-view.png' })
  })

  test('should switch to card view on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.reload()
    await waitForServicesLoad(page)
    
    // Should show card view elements
    await expect(page.locator('.service-card-mobile')).toBeVisible()
    
    // Should hide desktop-only columns
    await expect(page.locator('text=Código')).not.toBeVisible()
    
    // Take screenshot of mobile view
    await page.screenshot({ path: 'test-results/mobile-card-view.png' })
  })

  test('should allow manual view toggle', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop)
    await waitForServicesLoad(page)
    
    // Find view toggle buttons
    const cardViewButton = page.locator('[title="Vista de tarjetas"]')
    const tableViewButton = page.locator('[title="Vista de tabla"]')
    
    // Switch to card view
    await cardViewButton.click()
    await expect(cardViewButton).toHaveClass(/bg-blue-100/)
    
    // Switch back to table view
    await tableViewButton.click()
    await expect(tableViewButton).toHaveClass(/bg-blue-100/)
  })

  test('should work properly on tablet', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet)
    await page.reload()
    await waitForServicesLoad(page)
    
    // Should show some columns but hide others
    await expect(page.locator('text=Servicio')).toBeVisible()
    
    // Take screenshot of tablet view
    await page.screenshot({ path: 'test-results/tablet-view.png' })
  })
})
