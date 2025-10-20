# Testing Guide for Verum Omnis

This document describes how to test the Verum Omnis project locally and in CI/CD.

## Local Testing

### Prerequisites
- Node.js 20
- Java 21 (for Android builds)
- Firebase CLI: `npm install -g firebase-tools`

### Quick Test Suite

Run the comprehensive API test suite:

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
node test-api.js
```

This tests:
- ✅ Immutable pack verification
- ✅ Manifest structure integrity
- ✅ PDF sealing functionality
- ✅ Receipt storage (Firestore + fallback)
- ✅ Video configuration
- ✅ Critical assets presence

### Firebase Emulator Testing

Start the local Firebase emulators:

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
firebase emulators:start
```

Access points:
- **Web UI**: http://localhost:5000
- **API**: http://localhost:5001/api2/v1/verify
- **Emulator UI**: http://localhost:4000

### Test Individual Endpoints

With emulators running:

```bash
# Health check
curl http://localhost:5001/api2/v1/verify

# Anchor a hash
curl -X POST http://localhost:5001/api2/v1/anchor \
  -H "Content-Type: application/json" \
  -d '{"hash":"abc123"}'

# Generate sealed PDF
curl -X POST http://localhost:5001/api2/v1/seal \
  -H "Content-Type: application/json" \
  -d '{"hash":"test123","title":"Test Document","notes":"Test notes"}' \
  -o test-seal.pdf
```

### Capacitor Mobile App Testing

Build and test the mobile app:

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app

# Install dependencies
npm ci

# Build web assets
npm run build

# Sync with native platforms
npx cap sync

# Open in Android Studio
npx cap open android

# Run Android tests (requires Android SDK)
cd android
./gradlew :app:test --no-build-cache
```

## CI/CD Testing

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` workflow automatically:

1. **Test Job** (runs on all PRs and pushes):
   - Installs Node.js 20 and Java 21
   - Installs dependencies
   - Verifies immutable pack integrity
   - Runs comprehensive API test suite
   - Builds Capacitor web assets
   - Runs Android unit tests

2. **Deploy Job** (runs only on `main` branch):
   - Installs Firebase CLI
   - Deploys functions and hosting to Firebase
   - Requires `FIREBASE_TOKEN` secret

### Setting Up CI Secrets

Generate a Firebase token for CI/CD:

```bash
firebase login:ci
```

Add the generated token to GitHub:
1. Go to repository Settings > Secrets and variables > Actions
2. Add new secret: `FIREBASE_TOKEN`
3. Paste the token value

## Test Coverage

### Core Functionality Tests

✅ **Immutable Pack Verification**
- All rules files hash validation
- Manifest integrity check
- Extra file detection

✅ **API Endpoints**
- `GET /v1/verify` - Health check
- `POST /v1/anchor` - Hash anchoring
- `POST /v1/seal` - PDF generation
- `POST /v1/contradict` - Contradiction analysis (stub)
- Video endpoints (disabled by config)

✅ **Storage Layer**
- Firestore receipt storage
- In-memory fallback
- Get/put operations

✅ **PDF Generation**
- SHA-512 hash embedding
- QR code generation
- Logo watermarking
- PDF 1.7 compliance

✅ **Mobile App**
- Web asset build
- Platform sync
- Android unit tests

### Security Verification

The immutable pack system provides cryptographic verification:
- SHA-512 hashes for all constitutional rules
- Cold start verification on every function invocation
- Tamper detection and deployment blocking
- No graceful degradation (intentional security behavior)

## Manual Verification

### Verify Deployed Functions

After deployment, test the production endpoints:

```bash
# Health check
curl https://gitverum.web.app/api/v1/verify

# Anchor test
curl -X POST https://gitverum.web.app/api/v1/anchor \
  -H "Content-Type: application/json" \
  -d '{"hash":"production-test-123"}'
```

### Verify Web UI

1. Navigate to https://gitverum.web.app
2. Test document sealing interface
3. Verify logo and branding
4. Check QR code generation

### Verify Mobile App

1. Build and install on test device
2. Verify offline hash verification
3. Test document sealing flow
4. Verify Firebase hosting integration

## Troubleshooting

### Common Issues

**Immutable pack verification fails**
- Check that no rules files have been modified
- Verify manifest.json is in sync with actual files
- Review hash calculations

**Receipt storage fails**
- Check Firestore is enabled in Firebase Console
- Verify credentials are properly initialized
- Falls back to in-memory storage automatically

**PDF generation fails**
- Verify logo files exist in web/assets/
- Check PDFKit dependencies are installed
- Review QRCode module is available

**Workflow fails**
- Verify FIREBASE_TOKEN secret is set
- Check Node.js version is 20
- Ensure Java 21 is available for Android tests

## Performance Benchmarks

Expected test execution times:
- Immutable pack verification: < 1 second
- API test suite: < 5 seconds
- Capacitor build: < 10 seconds
- Android unit tests: 30-60 seconds
- Full CI/CD pipeline: 3-5 minutes

## Test Maintenance

When adding new features:
1. Add corresponding tests to `functions/test-api.js`
2. Update this documentation
3. Verify GitHub Actions workflow passes
4. Test both locally and in CI

When updating constitutional rules:
1. Follow the governance update process
2. Regenerate all SHA-512 hashes
3. Update manifest.json
4. Verify immutable pack tests pass
5. Update RULES_PACK_HASH if needed
