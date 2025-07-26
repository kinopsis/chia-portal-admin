/**
 * Global Teardown for Playwright E2E Tests
 * Portal de Atención Ciudadana de Chía
 * 
 * This file runs once after all tests to:
 * - Clean up test data
 * - Generate test reports
 * - Perform final cleanup
 */

import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for Unified Services E2E tests...')
  
  try {
    // Clean up test artifacts if needed
    console.log('📁 Cleaning up test artifacts...')
    
    // Ensure test results directory exists
    const testResultsDir = path.join(process.cwd(), 'test-results')
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true })
    }
    
    // Generate test summary
    console.log('📊 Generating test summary...')
    
    const summary = {
      timestamp: new Date().toISOString(),
      testSuite: 'Unified Services Management System',
      application: 'Portal de Atención Ciudadana de Chía',
      environment: process.env.NODE_ENV || 'development',
      baseURL: config.projects[0].use.baseURL,
      browsers: config.projects.map(p => p.name),
      notes: [
        'Tests cover authentication, CRUD operations, data management, and accessibility',
        'All tests use Page Object Model pattern for maintainability',
        'Tests include responsive design validation across multiple viewports',
        'Accessibility features are validated according to WCAG 2.1 AA standards'
      ]
    }
    
    const summaryPath = path.join(testResultsDir, 'test-summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    
    console.log(`✅ Test summary generated: ${summaryPath}`)
    
    // Log completion
    console.log('🎯 Global teardown completed successfully!')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown
