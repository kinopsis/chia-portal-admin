#!/usr/bin/env node

/**
 * Create a simple ICO file for Chía Portal Admin
 * This creates a basic 32x32 ICO file with the municipal branding
 */

const fs = require('fs');
const path = require('path');

// Simple ICO file structure for 32x32 favicon
// This is a minimal ICO file with blue background and white "C"
const createSimpleICO = () => {
  // ICO file header (6 bytes)
  const header = Buffer.from([
    0x00, 0x00, // Reserved (must be 0)
    0x01, 0x00, // Type (1 = ICO)
    0x01, 0x00  // Number of images (1)
  ]);

  // Image directory entry (16 bytes)
  const dirEntry = Buffer.from([
    0x20,       // Width (32 pixels)
    0x20,       // Height (32 pixels)
    0x00,       // Color count (0 = no palette)
    0x00,       // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel (32-bit)
    0x80, 0x04, 0x00, 0x00, // Size of image data (1152 bytes)
    0x16, 0x00, 0x00, 0x00  // Offset to image data (22 bytes)
  ]);

  // Create a simple 32x32 bitmap with blue background and white "C"
  // This is a simplified approach - in production, use proper image libraries
  const bitmapHeader = Buffer.alloc(40);
  bitmapHeader.writeUInt32LE(40, 0);      // Header size
  bitmapHeader.writeInt32LE(32, 4);       // Width
  bitmapHeader.writeInt32LE(64, 8);       // Height (doubled for ICO)
  bitmapHeader.writeUInt16LE(1, 12);      // Planes
  bitmapHeader.writeUInt16LE(32, 14);     // Bits per pixel
  bitmapHeader.writeUInt32LE(0, 16);      // Compression
  bitmapHeader.writeUInt32LE(4096, 20);   // Image size
  bitmapHeader.writeInt32LE(0, 24);       // X pixels per meter
  bitmapHeader.writeInt32LE(0, 28);       // Y pixels per meter
  bitmapHeader.writeUInt32LE(0, 32);      // Colors used
  bitmapHeader.writeUInt32LE(0, 36);      // Important colors

  // Create pixel data (32x32 pixels, 4 bytes per pixel: BGRA)
  const pixelData = Buffer.alloc(32 * 32 * 4);
  
  // Fill with blue background (#1e40af)
  for (let i = 0; i < 32 * 32; i++) {
    const offset = i * 4;
    pixelData[offset] = 0xaf;     // Blue
    pixelData[offset + 1] = 0x40; // Green
    pixelData[offset + 2] = 0x1e; // Red
    pixelData[offset + 3] = 0xff; // Alpha
  }

  // Draw a simple "C" shape in white (very basic)
  const drawPixel = (x, y, r, g, b, a = 255) => {
    if (x >= 0 && x < 32 && y >= 0 && y < 32) {
      const offset = ((31 - y) * 32 + x) * 4; // Flip Y coordinate
      pixelData[offset] = b;
      pixelData[offset + 1] = g;
      pixelData[offset + 2] = r;
      pixelData[offset + 3] = a;
    }
  };

  // Draw a simple "C" in the center (white)
  for (let y = 10; y <= 22; y++) {
    for (let x = 12; x <= 20; x++) {
      if (
        (y === 10 || y === 22) && x >= 12 && x <= 20 || // Top and bottom
        (x === 12) && y >= 10 && y <= 22 // Left side
      ) {
        drawPixel(x, y, 255, 255, 255);
      }
    }
  }

  // AND mask (32x32 bits = 128 bytes, all zeros for no transparency)
  const andMask = Buffer.alloc(128, 0);

  return Buffer.concat([header, dirEntry, bitmapHeader, pixelData, andMask]);
};

const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');

try {
  const icoData = createSimpleICO();
  fs.writeFileSync(faviconPath, icoData);
  
  console.log('✅ Created favicon.ico successfully!');
  console.log(`📄 File size: ${icoData.length} bytes`);
  console.log(`📍 Location: ${faviconPath}`);
  console.log('\n🎨 Favicon features:');
  console.log('- 32x32 pixels');
  console.log('- Blue background (#1e40af)');
  console.log('- White "C" for Chía');
  console.log('- ICO format for maximum browser compatibility');
  
} catch (error) {
  console.error('❌ Error creating favicon:', error.message);
  process.exit(1);
}
