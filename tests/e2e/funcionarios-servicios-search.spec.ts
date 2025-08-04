/**
 * Pruebas E2E para Funcionalidad de Búsqueda en /funcionarios/servicios
 * Valida las correcciones implementadas después de la sincronización completa
 */

import { test, expect, Page } from '@playwright/test'

// Configuración de timeouts para elementos que pueden tardar en cargar
const SEARCH_TIMEOUT = 10000
const LOAD_TIMEOUT = 15000

// Función helper para esperar a que la búsqueda se complete
async function waitForSearchResults(page: Page, expectedMinResults: number = 0) {
  // Esperar a que desaparezca el loading
  await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: SEARCH_TIMEOUT })
  
  // Si esperamos resultados, esperar a que aparezcan
  if (expectedMinResults > 0) {
    await page.waitForFunction(
      (minResults) => {
        const cards = document.querySelectorAll('[data-testid="service-card"]')
        return cards.length >= minResults
      },
      expectedMinResults,
      { timeout: SEARCH_TIMEOUT }
    )
  }
  
  // Pequeña pausa para estabilizar la UI
  await page.waitForTimeout(500)
}

// Función helper para realizar búsqueda
async function performSearch(page: Page, searchTerm: string) {
  const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Buscar"], input[type="search"]').first()
  
  // Limpiar campo de búsqueda
  await searchInput.clear()
  
  // Escribir término de búsqueda
  await searchInput.fill(searchTerm)
  
  // Presionar Enter o esperar a que se active la búsqueda automática
  await searchInput.press('Enter')
  
  // Esperar a que se procese la búsqueda
  await page.waitForTimeout(1000)
}

// Función helper para contar tarjetas de servicios
async function countServiceCards(page: Page): Promise<number> {
  const cards = await page.locator('[data-testid="service-card"], .service-card, [class*="card"]').count()
  return cards
}

// Función helper para obtener información de las tarjetas
async function getServiceCardsInfo(page: Page) {
  const cards = await page.locator('[data-testid="service-card"], .service-card, [class*="card"]').all()
  const cardsInfo = []
  
  for (const card of cards) {
    try {
      const title = await card.locator('h3, h4, [class*="title"], [class*="nombre"]').first().textContent()
      const code = await card.locator('[class*="badge"], [class*="codigo"], code').first().textContent()
      const type = await card.locator('[class*="badge"]').first().textContent()
      
      cardsInfo.push({
        title: title?.trim() || '',
        code: code?.trim() || '',
        type: type?.trim() || ''
      })
    } catch (error) {
      // Si no se puede extraer info de una tarjeta, continuar
      console.warn('No se pudo extraer info de tarjeta:', error)
    }
  }
  
  return cardsInfo
}

test.describe('Búsqueda en /funcionarios/servicios', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de servicios
    await page.goto('/funcionarios/servicios')
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle')
    
    // Esperar a que aparezcan los servicios iniciales
    await page.waitForTimeout(2000)
  })

  test('Caso 1: Búsqueda "certificado residencia" debe mostrar exactamente 2 resultados', async ({ page }) => {
    console.log('🔍 Probando búsqueda: "certificado residencia"')
    
    // Realizar búsqueda
    await performSearch(page, 'certificado residencia')
    
    // Esperar resultados
    await waitForSearchResults(page, 2)
    
    // Contar tarjetas de resultados
    const resultCount = await countServiceCards(page)
    
    // Verificar que hay exactamente 2 resultados
    expect(resultCount).toBe(2)
    
    // Obtener información de las tarjetas
    const cardsInfo = await getServiceCardsInfo(page)
    
    // Verificar que ambos servicios son "Certificado de residencia"
    const certificadoCards = cardsInfo.filter(card => 
      card.title.toLowerCase().includes('certificado') && 
      card.title.toLowerCase().includes('residencia')
    )
    
    expect(certificadoCards.length).toBe(2)
    
    // Verificar que hay un trámite y una OPA
    const tramiteCard = cardsInfo.find(card => card.type.includes('TRÁMITE'))
    const opaCard = cardsInfo.find(card => card.type.includes('OPA'))
    
    expect(tramiteCard).toBeDefined()
    expect(opaCard).toBeDefined()
    
    // Verificar que los códigos se muestran sin prefijos (000-001-001, no T-000-001-001)
    const codesWithoutPrefix = cardsInfo.every(card => 
      !card.code.startsWith('T-') && !card.code.startsWith('O-')
    )
    expect(codesWithoutPrefix).toBe(true)
    
    console.log('✅ Búsqueda "certificado residencia" exitosa:', cardsInfo)
  })

  test('Caso 2: Búsqueda por código original "000-001-001" debe encontrar ambos servicios', async ({ page }) => {
    console.log('🔍 Probando búsqueda por código: "000-001-001"')
    
    // Realizar búsqueda
    await performSearch(page, '000-001-001')
    
    // Esperar resultados
    await waitForSearchResults(page, 2)
    
    // Contar tarjetas de resultados
    const resultCount = await countServiceCards(page)
    
    // Verificar que hay exactamente 2 resultados
    expect(resultCount).toBe(2)
    
    // Obtener información de las tarjetas
    const cardsInfo = await getServiceCardsInfo(page)
    
    // Verificar que ambos tienen el código 000-001-001
    const correctCodes = cardsInfo.filter(card => 
      card.code.includes('000-001-001')
    )
    
    expect(correctCodes.length).toBe(2)
    
    console.log('✅ Búsqueda por código "000-001-001" exitosa:', cardsInfo)
  })

  test('Caso 3: Búsqueda parcial "certificado" debe mostrar todos los certificados', async ({ page }) => {
    console.log('🔍 Probando búsqueda parcial: "certificado"')
    
    // Realizar búsqueda
    await performSearch(page, 'certificado')
    
    // Esperar resultados (al menos 2, pero pueden ser más)
    await waitForSearchResults(page, 2)
    
    // Contar tarjetas de resultados
    const resultCount = await countServiceCards(page)
    
    // Verificar que hay al menos 2 resultados
    expect(resultCount).toBeGreaterThanOrEqual(2)
    
    // Obtener información de las tarjetas
    const cardsInfo = await getServiceCardsInfo(page)
    
    // Verificar que todos los resultados contienen "certificado"
    const allContainCertificado = cardsInfo.every(card => 
      card.title.toLowerCase().includes('certificado')
    )
    
    expect(allContainCertificado).toBe(true)
    
    console.log(`✅ Búsqueda "certificado" encontró ${resultCount} servicios:`, cardsInfo)
  })

  test('Caso 4: Verificar que NO aparezcan mensajes duplicados "No hay servicios"', async ({ page }) => {
    console.log('🔍 Verificando mensajes duplicados con búsqueda sin resultados')
    
    // Realizar búsqueda que no debería tener resultados
    await performSearch(page, 'xyz123noexiste')
    
    // Esperar a que se procese la búsqueda
    await waitForSearchResults(page, 0)
    
    // Buscar todos los mensajes "No hay servicios"
    const noServicesMessages = await page.locator('text="No hay servicios"').count()
    
    // Verificar que hay exactamente 1 mensaje (no duplicado)
    expect(noServicesMessages).toBeLessThanOrEqual(1)
    
    // Si hay mensaje, verificar que es visible
    if (noServicesMessages === 1) {
      const message = page.locator('text="No hay servicios"').first()
      await expect(message).toBeVisible()
    }
    
    console.log(`✅ Mensajes "No hay servicios": ${noServicesMessages} (correcto, no duplicado)`)
  })

  test('Caso 5: Búsqueda sin resultados debe mostrar un solo mensaje "No hay servicios"', async ({ page }) => {
    console.log('🔍 Probando búsqueda sin resultados')
    
    // Realizar búsqueda que definitivamente no tiene resultados
    await performSearch(page, 'servicio_inexistente_xyz_123')
    
    // Esperar a que se procese la búsqueda
    await waitForSearchResults(page, 0)
    
    // Verificar que no hay tarjetas de servicios
    const resultCount = await countServiceCards(page)
    expect(resultCount).toBe(0)
    
    // Verificar que hay exactamente 1 mensaje "No hay servicios"
    const noServicesMessages = await page.locator('text="No hay servicios"').count()
    expect(noServicesMessages).toBe(1)
    
    // Verificar que el mensaje es visible
    const message = page.locator('text="No hay servicios"').first()
    await expect(message).toBeVisible()
    
    console.log('✅ Búsqueda sin resultados muestra mensaje único correctamente')
  })

  test('Caso 6: Búsqueda con prefijos T- y O- debe funcionar', async ({ page }) => {
    console.log('🔍 Probando búsqueda con prefijos')
    
    // Probar búsqueda con prefijo T-
    await performSearch(page, 'T-000-001-001')
    await waitForSearchResults(page, 1)
    
    let resultCount = await countServiceCards(page)
    expect(resultCount).toBe(1)
    
    let cardsInfo = await getServiceCardsInfo(page)
    expect(cardsInfo[0].type).toContain('TRÁMITE')
    
    // Probar búsqueda con prefijo O-
    await performSearch(page, 'O-000-001-001')
    await waitForSearchResults(page, 1)
    
    resultCount = await countServiceCards(page)
    expect(resultCount).toBe(1)
    
    cardsInfo = await getServiceCardsInfo(page)
    expect(cardsInfo[0].type).toContain('OPA')
    
    console.log('✅ Búsqueda con prefijos T- y O- funciona correctamente')
  })

  test('Caso 7: Verificar que los códigos se muestren sin prefijos en la UI', async ({ page }) => {
    console.log('🔍 Verificando visualización de códigos sin prefijos')
    
    // Realizar búsqueda que sabemos que tiene resultados
    await performSearch(page, 'certificado residencia')
    await waitForSearchResults(page, 2)
    
    // Obtener información de las tarjetas
    const cardsInfo = await getServiceCardsInfo(page)
    
    // Verificar que ningún código mostrado tiene prefijos T- o O-
    const hasPrefix = cardsInfo.some(card => 
      card.code.startsWith('T-') || card.code.startsWith('O-')
    )
    
    expect(hasPrefix).toBe(false)
    
    // Verificar que los códigos mostrados son del formato esperado (XXX-XXX-XXX)
    const validCodeFormat = cardsInfo.every(card => 
      /^\d{3}-\d{3}-\d{3}$/.test(card.code.replace(/[^\d-]/g, ''))
    )
    
    expect(validCodeFormat).toBe(true)
    
    console.log('✅ Códigos se muestran sin prefijos correctamente:', cardsInfo.map(c => c.code))
  })
})

// Test de configuración y diagnóstico
test.describe('Diagnóstico de la página', () => {
  test('Verificar que la página carga correctamente', async ({ page }) => {
    await page.goto('/funcionarios/servicios')
    
    // Verificar que el título de la página es correcto
    await expect(page).toHaveTitle(/Servicios|Funcionarios/)
    
    // Verificar que hay elementos de búsqueda
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first()
    await expect(searchInput).toBeVisible()
    
    // Verificar que se cargan servicios inicialmente
    await page.waitForTimeout(3000)
    const initialCount = await countServiceCards(page)
    
    console.log(`📊 Página cargada con ${initialCount} servicios iniciales`)
    expect(initialCount).toBeGreaterThan(0)
  })
})
