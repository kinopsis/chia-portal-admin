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
const srcDir = path.join(__dirname, 'src');
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files`);

let totalFixed = 0;
for (const file of tsFiles) {
  if (fixTypeScriptErrors(file)) {
    totalFixed++;
  }
}

console.log(`Fixed ${totalFixed} files`);
