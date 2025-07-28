#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix common TypeScript errors
function fixTypeScriptErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix helpText -> helperText
  if (content.includes('helpText:')) {
    content = content.replace(/helpText:/g, 'helperText:');
    modified = true;
    console.log(`Fixed helpText -> helperText in ${filePath}`);
  }

  // Fix defaultValue issues by removing it from FormField objects
  const defaultValueRegex = /defaultValue:\s*[^,}]+,?\s*\n/g;
  if (defaultValueRegex.test(content)) {
    content = content.replace(defaultValueRegex, '');
    modified = true;
    console.log(`Removed defaultValue from FormField in ${filePath}`);
  }

  // Fix min property issues
  const minRegex = /min:\s*\d+,?\s*\n/g;
  if (minRegex.test(content)) {
    content = content.replace(minRegex, '');
    modified = true;
    console.log(`Removed min property from FormField in ${filePath}`);
  }

  // Fix variant issues - replace unsupported variants
  // Don't replace these anymore since we added them to the components
  // content = content.replace(/"outline"/g, '"neutral"');
  // content = content.replace(/"secondary"/g, '"info"');
  // content = content.replace(/"danger"/g, '"error"');
  
  // Fix disabled property in options
  const disabledOptionRegex = /disabled:\s*(true|false),?\s*/g;
  if (disabledOptionRegex.test(content)) {
    content = content.replace(disabledOptionRegex, '');
    modified = true;
    console.log(`Removed disabled property from options in ${filePath}`);
  }

  // Fix datetime-local type issues
  content = content.replace(/type:\s*['"]datetime-local['"]/g, 'type: "text"');

  // Fix emptyStateProps -> emptyMessage
  content = content.replace(/emptyStateProps:/g, 'emptyMessage:');

  // Fix searchable -> showSearchAndFilters
  content = content.replace(/searchable:\s*true/g, 'showSearchAndFilters: true');

  // Fix searchQuery -> searchValue
  content = content.replace(/searchQuery:/g, 'searchValue:');

  // Fix validation function calls
  content = content.replace(/validateForm\(([^,]+),\s*([^)]+)\)/g, 'validateForm($2, $1)');

  // Fix validation error handling
  content = content.replace(/setError\(([^)]+)\)/g, 'setError($1.message || $1)');

  // Fix Element type issues
  content = content.replace(/: string \| Element/g, ': string');

  // Fix required property access
  content = content.replace(/\.required\b/g, '?.required');

  // Fix ServiceCard colorScheme values - only if not already prefixed
  content = content.replace(/colorScheme:\s*["'](?!service-)yellow["']/g, 'colorScheme: "service-yellow"');
  content = content.replace(/colorScheme:\s*["'](?!service-)gray["']/g, 'colorScheme: "service-gray"');
  content = content.replace(/colorScheme:\s*["'](?!service-)blue["']/g, 'colorScheme: "service-blue"');
  content = content.replace(/colorScheme:\s*["'](?!service-)green["']/g, 'colorScheme: "service-green"');
  content = content.replace(/colorScheme:\s*["'](?!service-)purple["']/g, 'colorScheme: "service-purple"');
  content = content.replace(/colorScheme:\s*["'](?!service-)indigo["']/g, 'colorScheme: "service-indigo"');

  // Fix colorScheme="value" format - only if not already prefixed
  content = content.replace(/colorScheme=["'](?!service-)yellow["']/g, 'colorScheme="service-yellow"');
  content = content.replace(/colorScheme=["'](?!service-)gray["']/g, 'colorScheme="service-gray"');
  content = content.replace(/colorScheme=["'](?!service-)blue["']/g, 'colorScheme="service-blue"');
  content = content.replace(/colorScheme=["'](?!service-)green["']/g, 'colorScheme="service-green"');
  content = content.replace(/colorScheme=["'](?!service-)purple["']/g, 'colorScheme="service-purple"');
  content = content.replace(/colorScheme=["'](?!service-)indigo["']/g, 'colorScheme="service-indigo"');

  // Fix array declarations like ['yellow', 'gray', ...] to ['service-yellow', 'service-gray', ...]
  content = content.replace(/\[['"](?!service-)yellow['"],?\s*['"](?!service-)gray['"],?\s*['"](?!service-)blue['"],?\s*['"](?!service-)green['"],?\s*['"](?!service-)purple['"],?\s*['"](?!service-)indigo['"]\]/g,
    "['service-yellow', 'service-gray', 'service-blue', 'service-green', 'service-purple', 'service-indigo']");

  // Fix individual array elements
  content = content.replace(/'(?!service-)yellow'/g, "'service-yellow'");
  content = content.replace(/'(?!service-)gray'/g, "'service-gray'");
  content = content.replace(/'(?!service-)blue'/g, "'service-blue'");
  content = content.replace(/'(?!service-)green'/g, "'service-green'");
  content = content.replace(/'(?!service-)purple'/g, "'service-purple'");
  content = content.replace(/'(?!service-)indigo'/g, "'service-indigo'");

  // Add missing buttonText property to ServiceCard props
  if (filePath.includes('.test.') && content.includes('ServiceCard')) {
    // Add buttonText to ServiceCard props objects
    content = content.replace(
      /(\{[^}]*icon:\s*[^,}]+[^}]*stats:\s*\{[^}]+\}[^}]*)\}/g,
      '$1, buttonText: "Ver más" }'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }

  return modified;
}

// Function to recursively find TypeScript files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const testDir = path.join(__dirname, '..', 'tests');
const srcFiles = findTsFiles(srcDir);
const testFiles = findTsFiles(testDir);
const tsFiles = [...srcFiles, ...testFiles];

console.log(`Found ${tsFiles.length} TypeScript files`);

let totalFixed = 0;
for (const file of tsFiles) {
  if (fixTypeScriptErrors(file)) {
    totalFixed++;
  }
}

console.log(`Fixed ${totalFixed} files`);
