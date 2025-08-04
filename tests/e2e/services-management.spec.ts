/**
 * End-to-End Tests for Services Management
 * 
 * Tests the complete user journey for managing services including:
 * - Toggle switches functionality
 * - Responsive design
 * - Service CRUD operations
 * - Error handling
 */

import { test, expect } from '@playwright/test'

test.describe('Services Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to services management page
    await page.goto('/funcionarios/servicios')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Basic Functionality', () => {
    test('should display services list', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1')).toContainText('Gestión Unificada de Servicios')
      
      // Check that services are displayed
      await expect(page.locator('[data-testid="services-table"]')).toBeVisible()
      
      // Check for service codes in XXX-XXX-XXX format
      await expect(page.locator('text=/\\d{3}-\\d{3}-\\d{3}/')).toBeVisible()
    })

    test('should show service details correctly', async ({ page }) => {
      // Check for service names
      await expect(page.locator('text=Certificado')).toBeVisible()
      
      // Check for service types (badges)
      await expect(page.locator('text=📄')).toBeVisible()
      
      // Check for dependency information
      await expect(page.locator('text=Secretaría')).toBeVisible()
    })
  })

  test.describe('Toggle Switches', () => {
    test('should display toggle switches for each service', async ({ page }) => {
      // Check that toggle switches are present
      const toggles = page.locator('[role="switch"]')
      await expect(toggles).toHaveCount(2, { timeout: 10000 })
    })

    test('should toggle service state with confirmation', async ({ page }) => {
      // Find first toggle switch
      const firstToggle = page.locator('[role="switch"]').first()
      
      // Get initial state
      const initialState = await firstToggle.getAttribute('aria-checked')
      
      // Click toggle
      await firstToggle.click()
      
      // Should show confirmation dialog
      await expect(page.locator('text=Confirmar cambio')).toBeVisible()
      
      // Confirm the action
      if (initialState === 'true') {
        await page.locator('text=Desactivar').click()
      } else {
        await page.locator('text=Activar').click()
      }
      
      // Wait for state change
      await page.waitForTimeout(1000)
      
      // Check that state has changed
      const newState = await firstToggle.getAttribute('aria-checked')
      expect(newState).not.toBe(initialState)
    })

    test('should cancel toggle action', async ({ page }) => {
      // Find first toggle switch
      const firstToggle = page.locator('[role="switch"]').first()
      
      // Get initial state
      const initialState = await firstToggle.getAttribute('aria-checked')
      
      // Click toggle
      await firstToggle.click()
      
      // Should show confirmation dialog
      await expect(page.locator('text=Confirmar cambio')).toBeVisible()
      
      // Cancel the action
      await page.locator('text=Cancelar').click()
      
      // Check that state hasn't changed
      const currentState = await firstToggle.getAttribute('aria-checked')
      expect(currentState).toBe(initialState)
    })
  })

  test.describe('Responsive Design', () => {
    test('should show table view on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1200, height: 800 })
      
      // Check for table headers
      await expect(page.locator('text=Código')).toBeVisible()
      await expect(page.locator('text=Servicio')).toBeVisible()
      await expect(page.locator('text=Estado')).toBeVisible()
    })

    test('should switch to card view on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Reload to trigger responsive behavior
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Should show card view elements
      await expect(page.locator('.service-card-mobile')).toBeVisible()
    })

    test('should allow manual view toggle', async ({ page }) => {
      // Find view toggle buttons
      const cardViewButton = page.locator('[title="Vista de tarjetas"]')
      const tableViewButton = page.locator('[title="Vista de tabla"]')
      
      // Switch to card view
      await cardViewButton.click()
      
      // Check that card view is active
      await expect(cardViewButton).toHaveClass(/bg-blue-100/)
      
      // Switch back to table view
      await tableViewButton.click()
      
      // Check that table view is active
      await expect(tableViewButton).toHaveClass(/bg-blue-100/)
    })
  })

  test.describe('Service Actions', () => {
    test('should open edit modal', async ({ page }) => {
      // Find and click edit button
      const editButton = page.locator('[title="Editar"]').first()
      await editButton.click()
      
      // Should open edit modal
      await expect(page.locator('text=Editar Servicio')).toBeVisible()
      
      // Check that code field is read-only
      const codeField = page.locator('input[value*="-"]')
      await expect(codeField).toBeDisabled()
    })

    test('should show immutable code field in edit form', async ({ page }) => {
      // Open edit modal
      await page.locator('[title="Editar"]').first().click()
      
      // Check for immutable code display
      await expect(page.locator('text=🔒 No editable')).toBeVisible()
      await expect(page.locator('text=Código inmutable')).toBeVisible()
    })

    test('should display grouped form sections', async ({ page }) => {
      // Open edit modal
      await page.locator('[title="Editar"]').first().click()
      
      // Check for section headers
      await expect(page.locator('text=📋 Información Básica')).toBeVisible()
      await expect(page.locator('text=🏢 Organización')).toBeVisible()
      await expect(page.locator('text=⚙️ Configuración')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should display error states', async ({ page }) => {
      // Simulate network error by intercepting requests
      await page.route('**/api/tramites', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' })
        })
      })
      
      // Reload page to trigger error
      await page.reload()
      
      // Should show error message
      await expect(page.locator('text=Error')).toBeVisible()
    })

    test('should show loading states', async ({ page }) => {
      // Intercept requests to add delay
      await page.route('**/api/tramites', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        route.continue()
      })
      
      // Reload page
      await page.reload()
      
      // Should show loading state
      await expect(page.locator('.animate-spin')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Focus first toggle
      await page.keyboard.press('Tab')
      
      // Should focus toggle switch
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toHaveAttribute('role', 'switch')
      
      // Press Enter to activate
      await page.keyboard.press('Enter')
      
      // Should show confirmation dialog
      await expect(page.locator('text=Confirmar cambio')).toBeVisible()
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check toggle switches have proper ARIA
      const toggles = page.locator('[role="switch"]')
      
      for (let i = 0; i < await toggles.count(); i++) {
        const toggle = toggles.nth(i)
        await expect(toggle).toHaveAttribute('aria-checked')
        await expect(toggle).toHaveAttribute('aria-label')
      }
    })

    test('should support screen readers', async ({ page }) => {
      // Check for semantic HTML structure
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('h1')).toBeVisible()
      
      // Check for proper table structure
      await expect(page.locator('table')).toBeVisible()
      await expect(page.locator('th')).toHaveCount(5, { timeout: 5000 })
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/funcionarios/servicios')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should handle large datasets', async ({ page }) => {
      // This would require seeding the database with many records
      // For now, just check that pagination works
      
      await expect(page.locator('text=Página')).toBeVisible()
    })
  })
})
