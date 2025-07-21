# Favicon Conversion Instructions for Chía Portal Admin

## Current Status
- ✅ SVG design created: `favicon-design.svg`
- ⏳ Needs conversion to ICO format

## Design Description
The favicon design represents:
- **Blue background (#1e40af)**: Professional government color
- **White building with columns**: Represents municipal government/city hall
- **Central "C"**: Represents Chía municipality
- **Classical architecture**: Conveys stability and public service

## Conversion Steps

### Option 1: Online Conversion (Recommended)
1. Visit https://favicon.io/favicon-converter/
2. Upload the `favicon-design.svg` file
3. Download the generated `favicon.ico`
4. Replace the current placeholder `favicon.ico`

### Option 2: Using RealFaviconGenerator
1. Visit https://realfavicongenerator.net/
2. Upload the `favicon-design.svg` file
3. Configure settings:
   - Desktop browsers: Keep default
   - iOS: Enable
   - Android: Enable
4. Generate and download the favicon package
5. Extract `favicon.ico` and replace current file

### Option 3: Command Line (if ImageMagick available)
```bash
# Convert SVG to multiple ICO sizes
magick favicon-design.svg -resize 16x16 favicon-16.png
magick favicon-design.svg -resize 32x32 favicon-32.png
magick favicon-16.png favicon-32.png favicon.ico
```

## Verification
After conversion, verify the favicon:
1. Place `favicon.ico` in `/public` directory
2. Start the Next.js development server
3. Check browser tab for the favicon
4. Test in multiple browsers (Chrome, Firefox, Safari, Edge)

## Next.js Integration
The favicon will be automatically served from `/public/favicon.ico` by Next.js.
No additional configuration needed in the application code.
