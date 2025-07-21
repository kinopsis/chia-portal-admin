#!/usr/bin/env node

/**
 * Favicon Generation Script for Chía Portal Admin
 * 
 * This script helps generate a proper favicon.ico file for the project.
 * Run this script to create the favicon from the SVG design.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Chía Portal Admin - Favicon Generator');
console.log('==========================================');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon-design.svg');
const faviconPath = path.join(publicDir, 'favicon.ico');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error('❌ SVG design file not found:', svgPath);
  process.exit(1);
}

console.log('✅ SVG design found:', svgPath);

// Instructions for manual conversion
console.log('\n📋 Manual Conversion Steps:');
console.log('1. Open https://favicon.io/favicon-converter/');
console.log('2. Upload the file: public/favicon-design.svg');
console.log('3. Download the generated favicon.ico');
console.log('4. Replace public/favicon.ico with the downloaded file');

// Check if favicon.ico already exists
if (fs.existsSync(faviconPath)) {
  const stats = fs.statSync(faviconPath);
  console.log(`\n📄 Current favicon.ico: ${stats.size} bytes (${stats.mtime.toISOString()})`);
  
  // Check if it's the placeholder
  const content = fs.readFileSync(faviconPath, 'utf8');
  if (content.includes('placeholder')) {
    console.log('⚠️  Current favicon.ico is a placeholder - needs replacement');
  } else {
    console.log('✅ favicon.ico appears to be a proper binary file');
  }
} else {
  console.log('\n❌ favicon.ico not found - needs to be created');
}

console.log('\n🔧 Alternative: Use ImageMagick (if available):');
console.log('magick public/favicon-design.svg -resize 32x32 public/favicon.ico');

console.log('\n🚀 After conversion, test with:');
console.log('npm run dev');
console.log('Then check the browser tab for the favicon');
