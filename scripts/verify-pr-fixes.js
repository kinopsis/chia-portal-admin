#!/usr/bin/env node

/**
 * PR Verification Script
 * Verifies that the systematic TypeScript error fixes are working correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 PR Fix Verification Script');
console.log('============================\n');

const tests = [
  {
    name: 'TypeScript Compilation Check',
    command: 'npx tsc --noEmit --skipLibCheck',
    timeout: 60000,
    critical: true,
    description: 'Verify TypeScript compilation completes without critical errors'
  },
  {
    name: 'Next.js Build Process',
    command: 'npm run build',
    timeout: 180000,
    critical: true,
    description: 'Verify Next.js build process completes successfully'
  },
  {
    name: 'Jest Configuration Test',
    command: 'npm run test -- --passWithNoTests --verbose',
    timeout: 60000,
    critical: false,
    description: 'Verify Jest configuration works with updated settings'
  },
  {
    name: 'ESLint Code Quality',
    command: 'npm run lint',
    timeout: 30000,
    critical: false,
    description: 'Verify code quality standards are maintained'
  }
];

const automatedScripts = [
  'scripts/fix-colorscheme.js',
  'scripts/fix-syntax-errors.js', 
  'scripts/fix-missing-buttontext.js',
  'scripts/fix-typescript-errors.js'
];

async function runTest(test) {
  console.log(`🧪 Running: ${test.name}`);
  console.log(`   ${test.description}`);
  
  try {
    const startTime = Date.now();
    
    execSync(test.command, {
      stdio: 'pipe',
      timeout: test.timeout,
      cwd: process.cwd()
    });
    
    const duration = Date.now() - startTime;
    console.log(`   ✅ PASSED (${duration}ms)\n`);
    return { name: test.name, passed: true, duration, critical: test.critical };
    
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    return { name: test.name, passed: false, error: error.message, critical: test.critical };
  }
}

function verifyAutomatedScripts() {
  console.log('🛠️  Verifying Automated Scripts');
  console.log('================================\n');
  
  let allExist = true;
  
  automatedScripts.forEach(script => {
    if (fs.existsSync(script)) {
      console.log(`   ✅ ${script} - EXISTS`);
    } else {
      console.log(`   ❌ ${script} - MISSING`);
      allExist = false;
    }
  });
  
  console.log(`\n📊 Automated Scripts: ${allExist ? 'ALL PRESENT' : 'SOME MISSING'}\n`);
  return allExist;
}

function verifyKeyFiles() {
  console.log('📁 Verifying Key Files');
  console.log('======================\n');
  
  const keyFiles = [
    'src/contexts/ThemeContext.tsx',
    'src/app/admin/dependencias/page.tsx',
    'playwright.responsive.config.ts',
    'jest.config.js',
    'next.config.js'
  ];
  
  let allExist = true;
  
  keyFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} - EXISTS`);
    } else {
      console.log(`   ❌ ${file} - MISSING`);
      allExist = false;
    }
  });
  
  console.log(`\n📊 Key Files: ${allExist ? 'ALL PRESENT' : 'SOME MISSING'}\n`);
  return allExist;
}

async function main() {
  const startTime = Date.now();
  
  // Verify files exist
  const filesOk = verifyKeyFiles();
  const scriptsOk = verifyAutomatedScripts();
  
  // Run tests
  console.log('🚀 Running Verification Tests');
  console.log('=============================\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    
    // Stop on critical failures
    if (!result.passed && result.critical) {
      console.log(`🛑 Stopping due to critical failure: ${test.name}\n`);
      break;
    }
  }
  
  // Generate summary
  const totalTime = Date.now() - startTime;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const criticalFailed = results.filter(r => !r.passed && r.critical).length;
  
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=======================');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Critical Failures: ${criticalFailed}`);
  console.log(`Total Time: ${totalTime}ms`);
  console.log(`Files Status: ${filesOk ? 'OK' : 'ISSUES'}`);
  console.log(`Scripts Status: ${scriptsOk ? 'OK' : 'ISSUES'}`);
  
  if (criticalFailed === 0 && filesOk && scriptsOk) {
    console.log('\n🎉 PR VERIFICATION SUCCESSFUL!');
    console.log('All critical fixes are working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  PR VERIFICATION ISSUES DETECTED');
    console.log('Some critical issues need to be addressed before merging.');
    process.exit(1);
  }
}

// Run verification
main().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
