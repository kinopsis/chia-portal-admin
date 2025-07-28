/**
 * End-to-End Tests for Unified Services Management System
 * Portal de Atención Ciudadana de Chía
 * 
 * Tests cover:
 * - Authentication flow
 * - Unified services interface
 * - CRUD operations
 * - Data management (sorting, filtering, pagination)
 * - Responsive design
 * - Accessibility features
 */

import { test, expect, Page } from '@playwright/test'

// Page Object Model for maintainability
class UnifiedServicesPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/admin/servicios')
  }

  async login(email: string = 'laura.gomez.new@visualcare.com', password: string = 'password123') {
    await this.page.goto('/auth/login')
    await this.page.fill('input[type="email"]', email)
    await this.page.fill('input[type="password"]', password)
    await this.page.click('button[type="submit"]')
    // Wait for redirect to dashboard (the actual redirect destination)
    await this.page.waitForURL('/dashboard')
  }

  // Interface Elements
  get newServiceButton() {
    return this.page.locator('button:has-text("Nuevo Servicio")')
  }

  get dataTable() {
    return this.page.locator('table[role="table"]')
  }

  get searchInput() {
    return this.page.locator('input[placeholder*="Buscar"]')
  }

  get serviceTypeFilter() {
    return this.page.locator('select').first()
  }

  get dependencyFilter() {
    return this.page.locator('select').nth(1)
  }

  get metricsCards() {
    return this.page.locator('[data-testid="metric-card"]')
  }

  // Table Operations
  async sortByColumn(columnName: string) {
    await this.page.click(`th:has-text("${columnName}")`)
  }

  async getTableRows() {
    return this.page.locator('tbody tr')
  }

  async clickEditButton(rowIndex: number = 0) {
    await this.page.locator('tbody tr').nth(rowIndex).locator('button:has-text("Editar")').click()
  }

  async clickDeleteButton(rowIndex: number = 0) {
    await this.page.locator('tbody tr').nth(rowIndex).locator('button:has-text("Eliminar")').click()
  }

  // Filters
  async selectServiceType(type: 'Todos los servicios' | 'Solo Trámites' | 'Solo OPAs') {
    await this.serviceTypeFilter.selectOption({ label: type })
  }

  async selectDependency(dependency: string) {
    await this.dependencyFilter.selectOption({ label: dependency })
  }

  async searchServices(query: string) {
    await this.searchInput.fill(query)
    await this.page.keyboard.press('Enter')
  }

  // Modals
  get createModal() {
    return this.page.locator('[role="dialog"]:has-text("Crear Nuevo Servicio")')
  }

  get editModal() {
    return this.page.locator('[role="dialog"]:has-text("Editar Servicio")')
  }

  get deleteDialog() {
    return this.page.locator('[role="dialog"]:has-text("Eliminar Servicio")')
  }

  // Form Elements
  async fillServiceForm(data: {
    tipo?: 'tramite' | 'opa'
    codigo?: string
    nombre?: string
    descripcion?: string
    dependencia?: string
    subdependencia?: string
    tiempo_respuesta?: string
    activo?: boolean
    tiene_pago?: boolean
  }) {
    if (data.tipo) {
      await this.page.selectOption('select[name="tipo"]', data.tipo)
    }
    if (data.codigo) {
      await this.page.fill('input[name="codigo"]', data.codigo)
    }
    if (data.nombre) {
      await this.page.fill('input[name="nombre"]', data.nombre)
    }
    if (data.descripcion) {
      await this.page.fill('textarea[name="descripcion"]', data.descripcion)
    }
    if (data.dependencia) {
      await this.page.selectOption('select[name="dependencia_id"]', { label: data.dependencia })
    }
    if (data.subdependencia) {
      await this.page.selectOption('select[name="subdependencia_id"]', { label: data.subdependencia })
    }
    if (data.tiempo_respuesta) {
      await this.page.fill('input[name="tiempo_respuesta"]', data.tiempo_respuesta)
    }
    if (data.activo !== undefined) {
      const checkbox = this.page.locator('input[type="checkbox"][aria-label*="activo"]')
      if (data.activo) {
        await checkbox.check()
      } else {
        await checkbox.uncheck()
      }
    }
    if (data.tiene_pago !== undefined) {
      const checkbox = this.page.locator('input[type="checkbox"][aria-label*="costo"]')
      if (data.tiene_pago) {
        await checkbox.check()
      } else {
        await checkbox.uncheck()
      }
    }
  }

  async submitForm() {
    await this.page.click('button[type="submit"]')
  }

  async cancelForm() {
    await this.page.click('button:has-text("Cancelar")')
  }

  // Validation
  async expectMetricValue(metricName: string, expectedValue: string) {
    const metric = this.page.locator(`text="${metricName}"`).locator('..').locator('text=/\\d+/')
    await expect(metric).toHaveText(expectedValue)
  }

  async expectTableRowCount(count: number) {
    await expect(this.getTableRows()).toHaveCount(count)
  }

  async expectServiceInTable(serviceName: string) {
    await expect(this.page.locator(`tbody tr:has-text("${serviceName}")`)).toBeVisible()
  }
}

// Test Suite
test.describe('Unified Services Management System', () => {
  let unifiedServicesPage: UnifiedServicesPage

  test.beforeEach(async ({ page }) => {
    unifiedServicesPage = new UnifiedServicesPage(page)
    
    // Login before each test
    await unifiedServicesPage.login()
  })

  test.describe('Authentication and Navigation', () => {
    test('should login successfully and access unified services page', async ({ page }) => {
      await unifiedServicesPage.goto()
      
      // Verify page loads correctly
      await expect(page).toHaveTitle(/Admin - Portal Ciudadano Chía/)
      await expect(page.locator('h1:has-text("Gestión Unificada de Servicios")')).toBeVisible()
      
      // Verify user is authenticated
      await expect(page.locator('text="Soporte Torre Central"')).toBeVisible()
      await expect(page.locator('text="admin"')).toBeVisible()
    })

    test('should redirect to login if not authenticated', async ({ page }) => {
      // Clear session
      await page.context().clearCookies()
      await page.goto('/admin/servicios')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe('Unified Services Interface', () => {
    test('should display unified services interface without errors', async ({ page }) => {
      await unifiedServicesPage.goto()
      
      // Wait for page to load completely
      await page.waitForLoadState('networkidle')
      
      // Verify no JavaScript errors in console
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      // Verify main interface elements
      await expect(unifiedServicesPage.dataTable).toBeVisible()
      await expect(unifiedServicesPage.newServiceButton).toBeVisible()
      await expect(unifiedServicesPage.searchInput).toBeVisible()
      
      // Verify no critical errors
      expect(errors.filter(error => 
        !error.includes('DevTools') && 
        !error.includes('punycode')
      )).toHaveLength(0)
    })

    test('should display correct metrics dashboard', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')
      
      // Verify metrics are displayed
      await expect(page.locator('text="Total Trámites"')).toBeVisible()
      await expect(page.locator('text="109"')).toBeVisible()
      await expect(page.locator('text="Activos"')).toBeVisible()
      await expect(page.locator('text="Con Pago"')).toBeVisible()
      await expect(page.locator('text="Gratuitos"')).toBeVisible()
    })

    test('should display data table with Trámites and OPAs', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')
      
      // Verify table headers
      await expect(page.locator('th:has-text("Código")')).toBeVisible()
      await expect(page.locator('th:has-text("Nombre")')).toBeVisible()
      await expect(page.locator('th:has-text("Tipo")')).toBeVisible()
      await expect(page.locator('th:has-text("Dependencia")')).toBeVisible()
      
      // Verify data rows are present
      const rows = await unifiedServicesPage.getTableRows()
      await expect(rows).toHaveCount.greaterThan(0)
      
      // Verify service types are displayed
      await expect(page.locator('text="📄 Trámite"')).toBeVisible()
    })
  })

  test.describe('Advanced Filters', () => {
    test('should filter by service type', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Test filtering by Trámites only
      await unifiedServicesPage.selectServiceType('Solo Trámites')
      await page.waitForTimeout(1000) // Wait for filter to apply

      // Verify only Trámites are shown
      const tramiteRows = page.locator('tbody tr:has-text("📄 Trámite")')
      const opaRows = page.locator('tbody tr:has-text("⚡ OPA")')

      await expect(tramiteRows).toHaveCount.greaterThan(0)
      await expect(opaRows).toHaveCount(0)

      // Test filtering by OPAs only
      await unifiedServicesPage.selectServiceType('Solo OPAs')
      await page.waitForTimeout(1000)

      // Verify only OPAs are shown
      await expect(page.locator('tbody tr:has-text("⚡ OPA")')).toHaveCount.greaterThan(0)
      await expect(page.locator('tbody tr:has-text("📄 Trámite")')).toHaveCount(0)
    })

    test('should filter by dependency', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Select a specific dependency
      await unifiedServicesPage.selectDependency('Secretaria de Planeacion')
      await page.waitForTimeout(1000)

      // Verify filtered results
      const rows = await unifiedServicesPage.getTableRows()
      await expect(rows).toHaveCount.greaterThan(0)

      // Verify all visible rows contain the selected dependency
      const dependencyCells = page.locator('tbody tr td:has-text("Secretaria de Planeacion")')
      await expect(dependencyCells).toHaveCount.greaterThan(0)
    })

    test('should search services by name', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Search for a specific service
      await unifiedServicesPage.searchServices('SISBEN')
      await page.waitForTimeout(1000)

      // Verify search results
      await expect(page.locator('tbody tr:has-text("SISBEN")')).toBeVisible()
    })
  })

  test.describe('CRUD Operations', () => {
    test('should open create modal and validate form', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Click new service button
      await unifiedServicesPage.newServiceButton.click()

      // Verify modal opens
      await expect(unifiedServicesPage.createModal).toBeVisible()
      await expect(page.locator('h2:has-text("Crear Nuevo Servicio")')).toBeVisible()

      // Verify form fields are present
      await expect(page.locator('select[name="tipo"]')).toBeVisible()
      await expect(page.locator('input[name="codigo"]')).toBeVisible()
      await expect(page.locator('input[name="nombre"]')).toBeVisible()
      await expect(page.locator('textarea[name="descripcion"]')).toBeVisible()

      // Test form validation
      await unifiedServicesPage.submitForm()

      // Should show validation errors for required fields
      await expect(page.locator('text="Este campo es requerido"')).toBeVisible()
    })

    test('should create new Trámite successfully', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Open create modal
      await unifiedServicesPage.newServiceButton.click()
      await expect(unifiedServicesPage.createModal).toBeVisible()

      // Fill form with valid data
      await unifiedServicesPage.fillServiceForm({
        tipo: 'tramite',
        codigo: 'TEST-001',
        nombre: 'Trámite de Prueba E2E',
        descripcion: 'Descripción del trámite de prueba para E2E testing',
        tiempo_respuesta: '5 días hábiles',
        activo: true,
        tiene_pago: false
      })

      // Submit form
      await unifiedServicesPage.submitForm()

      // Verify modal closes and service appears in table
      await expect(unifiedServicesPage.createModal).not.toBeVisible()
      await unifiedServicesPage.expectServiceInTable('Trámite de Prueba E2E')
    })

    test('should create new OPA successfully', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Open create modal
      await unifiedServicesPage.newServiceButton.click()
      await expect(unifiedServicesPage.createModal).toBeVisible()

      // Fill form with valid OPA data
      await unifiedServicesPage.fillServiceForm({
        tipo: 'opa',
        codigo: 'OPA-TEST-001',
        nombre: 'OPA de Prueba E2E',
        descripcion: 'Descripción de la OPA de prueba para E2E testing',
        tiempo_respuesta: '3 días hábiles',
        activo: true,
        tiene_pago: true
      })

      // Submit form
      await unifiedServicesPage.submitForm()

      // Verify modal closes and OPA appears in table
      await expect(unifiedServicesPage.createModal).not.toBeVisible()
      await unifiedServicesPage.expectServiceInTable('OPA de Prueba E2E')
    })

    test('should edit existing service', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Click edit button on first row
      await unifiedServicesPage.clickEditButton(0)

      // Verify edit modal opens with pre-populated data
      await expect(unifiedServicesPage.editModal).toBeVisible()
      await expect(page.locator('h2:has-text("Editar Servicio")')).toBeVisible()

      // Verify form is pre-populated
      const nameInput = page.locator('input[name="nombre"]')
      await expect(nameInput).not.toHaveValue('')

      // Modify service name
      await nameInput.fill('Servicio Editado E2E')

      // Submit changes
      await unifiedServicesPage.submitForm()

      // Verify modal closes and changes are reflected
      await expect(unifiedServicesPage.editModal).not.toBeVisible()
      await unifiedServicesPage.expectServiceInTable('Servicio Editado E2E')
    })

    test('should delete service with confirmation', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Get initial row count
      const initialRows = await unifiedServicesPage.getTableRows()
      const initialCount = await initialRows.count()

      // Click delete button on first row
      await unifiedServicesPage.clickDeleteButton(0)

      // Verify delete confirmation dialog
      await expect(unifiedServicesPage.deleteDialog).toBeVisible()
      await expect(page.locator('text="¿Estás seguro de que deseas eliminar"')).toBeVisible()

      // Confirm deletion
      await page.click('button:has-text("Eliminar")')

      // Verify dialog closes and row count decreases
      await expect(unifiedServicesPage.deleteDialog).not.toBeVisible()
      await page.waitForTimeout(1000)

      const finalRows = await unifiedServicesPage.getTableRows()
      const finalCount = await finalRows.count()
      expect(finalCount).toBeLessThan(initialCount)
    })

    test('should cancel delete operation', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Get initial row count
      const initialRows = await unifiedServicesPage.getTableRows()
      const initialCount = await initialRows.count()

      // Click delete button
      await unifiedServicesPage.clickDeleteButton(0)

      // Verify delete confirmation dialog
      await expect(unifiedServicesPage.deleteDialog).toBeVisible()

      // Cancel deletion
      await page.click('button:has-text("Cancelar")')

      // Verify dialog closes and row count remains same
      await expect(unifiedServicesPage.deleteDialog).not.toBeVisible()

      const finalRows = await unifiedServicesPage.getTableRows()
      const finalCount = await finalRows.count()
      expect(finalCount).toBe(initialCount)
    })
  })

  test.describe('Data Management', () => {
    test('should sort table columns', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Test sorting by código (ascending)
      await unifiedServicesPage.sortByColumn('Código')
      await page.waitForTimeout(500)

      // Get first two codes to verify sorting
      const firstCode = await page.locator('tbody tr:first-child td:first-child').textContent()
      const secondCode = await page.locator('tbody tr:nth-child(2) td:first-child').textContent()

      // Verify ascending order
      expect(firstCode?.localeCompare(secondCode || '') || 0).toBeLessThanOrEqual(0)

      // Test sorting by código (descending)
      await unifiedServicesPage.sortByColumn('Código')
      await page.waitForTimeout(500)

      const firstCodeDesc = await page.locator('tbody tr:first-child td:first-child').textContent()
      const secondCodeDesc = await page.locator('tbody tr:nth-child(2) td:first-child').textContent()

      // Verify descending order
      expect(firstCodeDesc?.localeCompare(secondCodeDesc || '') || 0).toBeGreaterThanOrEqual(0)
    })

    test('should navigate pagination', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Change items per page to see pagination
      await page.selectOption('select[aria-label="Registros por página"]', '5')
      await page.waitForTimeout(1000)

      // Verify pagination controls
      await expect(page.locator('button:has-text("1")')).toBeVisible()

      // If there are multiple pages, test navigation
      const nextButton = page.locator('button[aria-label="Página siguiente"]')
      if (await nextButton.isEnabled()) {
        await nextButton.click()
        await page.waitForTimeout(500)

        // Verify page changed
        await expect(page.locator('button:has-text("2")')).toHaveClass(/active|selected/)

        // Go back to first page
        await page.locator('button[aria-label="Página anterior"]').click()
        await page.waitForTimeout(500)
        await expect(page.locator('button:has-text("1")')).toHaveClass(/active|selected/)
      }
    })

    test('should handle bulk selection', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Check if bulk selection is available
      const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
      if (await selectAllCheckbox.isVisible()) {
        // Select all items
        await selectAllCheckbox.check()

        // Verify all row checkboxes are checked
        const rowCheckboxes = page.locator('tbody input[type="checkbox"]')
        const checkboxCount = await rowCheckboxes.count()

        for (let i = 0; i < checkboxCount; i++) {
          await expect(rowCheckboxes.nth(i)).toBeChecked()
        }

        // Unselect all
        await selectAllCheckbox.uncheck()

        // Verify all row checkboxes are unchecked
        for (let i = 0; i < checkboxCount; i++) {
          await expect(rowCheckboxes.nth(i)).not.toBeChecked()
        }
      }
    })

    test('should combine filters correctly', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Apply multiple filters
      await unifiedServicesPage.selectServiceType('Solo Trámites')
      await page.waitForTimeout(500)

      await unifiedServicesPage.selectDependency('Secretaria de Planeacion')
      await page.waitForTimeout(500)

      // Verify combined filtering
      const rows = await unifiedServicesPage.getTableRows()
      const rowCount = await rows.count()

      if (rowCount > 0) {
        // Verify all visible rows match both filters
        await expect(page.locator('tbody tr:has-text("📄 Trámite")')).toHaveCount(rowCount)
        await expect(page.locator('tbody tr:has-text("Secretaria de Planeacion")')).toHaveCount(rowCount)
      }

      // Clear filters
      await page.click('button:has-text("Limpiar filtros")')
      await page.waitForTimeout(500)

      // Verify filters are cleared
      const clearedRows = await unifiedServicesPage.getTableRows()
      const clearedCount = await clearedRows.count()
      expect(clearedCount).toBeGreaterThanOrEqual(rowCount)
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Verify mobile layout adaptations
      await expect(page.locator('h1:has-text("Gestión Unificada de Servicios")')).toBeVisible()

      // Check if mobile-specific elements are visible
      const mobileTable = page.locator('[data-testid="mobile-table"]')
      const desktopTable = page.locator('table[role="table"]')

      // Either mobile table should be visible or desktop table should adapt
      const isMobileTableVisible = await mobileTable.isVisible().catch(() => false)
      const isDesktopTableVisible = await desktopTable.isVisible().catch(() => false)

      expect(isMobileTableVisible || isDesktopTableVisible).toBe(true)
    })

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Verify tablet layout
      await expect(unifiedServicesPage.dataTable).toBeVisible()
      await expect(unifiedServicesPage.newServiceButton).toBeVisible()

      // Verify responsive navigation
      const sidebar = page.locator('[role="complementary"]')
      await expect(sidebar).toBeVisible()
    })

    test('should work on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Verify desktop layout
      await expect(unifiedServicesPage.dataTable).toBeVisible()
      await expect(page.locator('[role="complementary"]')).toBeVisible() // Sidebar

      // Verify all columns are visible
      await expect(page.locator('th:has-text("Código")')).toBeVisible()
      await expect(page.locator('th:has-text("Nombre")')).toBeVisible()
      await expect(page.locator('th:has-text("Tipo")')).toBeVisible()
      await expect(page.locator('th:has-text("Dependencia")')).toBeVisible()
      await expect(page.locator('th:has-text("Estado")')).toBeVisible()
    })
  })

  test.describe('Accessibility Features', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Verify table accessibility
      await expect(page.locator('table[role="table"]')).toBeVisible()
      await expect(page.locator('[role="columnheader"]')).toHaveCount.greaterThan(0)

      // Verify form accessibility
      await unifiedServicesPage.newServiceButton.click()
      await expect(unifiedServicesPage.createModal).toBeVisible()

      // Check form labels and ARIA attributes
      await expect(page.locator('label[for]')).toHaveCount.greaterThan(0)
      await expect(page.locator('input[aria-label]')).toHaveCount.greaterThan(0)

      // Close modal
      await unifiedServicesPage.cancelForm()
    })

    test('should support keyboard navigation', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Test tab navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Verify focus is visible
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Test Enter key on buttons
      await unifiedServicesPage.newServiceButton.focus()
      await page.keyboard.press('Enter')

      // Verify modal opens
      await expect(unifiedServicesPage.createModal).toBeVisible()

      // Test Escape key to close modal
      await page.keyboard.press('Escape')
      await expect(unifiedServicesPage.createModal).not.toBeVisible()
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Verify heading structure
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1:has-text("Gestión Unificada de Servicios")')).toBeVisible()

      // Verify subheadings
      await expect(page.locator('h2, h3')).toHaveCount.greaterThan(0)
    })

    test('should provide screen reader friendly content', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Verify skip links
      await expect(page.locator('a:has-text("Saltar al contenido principal")')).toBeVisible()

      // Verify table captions or summaries
      const tableRegion = page.locator('[role="region"][aria-label*="Tabla"]')
      await expect(tableRegion).toBeVisible()

      // Verify button descriptions
      await expect(page.locator('button[aria-label]')).toHaveCount.greaterThan(0)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Simulate network failure
      await page.route('**/api/**', route => route.abort())

      // Try to create a new service
      await unifiedServicesPage.newServiceButton.click()
      await unifiedServicesPage.fillServiceForm({
        tipo: 'tramite',
        codigo: 'ERROR-TEST',
        nombre: 'Error Test Service'
      })

      await unifiedServicesPage.submitForm()

      // Verify error handling
      await expect(page.locator('text="Error"')).toBeVisible()
    })

    test('should validate form inputs', async ({ page }) => {
      await unifiedServicesPage.goto()
      await page.waitForLoadState('networkidle')

      // Open create modal
      await unifiedServicesPage.newServiceButton.click()

      // Try to submit empty form
      await unifiedServicesPage.submitForm()

      // Verify validation messages
      await expect(page.locator('text="Este campo es requerido"')).toBeVisible()

      // Test invalid código format
      await page.fill('input[name="codigo"]', 'invalid-code-format!')
      await unifiedServicesPage.submitForm()

      // Verify format validation
      await expect(page.locator('text="Formato inválido"')).toBeVisible()
    })
  })
})
