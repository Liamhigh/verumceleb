# Verum Omnis - AI Coding Agent Instructions

## 0) North Star

* This is **Verum Omnis**: a stateless, hash-first forensic stack. The **frontend(s)** seal docs (logo + watermark + QR + SHA-512) and the **backend** is a thin API (no PII, hash-indexed) that talks to external LLMs only when needed.
* Always preserve: **SHA-512**, **PDF 1.7**, **logo watermarking**, **"✔ Patent Pending Verum Omnis" block**. Don't "simplify" these.

## 1) Repo Shape (what's here, how it talks)

**Project Structure**: `/workspaces/verumceleb/verum-omnis-founders-gift-v5/verum-omnis-monorepo/`

- **`functions/`** - Firebase Functions v2 (Express app, Node.js 20 ESM)
- **`web/`** - Static frontend hosted via Firebase Hosting  
- **`capacitor-app/`** - Cross-platform mobile app wrapper

**API Endpoints** (`functions/index.js`):
- `GET /v1/verify` - Health check
- `POST /v1/contradict` - Text contradiction analysis (stub)
- `POST /v1/anchor` - Hash anchoring with receipt storage  
- `POST /v1/seal` - PDF generation with cryptographic seals
- Video endpoints: disabled by default via `config.video.json`

## 2) Runtime + Secrets (don't fight the toolchain)

**Current Project ID**: `gitverum` (set in `.firebaserc`)

* **Node**: Functions must run on **Node 20** with **ESM modules** (`"type": "module"` in package.json)
* **Dependencies**: Already installed in `functions/node_modules/` 
* **Deploy**: `firebase deploy --only hosting,functions` (function name: `api2`)
* **Local test**: `firebase emulators:start` (ports: hosting=5000, functions=5001, UI=4000)

## 3) Critical: Immutable Rules System

**Core Innovation**: Files in `functions/assets/rules/` and `functions/assets/treaty/` are **cryptographically locked**.

**Critical Verification (Cold Start)**:
```javascript
// This runs on EVERY function cold start in index.js
(function verifyImmutablePack(){
  // Verifies all files in manifest.json against SHA-512 hashes
  // Blocks deployment if any tampering detected
})();
```

**Never modify files in these directories without understanding the implications:**
- All files are SHA-512 verified at cold start via `manifest.json`
- Any hash mismatch causes immediate function failure  
- Extra files in rules directory are blocked
- This system enforces constitutional immutability

## 4) Current State & Critical Issues

### ✅ **Working**:
- Functions deployed as `api2` to Firebase (`gitverum` project)
- Immutable pack verification system functional
- PDF sealing with SHA-512, QR codes, watermarks
- Basic web frontend with logo assets

### 🚨 **Critical Missing for Production**:

1. **GitHub Actions CI/CD**: No `.github/workflows/` exists
   - Need: Firebase deploy workflow with `FIREBASE_TOKEN` secret
   - Need: Android build/test pipeline

2. **Persistent Receipt Storage**: Current `receipts-kv.js` uses in-memory `Map()`
   - **Risk**: Receipts vanish on cold start, breaking audit trails
   - **Required**: Migrate to Firestore or durable KV store

3. **Mobile App Completion**: Capacitor app exists but needs:
   - Build pipeline: `web/` → `capacitor-app/www/`
   - Store deployment (Play Store + App Store)
   - Proper signing keys and asset compliance

## 5) Development Workflows

### Local Development
```bash
cd /workspaces/verumceleb/verum-omnis-founders-gift-v5/verum-omnis-monorepo
firebase emulators:start  # Starts local Firebase emulator (ports: hosting=5000, functions=5001, UI=4000)

# For mobile development  
cd capacitor-app
npm run build && npx cap sync
npx cap run android  # or ios
```

### Deployment
```bash
firebase deploy --only hosting,functions  # Deploys both web and functions
firebase deploy --only functions         # Functions only (api2)
firebase deploy --only hosting          # Static web only
```

### 🎥 Video Features (Future Activation)
Video endpoints exist as **roadmap items** disabled via `config.video.json`. These are future-activation features, not legacy code:
- Transcription hooks (`video/transcription.js`)
- Threat detection (`video/threat-detect.js`) 
- Video ingest pipeline (`video/video-ingest.js`)

To activate when ready:
1. Update `config.video.json` flags to `true`
2. Implement actual processing logic in `video/` modules
3. Remove 501 status responses from `index.js`

## 6) Project-Specific Patterns

### File Naming Convention
- `01_constitution.json` - Numbered rules (immutable)
- `config.video.json` - Feature flags
- `seal-template.js` - PDF generation utilities

### Error Handling
Functions fail fast on integrity violations. **No graceful degradation** for immutable pack errors - this is intentional security behavior.

### Security Model
- Constitutional rules are cryptographically locked
- PDF seals provide document integrity verification
- Receipt system provides audit trails (now uses Firestore)

## 7) Integration Points

### Firebase Services
- **Hosting**: Serves `web/` with API rewrites to `/api/**` → `functions`
- **Functions**: Express app deployed as `api2` function
- **Firestore**: Persistent receipt storage (fallback to in-memory if unavailable)

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
