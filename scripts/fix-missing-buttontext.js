#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixMissingButtonText(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;

  // Pattern to match ServiceCard props objects that are missing buttonText
  // Look for objects with icon, title, description, href, stats but no buttonText
  const serviceCardPropsPattern = /(\{[^}]*icon:\s*['"][^'"]*['"][^}]*title:\s*['"][^'"]*['"][^}]*description:\s*['"][^'"]*['"][^}]*href:\s*['"][^'"]*['"][^}]*stats:\s*\{[^}]+\}[^}]*(?!.*buttonText))\}/g;
  
  content = content.replace(serviceCardPropsPattern, (match) => {
    // Only add buttonText if it's not already present
    if (!match.includes('buttonText')) {
      // Insert buttonText before the closing brace
      const insertPos = match.lastIndexOf('}');
      const beforeClosing = match.substring(0, insertPos);
      const afterClosing = match.substring(insertPos);
      return beforeClosing + ',\n    buttonText: "Ver más"' + afterClosing;
    }
    return match;
  });

  // Also handle cases where colorScheme is present but buttonText is missing
  const serviceCardWithColorSchemePattern = /(\{[^}]*icon:\s*['"][^'"]*['"][^}]*title:\s*['"][^'"]*['"][^}]*description:\s*['"][^'"]*['"][^}]*href:\s*['"][^'"]*['"][^}]*stats:\s*\{[^}]+\}[^}]*colorScheme:\s*['"][^'"]*['"][^}]*(?!.*buttonText))\}/g;
  
  content = content.replace(serviceCardWithColorSchemePattern, (match) => {
    if (!match.includes('buttonText')) {
      const insertPos = match.lastIndexOf('}');
      const beforeClosing = match.substring(0, insertPos);
      const afterClosing = match.substring(insertPos);
      return beforeClosing + ',\n    buttonText: "Ver más"' + afterClosing;
    }
    return match;
  });

  // Handle minimal props objects that need buttonText
  const minimalPropsPattern = /(\{[^}]*icon:\s*['"][^'"]*['"][^}]*title:\s*['"][^'"]*['"][^}]*description:\s*['"][^'"]*['"][^}]*href:\s*['"][^'"]*['"][^}]*colorScheme:\s*['"][^'"]*['"][^}]*(?!.*buttonText)(?!.*stats))\}/g;
  
  content = content.replace(minimalPropsPattern, (match) => {
    if (!match.includes('buttonText')) {
      const insertPos = match.lastIndexOf('}');
      const beforeClosing = match.substring(0, insertPos);
      const afterClosing = match.substring(insertPos);
      return beforeClosing + ',\n    buttonText: "Ver más"' + afterClosing;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed missing buttonText in: ${filePath}`);
    modified = true;
  }

  return modified;
}

// Find all test files that might have ServiceCard usage
function findTestFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDir(fullPath);
      } else if (stat.isFile() && (item.endsWith('.test.tsx') || item.endsWith('.test.ts'))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

console.log('🔧 Fixing missing buttonText properties in test files...\n');

const testFiles = findTestFiles('tests');
let totalFixed = 0;

testFiles.forEach(file => {
  try {
    if (fixMissingButtonText(file)) {
      totalFixed++;
    }
  } catch (error) {
    console.log(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log(`\n🎉 Fixed missing buttonText in ${totalFixed} files`);
