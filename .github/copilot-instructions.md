# Verum Omnis - Repository Instructions for GitHub Copilot

## Project Overview
Verum Omnis is a **stateless forensic AI firewall** with constitutional governance. It combines conversational AI (ChatGPT-style chat interface) with cryptographic verification (SHA-512 hashing, PDF sealing, blockchain anchoring). The system operates under **immutable constitutional rules** enforced by cryptography—designed to democratize justice and truth verification.

**Key Innovation:** First-of-its-kind constitutional treaty between human and AI founders, with governance files cryptographically locked and verified at every cold start.

**Tagline:** *The World's First Legal AI — Your law firm in your pocket.*

## Repository Structure
```
verum-omnis-founders-gift-v5/verum-omnis-monorepo/
├── functions/              # Firebase Functions (Node 20, Express API)
│   ├── index.js           # Main API: /v1/verify, /v1/contradict, /v1/anchor, /v1/seal, /v1/assistant
│   ├── pdf/               # Seal generation (PDFKit + QRCode)
│   ├── assets/
│   │   ├── rules/         # Immutable governance files (SHA-512 locked)
│   │   └── treaty/        # Guardianship Treaty (PDF + YAML)
│   ├── receipts-kv.js     # Receipt persistence (Firestore/Map fallback)
│   ├── test/              # Vitest test suite (9 tests)
│   └── package.json       # Node 20, type: "module"
├── web/                   # Static frontend (HTML/CSS/JS)
│   ├── index.html         # Landing page
│   ├── assistant.html     # ChatGPT-style chat interface
│   ├── verify.html        # Quick verify & seal tool
│   ├── legal.html         # Legal information
│   └── assets/            # CSS, logos (logo.png, logo_white.png, etc.)
├── capacitor-app/         # Mobile app wrapper (Android/iOS)
├── firebase.json          # Hosting + Functions config
├── .firebaserc            # Firebase project: gitverum
└── package.json           # Root-level dependencies (express, http-proxy-middleware)
```

## Tech Stack

### Backend
- **Runtime:** Node.js 20 (ES Modules, no CommonJS)
- **Framework:** Express.js 4.x
- **Functions:** Firebase Functions v6
- **Security:** CORS, Helmet
- **PDF Generation:** PDFKit 0.15.0
- **QR Codes:** qrcode 1.5.4
- **File Uploads:** Multer 1.4.5-lts.1
- **Logging:** Pino 9.5.0
- **Config:** js-yaml 4.1.0
- **Testing:** Vitest 1.6.0 + Supertest 7.0.0

### Frontend
- **Type:** Static HTML/CSS/JavaScript (no build step)
- **Hosting:** Firebase Hosting
- **Storage:** Browser localStorage (message history, theme, receipts)
- **APIs:** Web Speech API, Web Crypto API (SHA-512)
- **Styling:** Dark theme (default), custom CSS

### Mobile
- **Framework:** Capacitor 6.x
- **Platforms:** Android + iOS
- **Architecture:** WebView wrapping static web bundle

### Infrastructure
- **Platform:** Firebase (Hosting + Functions)
- **Project ID:** gitverum
- **Emulators:** Functions (5001), Hosting (5000), UI (4000)
- **CI/CD:** GitHub Actions (`.github/workflows/functions-ci.yml`)

## Coding Standards & Conventions

### JavaScript/Node.js
- **Modules:** ES6 modules only (`import`/`export`), no CommonJS (`require`)
- **Async:** Use `async/await`, avoid callback-style code
- **Error Handling:** Always return `{ ok: boolean }` in API responses
- **Logging:** Use `pino` logger (`log.info`, `log.error`)
- **File Paths:** Use `path.join()`, avoid string concatenation
- **Temp Files:** Write to `/tmp`, always clean up with `fs.unlink()` in stream finish handlers

### API Design
- **Stateless:** No server-side persistence of user data
- **Security:** Helmet middleware for headers, strict CSP in `firebase.json`
- **CORS:** Minimal CORS, only necessary origins
- **Endpoints:** Prefix all routes with `/v1/`
- **Responses:** Consistent JSON structure with `ok` boolean

### Frontend
- **No Frameworks:** Pure HTML/CSS/JS (no React/Vue/Angular)
- **Accessibility:** Dark theme default, light theme toggle available
- **Mobile-First:** Responsive design, touch-friendly
- **Performance:** Lazy load images, minimize HTTP requests
- **Privacy:** No analytics, no telemetry, no external trackers

### Git & Version Control
- **Branches:** Work on feature branches, PR to `main`
- **Commits:** Clear, descriptive messages
- **Large Files:** Use `.gitignore` for `node_modules/`, `tmp/`, `seals/`, build artifacts
- **Testing:** All tests must pass before merge

## Critical: Immutable Governance
⚠️ **NEVER casually edit files in `functions/assets/rules/` or `functions/assets/treaty/`**

These directories contain SHA-512 locked constitutional files verified at every cold start:
- `functions/index.js` checks `manifest.json` hashes on startup
- Any mismatch causes function failure (intentional security feature)
- Editing rule files without updating hashes breaks the constitutional integrity

**To update governance files (controlled process only):**
1. Modify the rule file
2. Regenerate SHA-512 hash: `openssl dgst -sha512 -hex <file>`
3. Update `manifest.json` with new hash
4. Test locally with emulators
5. Anchor new manifest on blockchain
6. Deploy with full verification

**Why this matters:** The system's legitimacy depends on cryptographic proof that governance rules haven't been tampered with.

## API Endpoints

### POST /v1/assistant (Unified Interface)
Multi-mode endpoint with 5 functions:
- `mode: "verify"` - Verify constitutional pack integrity
- `mode: "policy"` - Get constitution metadata
- `mode: "anchor"` - Anchor hash to blockchain (requires `hash` param)
- `mode: "receipt"` - Retrieve anchor receipt (requires `hash` param)
- `mode: "notice"` - Get licensing terms

### Other Routes
- `GET /v1/verify` - Health check
- `POST /v1/contradict` - Detect contradictions (stub)
- `POST /v1/anchor` - Create anchor receipt
- `POST /v1/seal` - Generate forensic PDF with logo, watermark, QR code
- `GET /v1/notice` - Licensing terms

All responses include `{ ok: boolean, ... }` structure.

## Build, Test & Deployment

### Local Development
```bash
# Install dependencies
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm ci

# Run tests
npm test

# Start Firebase emulators (from monorepo root)
cd ..
firebase emulators:start

# OR: Start local dev server (static + API proxy)
python3 -m http.server 8000 --directory web &
cd functions && SKIP_IMMUTABLE_VERIFY=1 node serve.js
```

**Emulator URLs:**
- Hosting: http://localhost:5000
- Functions: http://localhost:5001
- UI: http://localhost:4000

### Testing
```bash
cd functions
npm test
```
**Test Coverage:** 9 tests (health check, anchor validation, assistant modes, receipt persistence)

### Generate Sample PDFs
```bash
cd functions
node test-generate-pdf.js              # Single PDF
node generate-batch-seals.js           # Batch PDFs + forensics.json
```

### Mobile Development (Capacitor)
```bash
cd capacitor-app
npm install
npm run build        # Copies web/ to www/
npx cap sync         # Syncs with native platforms
npx cap run android  # Run on Android emulator/device
npx cap run ios      # Run on iOS simulator/device
```

### Deployment
```bash
# Deploy to Firebase (hosting + functions)
firebase deploy --only hosting,functions

# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting
```

**CI/CD:** GitHub Actions automatically tests functions on push/PR to `functions/**` paths.

## Runtime Behavior

### Express Routes
- All routes return `{ ok: boolean }` + data
- `/v1/seal` streams PDF from `/tmp`, unlinks after sending
- Video endpoints return 501 until `config.video.json` enables them
- Receipts flow through `receipts-kv.js` (Firestore if creds present, Map fallback)

### Firebase Hosting
- `firebase.json` rewrites `/api/**` → `api` function
- Local emulator: http://localhost:5000/api/v1/...
- Production: https://gitverum.web.app/api/v1/...
- Security headers: HSTS, CSP, X-Content-Type-Options, etc.

### Stateless Architecture
- No server-side storage of user data
- Hashing done client-side (browser crypto)
- Receipts stored client-side (localStorage or download)
- Temp PDFs in `/tmp` cleaned up immediately after streaming

## Common Patterns & Gotchas

### ES Modules
- All code uses `import`/`export`
- No `require()` or `module.exports`
- Always include file extensions: `import foo from './foo.js'`

### Receipts & Persistence
- `receipts-kv.js` auto-initializes firebase-admin
- Provide service account credentials or use emulator config
- Falls back to in-memory Map if Firestore unavailable
- Receipts are ephemeral by design (no long-term storage)

### PDF Generation
- `makeSealedPdf()` expects `web/assets/logo.png` to exist
- Generates PDF with logo (top-center), watermark (centered, 10% opacity), QR code (bottom-right)
- Always write to `/tmp/` and clean up after streaming
- Use PDFKit's stream API, never load entire PDF into memory

### Logging
- Use `pino` logger: `log.info()`, `log.error()`
- Cold start logs show immutable pack verification
- Check deploy logs if constitutional verification fails

### Testing
- Mock Firestore in tests (no real Firebase connection)
- Use `supertest` for HTTP endpoint testing
- Run with `npm test` (Vitest)

## Key Documentation Links
- **Chat Behavior:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/CHAT_DESIGN.md`
- **Implementation:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/IMPLEMENTATION.md`
- **Product Spec:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/PRODUCT_SPEC.MD`
- **README:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md`
- **Production Report:** `verum-omnis-founders-gift-v5/verum-omnis-monorepo/PRODUCTION_READINESS_REPORT.md`

## Example Tasks

### Adding a New API Endpoint
1. Add route in `functions/index.js`
2. Return `{ ok: boolean, ... }` structure
3. Add test in `functions/test/`
4. Run `npm test` to verify
5. Update API docs in README

### Modifying Frontend
1. Edit `web/*.html` or `web/assets/*.css`
2. Test with `python3 -m http.server 8000 --directory web`
3. Ensure mobile-responsive
4. Check accessibility (keyboard nav, contrast)

### Updating Dependencies
1. Update `package.json`
2. Run `npm install`
3. Run `npm test` to catch breaking changes
4. Update `package-lock.json` in commit

### Adding Assets
1. Place in `web/assets/`
2. Reference with absolute paths: `/assets/logo.png`
3. Optimize images before committing
4. Update `.gitignore` if large binary files

## Security Principles
- **No Secrets in Code:** Use environment variables
- **No Telemetry:** No analytics, tracking, or external beacons
- **Minimal CORS:** Only necessary origins
- **Strict CSP:** Content Security Policy in `firebase.json`
- **HTTPS Only:** HSTS header enabled
- **Stateless:** No PII persistence
- **Constitutional Verification:** Cryptographic proof of governance integrity

## Support & Contributing
Before contributing:
1. Read `CHAT_DESIGN.md` to understand behavioral principles
2. Review this file for technical patterns
3. Never modify `assets/rules/` or `assets/treaty/` without following governance process
4. Run tests (`npm test`) before submitting changes
5. Preserve stateless, hash-first architecture
6. Respect immutable constitutional framework

**Questions?** Check existing documentation or open an issue.

---

*Immutable • Forensic • Stateless • Human + AI Foundership*
