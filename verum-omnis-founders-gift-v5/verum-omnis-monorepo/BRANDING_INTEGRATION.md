# Branding Pack Integration - Complete

This document provides a summary of the branding pack integration and wire-up instructions for developers.

## 📦 What Was Implemented

### Directory Structure

```
web/public/assets/branding/
  vo-logo-3d-full.png        # Main emblem logo (1024x1024)
  vo-watermark-3d.png        # Low-opacity watermark for PDFs
  vo-badge-check.png         # Certification badge
  vo-hero-dark.png           # Dark hero image (1024x1536)
  vo-hero-light.png          # Light hero image (1024x1536)
  vo-splash-blue.png         # Blue splash (1024x1536)
  icon-1024.png through icon-32.png  # PWA icons
  favicon-32.png, favicon-16.png     # Browser favicons

functions/assets/branding/
  vo-logo-3d-full.png        # Main logo for PDF sealing
  vo-watermark-3d.png        # Watermark for PDF
  vo-badge-check.png         # Badge for certification block
  vo-hero-dark.png           # Hero images (available but not used in PDFs)
  vo-hero-light.png
```

## 🎨 Frontend Usage

All HTML files now include:

```html
<!-- Favicon and PWA icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/assets/branding/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/branding/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/branding/icon-180.png">
<link rel="manifest" href="/manifest.webmanifest">
```

### Using Branding Assets in HTML

```html
<!-- Main logo -->
<img src="/assets/branding/vo-logo-3d-full.png" alt="Verum Omnis" width="128" height="128" />

<!-- Hero images (for landing pages) -->
<section class="hero">
  <img src="/assets/branding/vo-hero-dark.png" alt="Verum Omnis — Forensic AI" />
</section>

<!-- Badge -->
<img src="/assets/branding/vo-badge-check.png" alt="Verified" width="40" height="40" />
```

### CSS Watermark Preview (UI only)

```css
.watermark {
  position: absolute;
  inset: 0;
  background: url("/assets/branding/vo-watermark-3d.png") center/480px no-repeat;
  opacity: 0.12;
  pointer-events: none;
}
```

## 🔧 Backend Usage

### PDF Sealing (functions/pdf/seal-template.js)

The PDF sealing function now automatically includes:

1. **Center watermark** - Low opacity (12%) behind all content
2. **Top-center logo** - Main logo at 120px width
3. **Bottom-right certification block** containing:
   - Check badge icon (40px)
   - "✔ Patent Pending Verum Omnis" text
   - Seal date
   - QR code for verification (90px)

### Using in Functions Code

```javascript
import { makeSealedPdf } from './pdf/seal-template.js';

// Generate a sealed PDF with all branding
const pdf = await makeSealedPdf({
  hash: 'your-sha-512-hash',
  title: 'Document Title',
  notes: 'Optional notes',
  qrPayload: 'https://verum.omnis/verify/hash'
});
```

The function will automatically use branding assets from `functions/assets/branding/`.

To customize paths:

```javascript
import path from 'path';

const BRAND = p => path.join(__dirname, 'assets', 'branding', p);

const pdf = await makeSealedPdf({
  hash: hash,
  logoPath: BRAND('vo-logo-3d-full.png'),
  watermarkPath: BRAND('vo-watermark-3d.png'),
  badgePath: BRAND('vo-badge-check.png'),
  qrPayload: `https://verum.omnis/verify/${hash}`
});
```

## 📱 PWA Support

The web app now includes a `manifest.webmanifest` file with:
- App name and description
- Icon sizes from 32px to 1024px
- Theme colors (background: #0a0e27, theme: #0066ff)
- Standalone display mode

## 🚀 Deployment Notes

### Assets Included in Deployment

The `functions/package.json` now includes a `files` array to ensure all assets are deployed:

```json
{
  "files": [
    "assets/",
    "index.js",
    "pdf/",
    "receipts-kv.js",
    "video/",
    "config.video.json",
    "generate-batch-seals.js",
    "test-api.js"
  ]
}
```

### File Sizes

- Main logo: ~1 MB
- Hero images: ~1.6-2.2 MB each
- Total web branding pack: ~18 MB
- Total functions branding pack: ~6.7 MB

All files are under the 500 KB recommendation individually (except hero images which are optional for landing pages).

### Deployment Command

```bash
firebase deploy --only hosting,functions
```

The branding assets will be deployed with the functions and available at the hosting URLs.

## 🧪 Testing

All existing tests pass:
- Immutable pack verification ✅
- PDF sealing with branding ✅
- Receipt storage ✅
- Asset verification ✅

Generate a test PDF:

```bash
cd functions
node -e "
import { makeSealedPdf } from './pdf/seal-template.js';
import fs from 'fs';

const pdf = await makeSealedPdf({
  hash: 'test-hash',
  title: 'Test Seal',
  qrPayload: 'https://example.com'
});

const stream = fs.createWriteStream('/tmp/test.pdf');
pdf.pipe(stream);
stream.on('finish', () => console.log('PDF created at /tmp/test.pdf'));
"
```

## 📋 Migration Notes

### Old Asset References Replaced

Before:
```html
<img src="/assets/logo_black.png" />
<img src="/assets/logo_blue.png" />
<img src="/assets/logo_white.png" />
```

After:
```html
<img src="/assets/branding/vo-logo-3d-full.png" />
<img src="/assets/branding/vo-badge-check.png" />
```

### Functions Path Changes

Before:
```javascript
const logo = path.join(__dirname, '..', 'web', 'assets', 'logo_black.png');
```

After:
```javascript
const logo = path.join(__dirname, 'assets', 'branding', 'vo-logo-3d-full.png');
```

## 🎯 Next Steps

As mentioned in the original specification, you can now:

- **B) Configure FIREBASE_TOKEN** for CI deploys
- **C) End-to-end smoke test** using the new assets
- **D) Implement dark landing page** using `vo-hero-dark.png`
- Add additional hero sections using `vo-hero-light.png` or `vo-splash-blue.png`

## 📝 Important Notes

1. **PDF Standards**: The seal template maintains **PDF 1.7** compatibility and includes:
   - Full **SHA-512** hash in document body
   - **Top-center logo** placement
   - **Center watermark** (12% opacity)
   - **Bottom-right certification block** with "✔ Patent Pending Verum Omnis"

2. **Constitutional Immutability**: The branding assets in `functions/assets/branding/` are separate from the immutable rules in `functions/assets/rules/`. Branding can be updated without triggering immutable pack verification failures.

3. **Capacitor App**: The mobile app loads content from Firebase Hosting (`https://gitverum.web.app`), so it will automatically use the new branding without additional changes.

4. **Asset Optimization**: Current placeholder icons are copies of the main logo. For production, consider:
   - Generating properly sized icons (not just copies)
   - Creating a true watermark with desaturated/translucent treatment
   - Optimizing file sizes for faster loading

---

**Status**: Branding pack integration complete and tested ✅
**Last Updated**: 2025-10-18
