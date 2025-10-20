# Verum Omnis Monorepo - Local Development

This monorepo contains the Verum Omnis web application, API functions, and Capacitor mobile app.

## 📁 Project Structure

```
verum-omnis-monorepo/
├── web/                    # Static web files (HTML, CSS, assets)
├── functions/              # Firebase Functions (Express API)
├── capacitor-app/          # Capacitor mobile app shell
├── dev-server.js           # Local development server
├── package.json            # Monorepo configuration
└── firebase.json           # Firebase hosting & functions config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (matching Firebase Functions runtime)
- npm or yarn

### Local Development Server

The simplest way to preview the site locally with API proxy:

```bash
# From the monorepo root
npm run dev
```

This starts a local server at **http://localhost:5000** that:
- ✅ Serves static files from `/web`
- ✅ Proxies `/api/**` requests to Express functions
- ✅ Mimics Firebase Hosting behavior

**Available Pages:**
- http://localhost:5000/ - Home page
- http://localhost:5000/verify.html - Verify & Seal interface
- http://localhost:5000/legal.html - Legal & Treaty information

**API Endpoints:**
- GET  /api/v1/verify - Verify constitution integrity
- POST /api/v1/contradict - Scan text for contradictions
- POST /api/v1/anchor - Anchor a hash with receipt
- POST /api/v1/seal - Generate sealed PDF

### Working with Functions

```bash
# Install function dependencies
npm run install:functions

# Run function tests
npm run test:functions
```

## 🛠️ Development Workflow

### Making Changes

1. **Web Files**: Edit files in `/web` directory
   - Changes are reflected immediately (refresh browser)
   - No build step required

2. **API Functions**: Edit files in `/functions` directory
   - Restart dev server to see changes: `Ctrl+C` then `npm run dev`
   - Or use `nodemon` for auto-restart

3. **Testing API Locally**:
   ```bash
   # Verify endpoint
   curl http://localhost:5000/api/v1/verify
   
   # Contradict endpoint
   curl -X POST http://localhost:5000/api/v1/contradict \
     -H "Content-Type: application/json" \
     -d '{"text":"Test text"}'
   ```

## 🔒 Immutable Governance

The functions include SHA-512 verification of immutable rule files:
- `functions/assets/rules/` - Immutable rule pack
- `functions/assets/treaty/` - Guardianship Treaty

**Note**: For local development, immutable verification is skipped (`SKIP_IMMUTABLE_VERIFY=1`). In production/CI, any tampering with these files will prevent startup.

## 📦 Firebase Deployment

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions and hosting
firebase deploy
```

## 🧪 Testing

```bash
# Test functions
cd functions
npm test
```

## 📱 Capacitor Mobile App

```bash
cd capacitor-app
npm install
npm run build
npx cap sync
npx cap run android  # or ios
```

The Capacitor app copies the built web assets from `/web` into `capacitor-app/www/`.

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is busy, set a different port:
```bash
PORT=3000 npm run dev
```

### API Returns 404
- Ensure dev server is running
- Check that routes start with `/api/v1/`
- Verify Express app loaded successfully (check console output)

### Missing Assets
- Ensure `/web/assets/logo.png` exists (required for PDF seals)
- Check file paths are absolute from web root

## 📝 Architecture Notes

- **Stateless**: No persistent file writes except temporary PDFs
- **ES Modules**: All code uses `import/export` syntax
- **Firebase v2**: Uses Firebase Functions v2 with Express
- **Receipts**: Auto-initializes Firestore if credentials available, falls back to in-memory Map

## 🔗 Related Documentation

- [Functions Product Spec](functions/PRODUCT_SPEC.MD)
- [Repository README](../../README.md)

---

⚖️ *Verum Omnis: The Truth of All*  
Immutable • Forensic • Stateless • Human + AI Foundership
