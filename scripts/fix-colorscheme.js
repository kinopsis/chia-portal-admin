#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixColorSchemeInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;

  // Fix colorScheme values in object properties
  content = content.replace(/colorScheme:\s*['"](?!service-)yellow['"]/g, "colorScheme: 'service-yellow'");
  content = content.replace(/colorScheme:\s*['"](?!service-)gray['"]/g, "colorScheme: 'service-gray'");
  content = content.replace(/colorScheme:\s*['"](?!service-)blue['"]/g, "colorScheme: 'service-blue'");
  content = content.replace(/colorScheme:\s*['"](?!service-)green['"]/g, "colorScheme: 'service-green'");
  content = content.replace(/colorScheme:\s*['"](?!service-)purple['"]/g, "colorScheme: 'service-purple'");
  content = content.replace(/colorScheme:\s*['"](?!service-)indigo['"]/g, "colorScheme: 'service-indigo'");

  // Fix colorScheme in JSX attributes
  content = content.replace(/colorScheme=['"](?!service-)yellow['"]/g, 'colorScheme="service-yellow"');
  content = content.replace(/colorScheme=['"](?!service-)gray['"]/g, 'colorScheme="service-gray"');
  content = content.replace(/colorScheme=['"](?!service-)blue['"]/g, 'colorScheme="service-blue"');
  content = content.replace(/colorScheme=['"](?!service-)green['"]/g, 'colorScheme="service-green"');
  content = content.replace(/colorScheme=['"](?!service-)purple['"]/g, 'colorScheme="service-purple"');
  content = content.replace(/colorScheme=['"](?!service-)indigo['"]/g, 'colorScheme="service-indigo"');

  // Fix arrays of color schemes
  content = content.replace(/\[\s*['"]yellow['"],?\s*['"]gray['"],?\s*['"]blue['"],?\s*['"]green['"],?\s*['"]purple['"],?\s*['"]indigo['"]\s*\]/g, 
    "['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo']");

  // Fix individual string literals in arrays (more targeted)
  content = content.replace(/(const\s+colorSchemes\s*=\s*\[)([^[\]]*)\]/g, (match, prefix, arrayContent) => {
    let newArrayContent = arrayContent
      .replace(/['"](?!service-)yellow['"]/g, "'service-yellow'")
      .replace(/['"](?!service-)gray['"]/g, "'service-gray'")
      .replace(/['"](?!service-)blue['"]/g, "'service-blue'")
      .replace(/['"](?!service-)green['"]/g, "'service-green'")
      .replace(/['"](?!service-)purple['"]/g, "'service-purple'")
      .replace(/['"](?!service-)indigo['"]/g, "'service-indigo'");
    return prefix + newArrayContent + ']';
  });

  // Add missing buttonText to ServiceCard props if missing
  if (filePath.includes('.test.') && content.includes('ServiceCard')) {
    // Look for ServiceCard props objects that are missing buttonText
    content = content.replace(
      /(\{[^}]*icon:\s*['"][^'"]*['"][^}]*stats:\s*\{[^}]+\}[^}]*)\}(?![^}]*buttonText)/g,
      '$1, buttonText: "Ver más" }'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
    modified = true;
  }

  return modified;
}

// List of test files to fix
const testFiles = [
  'tests/components/ServiceCard.test.tsx',
  'tests/accessibility/HomepageAccessibility.test.tsx', 
  'tests/responsive/ServiceCardGrid.test.tsx',
  'tests/crossBrowser/HomepageCrossBrowser.test.tsx',
  'tests/accessibility/ScreenReaderCompatibility.test.tsx',
  'tests/performance/HomepagePerformance.test.tsx',
  'tests/responsive/HomepageResponsive.test.tsx'
];

console.log('🔧 Fixing colorScheme values in test files...\n');

let totalFixed = 0;
testFiles.forEach(file => {
  try {
    if (fixColorSchemeInFile(file)) {
      totalFixed++;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} files`);
