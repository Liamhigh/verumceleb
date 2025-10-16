# Verum Omnis - AI Coding Agent Instructions

## Architecture Overview

This is a **Firebase-hosted monorepo** implementing an immutable governance system with cryptographic integrity verification. The project consists of three main components:

- **`functions/`** - Firebase Functions API (Node.js 20, Express)
- **`web/`** - Static frontend hosted via Firebase Hosting
- **`capacitor-app/`** - Cross-platform mobile app wrapper

## Quick Start

To get this app running you just install the `functions/` dependencies with `npm ci`, generate an Ed25519 JWK signing key and set it as the `VOSIGNINGKEY` Firebase secret (along with your optional API keys and allowed origins), add your assets (`vo_logo.png`, constitution, model pack, and rules JSONs), and then deploy functions + hosting with `firebase deploy`. For production you must upgrade the in-memory receipt store to Firestore or another durable KV, follow a strict branch-hash-anchor workflow when updating rule files (so new SHA-512s are anchored and signed), and use Capacitor for mobile by building the web bundle, syncing into Android/iOS, and packaging for the stores. Keep CORS locked to prod domains, enable helmet + rate limits, monitor `/health`, and always emphasize that the system is stateless and hash-first so agents don't break cryptographic integrity.

### Critical: Immutable Rules System

The **core innovation** is the immutable rules pack system in `functions/assets/rules/` and `functions/assets/treaty/`. 

**Never modify files in these directories without understanding the implications:**
- All files are SHA-512 verified at cold start via `manifest.json`
- Any hash mismatch causes immediate function failure
- Extra files in rules directory are blocked
- This system enforces constitutional immutability

## Key Components & Data Flow

### API Routes (`functions/index.js`)
- `/v1/verify` - Health check
- `/v1/contradict` - Text contradiction analysis (stub)
- `/v1/anchor` - Hash anchoring with receipt storage
- `/v1/seal` - PDF generation with cryptographic seals

### Immutable Pack Verification (Cold Start)
```javascript
// This runs on every function cold start
(function verifyImmutablePack(){
  // Verifies all files in manifest.json against SHA-512 hashes
  // Blocks deployment if any tampering detected
})();
```

### 🔒 Receipt System (`receipts-kv.js`)
**CRITICAL TODO**: Current in-memory `Map()` is **not production-grade**. Receipts vanish on cold start, breaking audit trails.
- **Current state:** Ephemeral storage only
- **Required for production:** Migrate to Firestore, Cloud SQL, or durable KV store
- **Risk:** Receipt "disappearance" violates constitutional audit requirements

## Development Workflows

### Local Development
```bash
# In functions/ directory
npm ci
npm start  # Starts local Firebase emulator

# For mobile development
cd capacitor-app
npm run build  # Copies web/ to www/
npx cap sync
npx cap run android  # or ios
```

### Deployment
Use the provided GitHub Actions workflow. **Critical requirements:**
- Set `FIREBASE_TOKEN` secret in repository settings
- Functions deploy automatically triggers rules verification
- Hosting serves from `web/` directory

### 🎥 Video Features (Future Activation)
Video endpoints exist as **roadmap items** disabled via `config.video.json`. These are future-activation features, not legacy code:
- Transcription hooks (`video/transcription.js`)
- Threat detection (`video/threat-detect.js`) 
- Video ingest pipeline (`video/video-ingest.js`)

To activate when ready:
1. Update `config.video.json` flags to `true`
2. Implement actual processing logic in `video/` modules
3. Remove 501 status responses from `index.js`

## Project-Specific Patterns

### File Naming Convention
- `01_constitution.json` - Numbered rules (immutable)
- `config.video.json` - Feature flags
- `seal-template.js` - PDF generation utilities

### Error Handling
Functions fail fast on integrity violations. **No graceful degradation** for immutable pack errors - this is intentional security behavior.

### Security Model
- Constitutional rules are cryptographically locked
- PDF seals provide document integrity verification
- Receipt system provides audit trails

## Integration Points

### Firebase Services
- **Hosting**: Serves `web/` with API rewrites to `/api/**` → `functions`
- **Functions**: Express app deployed as `api2` function
- **No Database**: Uses in-memory storage (upgrade needed for production)

### 📱 Capacitor Integration
Mobile app loads web content from Firebase Hosting with **stateless local storage** and **offline hash-first design**.

**Development Pattern:**
1. `npx cap init` with app ID + name
2. Add platforms: `npx cap add android ios`
3. Link web build: `npm run build && npx cap sync`
4. Open IDEs: `npx cap open android` / `npx cap open ios`

**Key Files:**
- `capacitor.config.ts` - Configure Firebase hosting URL
- Build process: `web/` → `capacitor-app/www/`
- Target: Play Store + App Store with proper signing, versioning, compliant icons/splash

**Constitutional Design:**
- No server PII storage
- Offline-capable hash verification
- Stateless architecture aligned with governance model

## Critical Files to Understand

- `functions/index.js` - Main API and immutable pack verification
- `functions/assets/rules/manifest.json` - Hash registry for all immutable files
- `firebase.json` - Hosting configuration with API routing
- `capacitor-app/capacitor.config.ts` - Mobile app configuration

## 📜 Rules Governance

**Constitutional Immutability**: Files in `assets/rules/*.json` are **constitutionally immutable** and cryptographically verified.

**Updating Rules (Controlled Process Only):**
1. Generate new SHA-512 hashes for every modified rule file
2. Update `manifest.json` with new hashes
3. Update `RULES_PACK_HASH` in system
4. Anchor new manifest with signed receipt
5. Optional: Version-stamp in `constitution.pdf`

**Critical Warning:** Casual edits break consensus and signature checks. Only controlled updates with proper anchoring maintain constitutional validity.

## Common Gotchas

1. **Never edit rules files directly** - Follow governance update process above
2. **In-memory receipts reset** - Implement persistent storage for production  
3. **Video features disabled** - Check config.video.json before debugging video endpoints
4. **Capacitor sync required** - Run after web changes for mobile testing
5. **Firebase token expires** - Regenerate with `firebase login:ci` if deploys fail

## Testing Strategy

The immutable pack verification serves as the primary integration test - if functions deploy successfully, core integrity is verified. Add unit tests for business logic, but preserve the cryptographic verification as the authoritative test.
