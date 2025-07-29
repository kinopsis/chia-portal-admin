/**
 * Global Setup for Playwright E2E Tests
 * Portal de Atención Ciudadana de Chía
 * 
 * This file runs once before all tests to:
 * - Verify the application is running
 * - Set up test data if needed
 * - Configure global test environment
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Unified Services E2E tests...')
  
  const { baseURL } = config.projects[0].use
  
  if (!baseURL) {
    throw new Error('Base URL is not configured')
  }
  
  // Launch browser to verify application is accessible
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    console.log(`📡 Checking if application is running at ${baseURL}...`)
    
    // Navigate to the application
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    
    // Verify the application loads correctly
    await page.waitForSelector('h1', { timeout: 30000 })
    
    console.log('✅ Application is running and accessible')
    
    // Verify login page is accessible
    console.log('🔐 Verifying authentication system...')

    await page.goto(`${baseURL}/auth/login`)
    await page.waitForSelector('form', { timeout: 10000 })

    console.log('✅ Authentication system is accessible')

    // Verify funcionario routes are protected
    console.log('👤 Verifying funcionario route protection...')
    await page.goto(`${baseURL}/funcionario`)

    // Should redirect to login if not authenticated
    await page.waitForTimeout(2000)
    const currentUrl = page.url()
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ Funcionario routes are properly protected')
    } else {
      console.warn('⚠️ Funcionario routes may not be properly protected')
    }

    // Note: Individual tests will handle login flow
    console.log('📊 Skipping unified services verification in setup (will be tested individually)')

    // Check for any critical JavaScript errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('DevTools') && !msg.text().includes('punycode')) {
        errors.push(msg.text())
      }
    })
    
    // Wait a bit to catch any immediate errors
    await page.waitForTimeout(3000)
    
    if (errors.length > 0) {
      console.warn('⚠️ JavaScript errors detected:', errors)
    } else {
      console.log('✅ No critical JavaScript errors detected')
    }
    
    console.log('🎯 Global setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
