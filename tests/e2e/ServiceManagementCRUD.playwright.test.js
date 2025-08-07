/**
 * End-to-End Tests for Service Management CRUD Operations
 * 
 * This test suite validates the complete CRUD workflow for OPAs and Trámites
 * on both /admin/servicios and /funcionarios/servicios pages using Playwright.
 * 
 * Test Coverage:
 * - Create new OPA through management interface
 * - Edit OPA (including testing "instrucciones" field)
 * - Delete OPA and confirm removal
 * - Verify compact card layout and management actions
 * - Test data persistence in database
 * - Validate loading states, success messages, and error handling
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  adminCredentials: {
    email: 'admin@chia.gov.co',
    password: 'admin123'
  },
  funcionarioCredentials: {
    email: 'funcionario@chia.gov.co', 
    password: 'funcionario123'
  },
  testOPA: {
    nombre: 'Test OPA E2E Playwright',
    descripcion: 'OPA creada para pruebas E2E con Playwright',
    codigo: 'E2E-OPA-001',
    tiempo_respuesta: '2 días hábiles',
    categoria: 'atencion_ciudadana',
    requisitos: ['Documento de identidad', 'Formulario diligenciado'],
    instrucciones: ['Dirigirse a ventanilla única', 'Presentar documentos originales']
  }
};

// Helper functions
async function loginUser(page, credentials) {
  await page.goto(`${TEST_CONFIG.baseURL}/auth/login`);
  
  // Fill login form
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  
  // Submit login
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeout });
}

async function navigateToServicesPage(page, userType) {
  const url = `${TEST_CONFIG.baseURL}/${userType}/servicios`;
  await page.goto(url);
  
  // Wait for page to load
  await page.waitForSelector('[data-testid*="services-grid"]', { timeout: TEST_CONFIG.timeout });
  
  // Verify page loaded correctly
  await expect(page.locator('h1')).toContainText('Gestión de Servicios');
}

async function createOPA(page) {
  // Click create new service button
  await page.click('button:has-text("Crear Nuevo Servicio")');
  
  // Wait for modal to open
  await page.waitForSelector('[role="dialog"]');
  
  // Fill form fields
  await page.selectOption('select[name="tipo"]', 'opa');
  await page.fill('input[name="nombre"]', TEST_CONFIG.testOPA.nombre);
  await page.fill('textarea[name="descripcion"]', TEST_CONFIG.testOPA.descripcion);
  await page.fill('input[name="codigo"]', TEST_CONFIG.testOPA.codigo);
  await page.fill('input[name="tiempo_respuesta"]', TEST_CONFIG.testOPA.tiempo_respuesta);
  await page.selectOption('select[name="categoria"]', TEST_CONFIG.testOPA.categoria);
  
  // Add requisitos
  for (const requisito of TEST_CONFIG.testOPA.requisitos) {
    await page.fill('input[placeholder*="requisito"]', requisito);
    await page.click('button:has-text("Agregar")');
  }
  
  // Add instrucciones (testing the recently fixed field)
  for (const instruccion of TEST_CONFIG.testOPA.instrucciones) {
    await page.fill('input[placeholder*="instrucción"]', instruccion);
    await page.click('button:has-text("Agregar")');
  }
  
  // Submit form
  await page.click('button[type="submit"]:has-text("Crear")');
  
  // Wait for success message
  await page.waitForSelector('.success-message, .toast-success', { timeout: TEST_CONFIG.timeout });
  
  // Verify OPA appears in list
  await expect(page.locator(`text=${TEST_CONFIG.testOPA.nombre}`)).toBeVisible();
}

async function editOPA(page) {
  // Find the test OPA card
  const opaCard = page.locator(`[data-testid*="service-card"]:has-text("${TEST_CONFIG.testOPA.nombre}")`);
  await expect(opaCard).toBeVisible();
  
  // Click edit button
  await opaCard.locator('button:has-text("Editar")').click();
  
  // Wait for edit modal
  await page.waitForSelector('[role="dialog"]:has-text("Editar")');
  
  // Verify instrucciones field is present and populated
  const instruccionesSection = page.locator('text=Instrucciones').locator('..');
  await expect(instruccionesSection).toBeVisible();
  
  // Verify existing instrucciones are loaded
  for (const instruccion of TEST_CONFIG.testOPA.instrucciones) {
    await expect(page.locator(`text=${instruccion}`)).toBeVisible();
  }
  
  // Add new instruction to test the field
  const newInstruccion = 'Nueva instrucción agregada en edición';
  await page.fill('input[placeholder*="instrucción"]', newInstruccion);
  await page.click('button:has-text("Agregar")');
  
  // Modify description
  const updatedDescription = TEST_CONFIG.testOPA.descripcion + ' - EDITADA';
  await page.fill('textarea[name="descripcion"]', updatedDescription);
  
  // Submit changes
  await page.click('button[type="submit"]:has-text("Guardar")');
  
  // Wait for success message
  await page.waitForSelector('.success-message, .toast-success', { timeout: TEST_CONFIG.timeout });
  
  // Verify changes are reflected
  await expect(page.locator(`text=${updatedDescription}`)).toBeVisible();
}

async function deleteOPA(page) {
  // Find the test OPA card
  const opaCard = page.locator(`[data-testid*="service-card"]:has-text("${TEST_CONFIG.testOPA.nombre}")`);
  await expect(opaCard).toBeVisible();
  
  // Click delete button
  await opaCard.locator('button:has-text("Eliminar")').click();
  
  // Wait for confirmation dialog
  await page.waitForSelector('[role="dialog"]:has-text("¿Estás seguro")');
  
  // Confirm deletion
  await page.click('button:has-text("Eliminar"):not([disabled])');
  
  // Wait for success message
  await page.waitForSelector('.success-message, .toast-success', { timeout: TEST_CONFIG.timeout });
  
  // Verify OPA is removed from list
  await expect(page.locator(`text=${TEST_CONFIG.testOPA.nombre}`)).not.toBeVisible();
}

async function validateCompactLayout(page) {
  // Verify cards have compact layout
  const serviceCards = page.locator('[data-testid*="service-card"]');
  await expect(serviceCards.first()).toBeVisible();
  
  // Check that management actions are visible
  await expect(page.locator('button:has-text("Editar")')).toBeVisible();
  await expect(page.locator('button:has-text("Eliminar")')).toBeVisible();
  
  // Verify compact spacing (cards should be shorter)
  const cardHeight = await serviceCards.first().boundingBox();
  expect(cardHeight.height).toBeLessThan(150); // Compact cards should be under 150px
}

// Test suites
test.describe('Service Management CRUD - Admin Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_CONFIG.adminCredentials);
    await navigateToServicesPage(page, 'admin');
  });

  test('Complete CRUD workflow for OPA', async ({ page }) => {
    // Test compact layout
    await validateCompactLayout(page);
    
    // Create OPA
    await createOPA(page);
    
    // Edit OPA (including instrucciones field)
    await editOPA(page);
    
    // Delete OPA
    await deleteOPA(page);
  });

  test('Verify loading states and error handling', async ({ page }) => {
    // Test loading states during operations
    await page.click('button:has-text("Crear Nuevo Servicio")');
    await page.waitForSelector('[role="dialog"]');
    
    // Submit empty form to test validation
    await page.click('button[type="submit"]:has-text("Crear")');
    
    // Verify error messages appear
    await expect(page.locator('.error-message, .field-error')).toBeVisible();
  });
});

test.describe('Service Management CRUD - Funcionarios Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, TEST_CONFIG.funcionarioCredentials);
    await navigateToServicesPage(page, 'funcionarios');
  });

  test('Complete CRUD workflow for OPA', async ({ page }) => {
    // Test compact layout
    await validateCompactLayout(page);
    
    // Create OPA
    await createOPA(page);
    
    // Edit OPA (including instrucciones field)
    await editOPA(page);
    
    // Delete OPA
    await deleteOPA(page);
  });

  test('Verify data persistence across page reloads', async ({ page }) => {
    // Create OPA
    await createOPA(page);
    
    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid*="services-grid"]');
    
    // Verify OPA still exists
    await expect(page.locator(`text=${TEST_CONFIG.testOPA.nombre}`)).toBeVisible();
    
    // Clean up
    await deleteOPA(page);
  });
});

test.describe('Cross-Page Parity Validation', () => {
  test('Both pages have identical functionality', async ({ page }) => {
    // Test admin page
    await loginUser(page, TEST_CONFIG.adminCredentials);
    await navigateToServicesPage(page, 'admin');
    
    const adminFeatures = {
      hasCreateButton: await page.locator('button:has-text("Crear")').isVisible(),
      hasEditButtons: await page.locator('button:has-text("Editar")').count(),
      hasDeleteButtons: await page.locator('button:has-text("Eliminar")').count(),
      hasFilters: await page.locator('[data-testid*="filters"]').isVisible()
    };
    
    // Test funcionarios page
    await loginUser(page, TEST_CONFIG.funcionarioCredentials);
    await navigateToServicesPage(page, 'funcionarios');
    
    const funcionariosFeatures = {
      hasCreateButton: await page.locator('button:has-text("Crear")').isVisible(),
      hasEditButtons: await page.locator('button:has-text("Editar")').count(),
      hasDeleteButtons: await page.locator('button:has-text("Eliminar")').count(),
      hasFilters: await page.locator('[data-testid*="filters"]').isVisible()
    };
    
    // Verify parity
    expect(adminFeatures.hasCreateButton).toBe(funcionariosFeatures.hasCreateButton);
    expect(adminFeatures.hasEditButtons).toBe(funcionariosFeatures.hasEditButtons);
    expect(adminFeatures.hasDeleteButtons).toBe(funcionariosFeatures.hasDeleteButtons);
    expect(adminFeatures.hasFilters).toBe(funcionariosFeatures.hasFilters);
  });
});
