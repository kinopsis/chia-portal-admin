// Production verification script
// Verifies all functionality is working correctly in production environment

interface VerificationResult {
  endpoint: string
  status: 'success' | 'error' | 'warning'
  responseTime: number
  details: any
  error?: string
}

class ProductionVerifier {
  private baseUrl: string
  private results: VerificationResult[] = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  async verifyEndpoint(
    endpoint: string,
    expectedStatus: number = 200,
    validator?: (data: any) => boolean
  ): Promise<VerificationResult> {
    const startTime = Date.now()
    const fullUrl = `${this.baseUrl}${endpoint}`

    try {
      console.log(`🔍 Verifying: ${fullUrl}`)

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Production-Verifier/1.0'
        }
      })

      const responseTime = Date.now() - startTime

      if (response.status !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${response.status}`)
      }

      let data: any = null
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
        
        if (validator && !validator(data)) {
          throw new Error('Response validation failed')
        }
      }

      const result: VerificationResult = {
        endpoint,
        status: 'success',
        responseTime,
        details: {
          statusCode: response.status,
          contentType,
          dataKeys: data ? Object.keys(data) : null,
          dataSize: data ? JSON.stringify(data).length : 0
        }
      }

      this.results.push(result)
      console.log(`✅ ${endpoint} - OK (${responseTime}ms)`)
      return result

    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      const result: VerificationResult = {
        endpoint,
        status: 'error',
        responseTime,
        details: {},
        error: errorMessage
      }

      this.results.push(result)
      console.log(`❌ ${endpoint} - FAILED (${responseTime}ms): ${errorMessage}`)
      return result
    }
  }

  async verifyHomepage(): Promise<VerificationResult> {
    return this.verifyEndpoint('/', 200)
  }

  async verifyMetricsAPI(): Promise<VerificationResult> {
    return this.verifyEndpoint('/api/metrics', 200, (data) => {
      return data.success === true && 
             typeof data.data === 'object' &&
             typeof data.data.dependencias === 'number' &&
             typeof data.data.tramites === 'number'
    })
  }

  async verifySearchPage(): Promise<VerificationResult> {
    return this.verifyEndpoint('/tramites', 200)
  }

  async verifyDependenciasPage(): Promise<VerificationResult> {
    return this.verifyEndpoint('/dependencias', 200)
  }

  async verifyFAQsPage(): Promise<VerificationResult> {
    return this.verifyEndpoint('/faqs', 200)
  }

  async verifyPQRSPage(): Promise<VerificationResult> {
    return this.verifyEndpoint('/pqrs', 200)
  }

  async verifyPerformance(): Promise<void> {
    console.log('\n⚡ Performance Analysis')
    console.log('======================')

    const performanceResults = this.results.filter(r => r.status === 'success')
    
    if (performanceResults.length === 0) {
      console.log('❌ No successful requests to analyze')
      return
    }

    const avgResponseTime = performanceResults.reduce((sum, r) => sum + r.responseTime, 0) / performanceResults.length
    const maxResponseTime = Math.max(...performanceResults.map(r => r.responseTime))
    const minResponseTime = Math.min(...performanceResults.map(r => r.responseTime))

    console.log(`📊 Average Response Time: ${avgResponseTime.toFixed(0)}ms`)
    console.log(`🚀 Fastest Response: ${minResponseTime}ms`)
    console.log(`🐌 Slowest Response: ${maxResponseTime}ms`)

    // Performance warnings
    if (avgResponseTime > 3000) {
      console.log('⚠️  WARNING: Average response time is high (>3s)')
    } else if (avgResponseTime > 1000) {
      console.log('⚠️  NOTICE: Average response time is moderate (>1s)')
    } else {
      console.log('✅ Performance looks good!')
    }
  }

  async verifySSL(): Promise<void> {
    console.log('\n🔒 SSL/HTTPS Verification')
    console.log('=========================')

    if (this.baseUrl.startsWith('https://')) {
      console.log('✅ HTTPS enabled')
      
      try {
        // Test SSL certificate
        const response = await fetch(this.baseUrl, { method: 'HEAD' })
        console.log('✅ SSL certificate valid')
      } catch (error) {
        console.log('❌ SSL certificate issue:', error)
      }
    } else {
      console.log('⚠️  WARNING: Not using HTTPS')
    }
  }

  async verifySEO(): Promise<void> {
    console.log('\n🔍 SEO Verification')
    console.log('===================')

    try {
      const response = await fetch(this.baseUrl)
      const html = await response.text()

      // Check for basic SEO elements
      const hasTitle = html.includes('<title>')
      const hasMetaDescription = html.includes('name="description"')
      const hasMetaViewport = html.includes('name="viewport"')
      const hasLangAttribute = html.includes('lang=')

      console.log(`${hasTitle ? '✅' : '❌'} Title tag present`)
      console.log(`${hasMetaDescription ? '✅' : '❌'} Meta description present`)
      console.log(`${hasMetaViewport ? '✅' : '❌'} Viewport meta tag present`)
      console.log(`${hasLangAttribute ? '✅' : '❌'} Language attribute present`)

    } catch (error) {
      console.log('❌ SEO verification failed:', error)
    }
  }

  async runFullVerification(): Promise<void> {
    console.log(`🚀 Starting production verification for: ${this.baseUrl}\n`)

    // Core functionality tests
    await this.verifyHomepage()
    await this.verifyMetricsAPI()
    await this.verifySearchPage()
    await this.verifyDependenciasPage()
    await this.verifyFAQsPage()
    await this.verifyPQRSPage()

    // Additional checks
    await this.verifyPerformance()
    await this.verifySSL()
    await this.verifySEO()

    // Generate final summary
    this.generateSummary()
  }

  generateSummary(): void {
    const successful = this.results.filter(r => r.status === 'success').length
    const failed = this.results.filter(r => r.status === 'error').length
    const warnings = this.results.filter(r => r.status === 'warning').length

    console.log('\n📋 VERIFICATION SUMMARY')
    console.log('========================')
    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`📈 Success Rate: ${((successful / this.results.length) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ FAILED VERIFICATIONS:')
      this.results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`   - ${r.endpoint}: ${r.error}`)
        })
    }

    if (successful === this.results.length) {
      console.log('\n🎉 ALL VERIFICATIONS PASSED!')
      console.log('Your production deployment is working correctly.')
    } else {
      console.log('\n⚠️  Some verifications failed.')
      console.log('Please review the issues above before going live.')
    }

    console.log('\n📊 Detailed Results:')
    this.results.forEach(r => {
      const status = r.status === 'success' ? '✅' : r.status === 'warning' ? '⚠️' : '❌'
      console.log(`   ${status} ${r.endpoint} (${r.responseTime}ms)`)
    })
  }
}

// CLI usage
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000'
  
  if (!baseUrl.startsWith('http')) {
    console.error('❌ Please provide a valid URL (including http:// or https://)')
    console.log('Usage: npm run verify-production https://your-domain.com')
    process.exit(1)
  }

  const verifier = new ProductionVerifier(baseUrl)
  verifier.runFullVerification().catch(error => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })
}

export { ProductionVerifier }
export default ProductionVerifier
