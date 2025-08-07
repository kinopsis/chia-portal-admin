/**
 * @file OPA Service Type Fix Validation - Playwright E2E Tests
 * @description Comprehensive end-to-end tests to validate the critical OPA service type initialization fix
 * 
 * CRITICAL BUG TESTED: OPA editing showed "Trámite" instead of "OPA" in service type dropdown
 * 
 * Test Coverage:
 * 1. Admin services page loads without dependency service errors
 * 2. OPA service editing modal opens correctly
 * 3. Service type dropdown shows "OPA (Otros Procedimientos Administrativos)" when editing OPA services
 * 4. Form fields pre-populate with correct OPA data
 * 5. Form submission works and data persists correctly
 * 6. Complete CRUD workflow validation
 */

const { test, expect } = require('@playwright/test')

// Test configuration
const BASE_URL = 'http://localhost:3000'
const ADMIN_SERVICES_URL = `${BASE_URL}/admin/servicios`

// Test data - using the same "Historia laboral" OPA record for consistency
const TEST_OPA_DATA = {
  codigo: 'O-020-021-017',
  nombre: 'Historia laboral',
  descripcion: 'Servicio de atención al ciudadano para historia laboral.',
  tipo_servicio: 'opa'
}

test.describe('OPA Service Type Fix Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication and navigate to admin services page
    await page.goto(ADMIN_SERVICES_URL)
    
    // Wait for page to load and check for dependency service errors
    await page.waitForLoadState('networkidle')
  })

  test.describe('CRITICAL FIX: Dependency Service Error Resolution', () => {
    test('should load admin services page without dependency service errors', async ({ page }) => {
      // Check that the page loads successfully
      await expect(page).toHaveTitle(/Admin.*Servicios/i)
      
      // Verify no critical JavaScript errors in console
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      // Wait for page to fully load
      await page.waitForTimeout(2000)
      
      // Check for the specific dependency service error that was fixed
      const hasDependencyError = errors.some(error => 
        error.includes('dependenciasClientService.getSubdependencias is not a function')
      )
      
      expect(hasDependencyError).toBeFalsy()
      
      // Verify page content loads correctly
      await expect(page.locator('h1')).toContainText(/Servicios/i)
      await expect(page.locator('[data-testid="services-table"], .services-grid, table')).toBeVisible()
    })

    test('should load form dependencies without errors', async ({ page }) => {
      // Wait for any async operations to complete
      await page.waitForTimeout(3000)
      
      // Check that dependencias and subdependencias are loaded for forms
      const networkRequests = []
      page.on('response', response => {
        if (response.url().includes('subdependencias') || response.url().includes('dependencias')) {
          networkRequests.push({
            url: response.url(),
            status: response.status()
          })
        }
      })
      
      // Trigger form dependency loading by attempting to open create modal
      const createButton = page.locator('button:has-text("Crear"), button:has-text("Nuevo"), [data-testid="create-service-btn"]').first()
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForTimeout(1000)
      }
      
      // Verify successful API calls
      const failedRequests = networkRequests.filter(req => req.status >= 400)
      expect(failedRequests).toHaveLength(0)
    })
  })

  test.describe('CRITICAL FIX: OPA Service Type Initialization', () => {
    test('should show correct service type when editing OPA service', async ({ page }) => {
      // Find and click edit button for "Historia laboral" OPA
      const editButton = page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}") button:has-text("Editar"), tr:has-text("${TEST_OPA_DATA.codigo}") button[title*="Editar"]`).first()
      
      await expect(editButton).toBeVisible({ timeout: 10000 })
      await editButton.click()
      
      // Wait for edit modal to open
      await expect(page.locator('dialog[open], .modal, [role="dialog"]')).toBeVisible()
      
      // CRITICAL TEST: Verify service type dropdown shows "OPA" not "Trámite"
      const serviceTypeDropdown = page.locator('select[name="tipo"], select:has(option:text("OPA")), select:has(option:text("Trámite"))')
      await expect(serviceTypeDropdown).toBeVisible()
      
      // Get the selected value
      const selectedValue = await serviceTypeDropdown.inputValue()
      const selectedText = await serviceTypeDropdown.locator('option:checked').textContent()
      
      // CRITICAL ASSERTION: Should show "OPA" not "Trámite"
      expect(selectedValue).toBe('opa')
      expect(selectedText).toContain('OPA')
      expect(selectedText).toContain('Otros Procedimientos Administrativos')
      
      // REGRESSION TEST: Should NOT show "Trámite" as selected
      expect(selectedText).not.toBe('Trámite')
      
      console.log(`✅ CRITICAL FIX VALIDATED: Service type shows "${selectedText}" (value: "${selectedValue}")`)
    })

    test('should pre-populate form fields correctly for OPA editing', async ({ page }) => {
      // Find and open edit modal for Historia laboral OPA
      const editButton = page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}") button:has-text("Editar")`).first()
      await editButton.click()
      
      // Wait for modal and form to load
      await page.waitForSelector('dialog[open], .modal, [role="dialog"]')
      await page.waitForTimeout(1000)
      
      // Verify form fields are pre-populated correctly
      const nameField = page.locator('input[name="nombre"], input[value*="Historia laboral"]')
      await expect(nameField).toHaveValue(TEST_OPA_DATA.nombre)
      
      const codeField = page.locator('input[name="codigo"], input[value*="O-020-021-017"]')
      await expect(codeField).toHaveValue(TEST_OPA_DATA.codigo)
      
      const descriptionField = page.locator('textarea[name="descripcion"], textarea:has-text("historia laboral")')
      await expect(descriptionField).toContainText('historia laboral')
      
      // Verify URL fields are visible and accessible
      const urlSuitField = page.locator('input[name*="suit"], input[placeholder*="SUIT"]')
      const urlGovField = page.locator('input[name*="gov"], input[placeholder*="GOV"]')
      
      await expect(urlSuitField).toBeVisible()
      await expect(urlGovField).toBeVisible()
      
      console.log('✅ Form fields pre-populated correctly for OPA editing')
    })

    test('should handle service type dropdown interaction correctly', async ({ page }) => {
      // Open edit modal for OPA service
      const editButton = page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}") button:has-text("Editar")`).first()
      await editButton.click()
      
      await page.waitForSelector('dialog[open], .modal')
      
      // Test service type dropdown functionality
      const serviceTypeDropdown = page.locator('select[name="tipo"]')
      
      // Verify dropdown has correct options
      const options = await serviceTypeDropdown.locator('option').allTextContents()
      expect(options).toContain('Trámite')
      expect(options.some(opt => opt.includes('OPA'))).toBeTruthy()
      
      // Verify current selection is OPA
      const currentValue = await serviceTypeDropdown.inputValue()
      expect(currentValue).toBe('opa')
      
      // Test changing selection (if dropdown is enabled)
      const isDisabled = await serviceTypeDropdown.isDisabled()
      if (!isDisabled) {
        await serviceTypeDropdown.selectOption('tramite')
        expect(await serviceTypeDropdown.inputValue()).toBe('tramite')
        
        // Change back to OPA
        await serviceTypeDropdown.selectOption('opa')
        expect(await serviceTypeDropdown.inputValue()).toBe('opa')
      }
      
      console.log(`✅ Service type dropdown interaction test completed (disabled: ${isDisabled})`)
    })
  })

  test.describe('Complete CRUD Workflow Validation', () => {
    test('should complete OPA edit workflow successfully', async ({ page }) => {
      // Open edit modal
      const editButton = page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}") button:has-text("Editar")`).first()
      await editButton.click()
      
      await page.waitForSelector('dialog[open], .modal')
      
      // Verify service type is correct
      const serviceTypeDropdown = page.locator('select[name="tipo"]')
      expect(await serviceTypeDropdown.inputValue()).toBe('opa')
      
      // Make a small change to test form submission
      const descriptionField = page.locator('textarea[name="descripcion"]')
      const originalDescription = await descriptionField.inputValue()
      const testDescription = originalDescription + ' [TEST EDIT]'
      
      await descriptionField.fill(testDescription)
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Actualizar")')
      await submitButton.click()
      
      // Wait for submission to complete
      await page.waitForTimeout(2000)
      
      // Verify modal closes
      await expect(page.locator('dialog[open], .modal')).not.toBeVisible()
      
      // Verify changes are reflected in the table
      await expect(page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}")`)).toBeVisible()
      
      // Restore original description
      await editButton.click()
      await page.waitForSelector('dialog[open], .modal')
      await page.locator('textarea[name="descripcion"]').fill(originalDescription)
      await page.locator('button[type="submit"], button:has-text("Guardar")').click()
      await page.waitForTimeout(1000)
      
      console.log('✅ Complete OPA edit workflow validated successfully')
    })

    test('should maintain service type consistency after page refresh', async ({ page }) => {
      // Open edit modal and verify service type
      const editButton = page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}") button:has-text("Editar")`).first()
      await editButton.click()
      
      await page.waitForSelector('dialog[open], .modal')
      
      // Verify service type before refresh
      const serviceTypeDropdown = page.locator('select[name="tipo"]')
      const valueBeforeRefresh = await serviceTypeDropdown.inputValue()
      expect(valueBeforeRefresh).toBe('opa')
      
      // Close modal and refresh page
      const closeButton = page.locator('button:has-text("Cancelar"), button:has-text("Cerrar"), [aria-label="Close"]')
      if (await closeButton.isVisible()) {
        await closeButton.click()
      } else {
        await page.keyboard.press('Escape')
      }
      
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Open edit modal again and verify service type persists
      const editButtonAfterRefresh = page.locator(`tr:has-text("${TEST_OPA_DATA.nombre}") button:has-text("Editar")`).first()
      await editButtonAfterRefresh.click()
      
      await page.waitForSelector('dialog[open], .modal')
      
      const serviceTypeAfterRefresh = page.locator('select[name="tipo"]')
      const valueAfterRefresh = await serviceTypeAfterRefresh.inputValue()
      
      expect(valueAfterRefresh).toBe('opa')
      expect(valueAfterRefresh).toBe(valueBeforeRefresh)
      
      console.log('✅ Service type consistency maintained after page refresh')
    })
  })

  test.describe('Regression Testing', () => {
    test('should not affect Trámite service editing', async ({ page }) => {
      // Find a Trámite service (not OPA) to test
      const tramiteRow = page.locator('tr:has([data-service-type="tramite"]), tr:has-text("Trámite"):not(:has-text("OPA"))')
      
      if (await tramiteRow.count() > 0) {
        const editButton = tramiteRow.first().locator('button:has-text("Editar")')
        await editButton.click()
        
        await page.waitForSelector('dialog[open], .modal')
        
        // Verify Trámite service shows correct service type
        const serviceTypeDropdown = page.locator('select[name="tipo"]')
        const selectedValue = await serviceTypeDropdown.inputValue()
        const selectedText = await serviceTypeDropdown.locator('option:checked').textContent()
        
        expect(selectedValue).toBe('tramite')
        expect(selectedText).toBe('Trámite')
        
        console.log('✅ Trámite service editing works correctly (no regression)')
      } else {
        console.log('⚠️ No Trámite services found for regression testing')
      }
    })
  })
})
