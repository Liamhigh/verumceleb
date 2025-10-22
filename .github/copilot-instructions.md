# Verum Omnis - GitHub Copilot Instructions

This repository contains Verum Omnis, a constitutional AI system with forensic verification capabilities. This file provides technical guidance for contributors and AI assistants working with the codebase.

## Repository Structure

The main project is a Firebase monorepo located at `verum-omnis-founders-gift-v5/verum-omnis-monorepo/`:

```
verum-omnis-monorepo/
├── functions/           # Firebase Functions (Node 20, Express API)
│   ├── index.js        # Main entry point with API routes
│   ├── pdf/            # PDF sealing logic (PDFKit + QRCode)
│   ├── assets/         # Immutable governance files (SHA-512 locked)
│   │   ├── rules/      # Constitutional rules (verified at cold start)
│   │   └── treaty/     # Guardianship Treaty documents
│   └── test/           # Vitest test suite
├── web/                # Static frontend (HTML/CSS/JS)
│   ├── index.html      # Landing page
│   ├── assistant.html  # ChatGPT-style interface
│   ├── verify.html     # Quick verify & seal tool
│   └── assets/         # Logos, CSS, static resources
├── capacitor-app/      # Mobile wrapper (Android/iOS)
├── firebase.json       # Hosting config + API rewrites
└── package.json        # Root monorepo config
```

## Core Concepts

### Immutable Governance
- Files in `functions/assets/rules/` and `functions/assets/treaty/` are cryptographically locked using SHA-512 hashes
- `functions/index.js` verifies ALL governance files on cold start via `manifest.json`
- **CRITICAL**: Never casually edit files in `assets/rules/` or `assets/treaty/` - this breaks constitutional integrity
- To update governance files: modify file → regenerate SHA-512 → update `manifest.json` → test → deploy
- Skip verification in tests using `SKIP_IMMUTABLE_VERIFY=1` environment variable

### Stateless Architecture
- No server-side storage of user data
- All receipts are ephemeral (Map fallback) or stored in Firestore (if configured)
- PDFs are generated in `/tmp` and streamed, then immediately deleted
- Client-side hashing (SHA-512) happens in the browser using Web Crypto API

### API Design
- Primary API endpoint: `/v1/assistant` with 5 modes (verify, policy, anchor, receipt, notice)
- Firebase Hosting rewrites `/api/**` to the `api2` HTTPS function
- Local development: API available at `http://localhost:5000/api/v1/...`
- All responses include `{ ok: boolean }` for consistent error handling

## Development Workflows

### Local Setup
```bash
# Install dependencies
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm ci

# Run tests
npm test

# Start local emulators (from monorepo root)
cd ..
firebase emulators:start
```

Visit local site at `http://localhost:5000`

### Testing
- Test framework: Vitest
- Location: `functions/test/`
- Run with: `npm test` (from `functions/` directory)
- All tests should pass before committing
- Use `SKIP_IMMUTABLE_VERIFY=1` in test environment

### Building
- **Functions**: No build step needed (Node 20 ES modules)
- **Web**: Static HTML/CSS/JS, no build required
- **Capacitor**: `npm run build` → `npx cap sync` → `npx cap run android|ios`

### Deployment
```bash
# Deploy to Firebase (from monorepo root)
firebase deploy --only hosting,functions

# Mobile app build
cd capacitor-app
npm run build
npx cap sync
npx cap build android --release
```

## Key Patterns & Conventions

### Code Style
- **ES Modules only**: Use `import/export`, avoid CommonJS `require()`
- **Async/await**: Preferred over promise chains
- **Logging**: Use `pino` logger (`log.info`, `log.error`, etc.)
- **Error handling**: Always return `{ ok: false, error: "..." }` for errors

### PDF Generation
- Uses `PDFKit` for PDF creation
- Logo: `web/assets/logo.png` (must exist before calling `/v1/seal`)
- Output: PDF 1.7 with compression disabled for forensic integrity
- Features: centered watermark, QR code, patent notice, certification page

### Security & Privacy
- No analytics or telemetry
- API keys only via environment variables (never hardcoded)
- CORS minimal, CSP strict
- SHA-512 for all hashing operations
- Constitutional files are immutable and verified

### Receipt Management
- Handled by `receipts-kv.js`
- Auto-initializes firebase-admin if credentials available
- Falls back to in-memory Map if Firestore unavailable
- Receipts include: hash, timestamp, metadata

## Important Gotchas

1. **Constitutional Files**: Editing `assets/rules/` or `assets/treaty/` breaks deployment. Always regenerate hashes and update manifest.
2. **Logo Dependencies**: `/v1/seal` requires `web/assets/logo.png` to exist. Add asset before calling seal endpoints.
3. **PDF Streaming**: `/v1/seal` streams from `/tmp`, so keep processing lightweight to ensure cleanup.
4. **Module Format**: All code uses ES modules. Mixing CommonJS will cause runtime errors.
5. **Firestore Fallback**: Without credentials, receipts use volatile Map storage (lost on restart).
6. **Video Endpoints**: Return 501 until `config.video.json` is configured and video modules implemented.

## API Endpoints

### POST /v1/assistant
Unified interface with mode parameter:
- `mode: "verify"` - Health check, pack verification status
- `mode: "policy"` - Returns constitution.json and manifest
- `mode: "anchor"` - Create blockchain anchor request (requires `hash`)
- `mode: "receipt"` - Retrieve receipt by hash (requires `hash`)
- `mode: "notice"` - Returns licensing terms

### Other Endpoints
- `GET /v1/verify` - Health check
- `POST /v1/contradict` - Detect contradictions (stub)
- `POST /v1/anchor` - Create anchor receipt
- `POST /v1/seal` - Generate forensic PDF
- `GET /v1/notice` - Licensing terms (direct access)

## Documentation References
- `README.md` - High-level overview and chat behavior
- `IMPLEMENTATION.md` - Complete implementation guide
- `CHAT_DESIGN.md` - Detailed chat interface specification
- `PRODUCTION_READINESS_REPORT.md` - Production status
- Root `copilot-instructions.md` - Product requirements and vision

## Contributing Guidelines

1. **Test First**: Run `npm test` before and after changes
2. **Preserve Statelessness**: Never add server-side data persistence
3. **Respect Immutability**: Don't edit constitutional files without proper process
4. **Use Existing Patterns**: Follow ES module, async/await, and logging conventions
5. **Check Integration**: Test with emulators before deploying
6. **Document Changes**: Update relevant docs when changing behavior

## Mobile Development (Capacitor)

- Build process copies `web/` output to `capacitor-app/www/`
- Sync native platforms: `npx cap sync`
- Run on device: `npx cap run android` or `npx cap run ios`
- Offline-capable with client-side hashing
- Constitutional enforcement on-device

## Licensing & Pricing

- **Individual users**: Free forever
- **Institutions/Companies**: 20% of fraud recovery after trial, or licensing agreement
- Notice enforcement: Required flow before business/institution usage
