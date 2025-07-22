// Comprehensive test runner for all backend integration functionality
// Runs all tests and generates detailed report

import { spawn } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'

interface TestSuite {
  name: string
  command: string
  args: string[]
  timeout: number
  critical: boolean
}

interface TestResult {
  suite: string
  passed: boolean
  duration: number
  output: string
  error?: string
}

class ComprehensiveTestRunner {
  private results: TestResult[] = []
  private startTime: number = 0

  private testSuites: TestSuite[] = [
    {
      name: 'TypeScript Type Check',
      command: 'npm',
      args: ['run', 'type-check'],
      timeout: 60000,
      critical: true
    },
    {
      name: 'ESLint Code Quality',
      command: 'npm',
      args: ['run', 'lint'],
      timeout: 30000,
      critical: true
    },
    {
      name: 'Unit Tests',
      command: 'npm',
      args: ['run', 'test', '--', '--passWithNoTests'],
      timeout: 120000,
      critical: true
    },
    {
      name: 'Integration Tests',
      command: 'npm',
      args: ['run', 'test:integration'],
      timeout: 180000,
      critical: true
    },
    {
      name: 'Build Verification',
      command: 'npm',
      args: ['run', 'build'],
      timeout: 300000,
      critical: true
    },
    {
      name: 'Database Verification',
      command: 'npm',
      args: ['run', 'verify-database'],
      timeout: 60000,
      critical: false
    }
  ]

  async runTestSuite(suite: TestSuite): Promise<TestResult> {
    const startTime = Date.now()
    
    console.log(`🧪 Running: ${suite.name}`)
    
    return new Promise((resolve) => {
      let output = ''
      let errorOutput = ''

      const process = spawn(suite.command, suite.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        timeout: suite.timeout
      })

      process.stdout?.on('data', (data) => {
        output += data.toString()
      })

      process.stderr?.on('data', (data) => {
        errorOutput += data.toString()
      })

      process.on('close', (code) => {
        const duration = Date.now() - startTime
        const passed = code === 0

        const result: TestResult = {
          suite: suite.name,
          passed,
          duration,
          output: output + errorOutput,
          error: passed ? undefined : `Exit code: ${code}`
        }

        if (passed) {
          console.log(`✅ ${suite.name} - PASSED (${duration}ms)`)
        } else {
          console.log(`❌ ${suite.name} - FAILED (${duration}ms)`)
          if (suite.critical) {
            console.log(`🚨 CRITICAL FAILURE: ${suite.name}`)
          }
        }

        resolve(result)
      })

      process.on('error', (error) => {
        const duration = Date.now() - startTime
        const result: TestResult = {
          suite: suite.name,
          passed: false,
          duration,
          output: errorOutput,
          error: error.message
        }

        console.log(`💥 ${suite.name} - ERROR (${duration}ms): ${error.message}`)
        resolve(result)
      })

      // Handle timeout
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGTERM')
          const duration = Date.now() - startTime
          const result: TestResult = {
            suite: suite.name,
            passed: false,
            duration,
            output: output + errorOutput,
            error: `Timeout after ${suite.timeout}ms`
          }
          console.log(`⏰ ${suite.name} - TIMEOUT (${duration}ms)`)
          resolve(result)
        }
      }, suite.timeout)
    })
  }

  async runAllTests(): Promise<void> {
    this.startTime = Date.now()
    console.log('🚀 Starting comprehensive test suite...\n')

    // Run all test suites
    for (const suite of this.testSuites) {
      const result = await this.runTestSuite(suite)
      this.results.push(result)

      // Stop on critical failures
      if (!result.passed && suite.critical) {
        console.log(`\n🛑 Stopping due to critical failure in: ${suite.name}`)
        break
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Generate reports
    this.generateConsoleReport()
    this.generateJSONReport()
    this.generateMarkdownReport()
  }

  generateConsoleReport(): void {
    const totalDuration = Date.now() - this.startTime
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const criticalFailed = this.results.filter(r => !r.passed && this.testSuites.find(s => s.name === r.suite)?.critical).length

    console.log('\n📊 COMPREHENSIVE TEST REPORT')
    console.log('==============================')
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`🚨 Critical Failures: ${criticalFailed}`)
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(1)}s`)
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          const critical = this.testSuites.find(s => s.name === r.suite)?.critical ? ' (CRITICAL)' : ''
          console.log(`   - ${r.suite}${critical}: ${r.error}`)
        })
    }

    // Overall status
    if (criticalFailed === 0) {
      console.log('\n🎉 ALL CRITICAL TESTS PASSED!')
      console.log('The application is ready for deployment.')
    } else {
      console.log('\n🚨 CRITICAL TESTS FAILED!')
      console.log('Please fix critical issues before deployment.')
    }
  }

  generateJSONReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        criticalFailed: this.results.filter(r => !r.passed && this.testSuites.find(s => s.name === r.suite)?.critical).length
      },
      results: this.results
    }

    const reportPath = join(process.cwd(), 'test-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 JSON report saved: ${reportPath}`)
  }

  generateMarkdownReport(): void {
    const totalDuration = Date.now() - this.startTime
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length

    let markdown = `# Test Report\n\n`
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`
    markdown += `## Summary\n\n`
    markdown += `- ✅ **Passed:** ${passed}\n`
    markdown += `- ❌ **Failed:** ${failed}\n`
    markdown += `- ⏱️ **Duration:** ${(totalDuration / 1000).toFixed(1)}s\n`
    markdown += `- 📈 **Success Rate:** ${((passed / this.results.length) * 100).toFixed(1)}%\n\n`

    markdown += `## Test Results\n\n`
    markdown += `| Test Suite | Status | Duration | Notes |\n`
    markdown += `|------------|--------|----------|-------|\n`

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL'
      const duration = `${result.duration}ms`
      const notes = result.error || 'Success'
      const critical = this.testSuites.find(s => s.name === result.suite)?.critical ? ' (Critical)' : ''
      
      markdown += `| ${result.suite}${critical} | ${status} | ${duration} | ${notes} |\n`
    })

    if (failed > 0) {
      markdown += `\n## Failed Tests Details\n\n`
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          markdown += `### ${result.suite}\n\n`
          markdown += `**Error:** ${result.error}\n\n`
          if (result.output) {
            markdown += `**Output:**\n\`\`\`\n${result.output.slice(-1000)}\n\`\`\`\n\n`
          }
        })
    }

    const reportPath = join(process.cwd(), 'TEST_REPORT.md')
    writeFileSync(reportPath, markdown)
    console.log(`📄 Markdown report saved: ${reportPath}`)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new ComprehensiveTestRunner()
  runner.runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

export { ComprehensiveTestRunner }
export default ComprehensiveTestRunner
