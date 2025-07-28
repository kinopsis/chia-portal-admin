#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;

  // Fix duplicate buttonText properties like ", buttonText: "Ver más" , buttonText: "Ver más" }"
  content = content.replace(/,\s*buttonText:\s*["'][^"']*["']\s*,\s*buttonText:\s*["'][^"']*["']\s*}/g, '}');
  
  // Fix malformed lines like "  , buttonText: "Ver más" }"
  content = content.replace(/^\s*,\s*buttonText:\s*["'][^"']*["']\s*}/gm, '  }');
  
  // Fix lines that have extra commas and buttonText
  content = content.replace(/(\s*buttonText:\s*['"][^'"]*['"])\s*,\s*buttonText:\s*["'][^"']*["']\s*}/g, '$1\n  }');
  
  // Fix trailing comma issues in object literals
  content = content.replace(/,(\s*)\}/g, '$1}');
  
  // Fix lines that start with comma (syntax error)
  content = content.replace(/^\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:)/gm, '    $1');
  
  // Fix double commas
  content = content.replace(/,,+/g, ',');
  
  // Fix object property syntax errors
  content = content.replace(/(\w+):\s*,/g, '$1: undefined,');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed syntax errors in: ${filePath}`);
    modified = true;
  }

  return modified;
}

// List of files with syntax errors
const filesWithSyntaxErrors = [
  'tests/components/ServiceCard.test.tsx',
  'tests/responsive/HomepageResponsive.test.tsx',
  'tests/responsive/ServiceCardGrid.test.tsx'
];

console.log('🔧 Fixing syntax errors in test files...\n');

let totalFixed = 0;
filesWithSyntaxErrors.forEach(file => {
  try {
    if (fixSyntaxErrors(file)) {
      totalFixed++;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed syntax errors in ${totalFixed} files`);
