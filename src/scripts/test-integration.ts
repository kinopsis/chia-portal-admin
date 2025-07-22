// Comprehensive integration testing script
// Tests all backend integration functionality end-to-end

import { tramitesClientService } from '@/services/tramites'
import { opasClientService } from '@/services/opas'
import { faqsClientService } from '@/services/faqs'
import { dependenciasClientService } from '@/services/dependencias'
import { unifiedSearchService } from '@/services/unifiedSearch'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
  details?: any
}

class IntegrationTester {
  private results: TestResult[] = []

  async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🧪 Running test: ${name}`)
      const result = await testFn()
      const duration = Date.now() - startTime
      
      const testResult: TestResult = {
        name,
        passed: true,
        duration,
        details: result
      }
      
      this.results.push(testResult)
      console.log(`✅ ${name} - PASSED (${duration}ms)`)
      return testResult
      
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      const testResult: TestResult = {
        name,
        passed: false,
        error: errorMessage,
        duration
      }
      
      this.results.push(testResult)
      console.log(`❌ ${name} - FAILED (${duration}ms): ${errorMessage}`)
      return testResult
    }
  }

  async testTramitesService(): Promise<TestResult> {
    return this.runTest('Trámites Service', async () => {
      const result = await tramitesClientService.getAll({ limit: 5 })
      
      if (!result.success) {
        throw new Error('Service returned success: false')
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Data is not an array')
      }
      
      return {
        totalRecords: result.pagination.total,
        sampleRecords: result.data.length,
        hasSubdependencias: result.data.some(t => t.subdependencias),
        hasDependencias: result.data.some(t => t.subdependencias?.dependencias)
      }
    })
  }

  async testOPAsService(): Promise<TestResult> {
    return this.runTest('OPAs Service', async () => {
      const result = await opasClientService.getAll({ limit: 5 })
      
      if (!result.success) {
        throw new Error('Service returned success: false')
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Data is not an array')
      }
      
      return {
        totalRecords: result.pagination.total,
        sampleRecords: result.data.length,
        hasSubdependencias: result.data.some(o => o.subdependencias),
        hasDependencias: result.data.some(o => o.subdependencias?.dependencias)
      }
    })
  }

  async testFAQsService(): Promise<TestResult> {
    return this.runTest('FAQs Service', async () => {
      const result = await faqsClientService.getAll({ limit: 5 })
      
      if (!result.success) {
        throw new Error('Service returned success: false')
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Data is not an array')
      }
      
      return {
        totalRecords: result.pagination.total,
        sampleRecords: result.data.length,
        hasDependencias: result.data.some(f => f.dependencias),
        hasSubdependencias: result.data.some(f => f.subdependencias)
      }
    })
  }

  async testDependenciasService(): Promise<TestResult> {
    return this.runTest('Dependencias Service', async () => {
      const result = await dependenciasClientService.getAll({ 
        includeSubdependencias: true,
        includeTramites: true,
        includeOPAs: true
      })
      
      if (!result.success) {
        throw new Error('Service returned success: false')
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Data is not an array')
      }
      
      return {
        totalRecords: result.pagination.total,
        sampleRecords: result.data.length,
        hasSubdependencias: result.data.some(d => d.subdependencias && d.subdependencias.length > 0),
        hasTramites: result.data.some(d => d.tramites_count && d.tramites_count > 0),
        hasOPAs: result.data.some(d => d.opas_count && d.opas_count > 0)
      }
    })
  }

  async testUnifiedSearch(): Promise<TestResult> {
    return this.runTest('Unified Search Service', async () => {
      // Test basic search
      const searchResult = await unifiedSearchService.search({ 
        query: 'licencia',
        limit: 10 
      })
      
      if (!searchResult.success) {
        throw new Error('Search returned success: false')
      }
      
      // Test search suggestions
      const suggestions = await unifiedSearchService.getSearchSuggestions('cert', 5)
      
      // Test search stats
      const stats = await unifiedSearchService.getSearchStats()
      
      return {
        searchResults: searchResult.data.length,
        totalResults: searchResult.pagination.total,
        suggestions: suggestions.length,
        stats: {
          totalTramites: stats.totalTramites,
          totalOpas: stats.totalOpas,
          totalFaqs: stats.totalFaqs,
          totalActive: stats.totalActive
        },
        resultTypes: [...new Set(searchResult.data.map(r => r.tipo))]
      }
    })
  }

  async testMetricsAPI(): Promise<TestResult> {
    return this.runTest('Metrics API', async () => {
      const response = await fetch('/api/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API returned success: false')
      }

      const requiredFields = [
        'dependencias', 'subdependencias', 'tramites', 'opas', 'faqs',
        'usuarios', 'tramitesActivos', 'opasActivas', 'faqsActivas'
      ]

      for (const field of requiredFields) {
        if (typeof result.data[field] !== 'number') {
          throw new Error(`Missing or invalid field: ${field}`)
        }
      }

      return {
        metrics: result.data,
        timestamp: result.timestamp,
        responseTime: Date.now() - Date.parse(result.timestamp)
      }
    })
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive integration tests...\n')

    // Run all service tests
    await this.testTramitesService()
    await this.testOPAsService()
    await this.testFAQsService()
    await this.testDependenciasService()
    await this.testUnifiedSearch()
    await this.testMetricsAPI()

    // Generate summary
    this.generateSummary()
  }

  generateSummary(): void {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)

    console.log('\n📊 TEST SUMMARY')
    console.log('================')
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏱️  Total Duration: ${totalDuration}ms`)
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error}`)
        })
    }

    if (passed === this.results.length) {
      console.log('\n🎉 ALL TESTS PASSED! Backend integration is working correctly.')
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.')
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new IntegrationTester()
  tester.runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error)
    process.exit(1)
  })
}

export { IntegrationTester }
export default IntegrationTester
