# Verum Omnis Deployment Guide

This guide provides step-by-step instructions for deploying the Verum Omnis system to production.

## Prerequisites

- **Node.js 20.x** (required by Firebase Functions)
- **Firebase CLI** installed (`npm install -g firebase-tools`)
- **Firebase project** set up (current: `gitverum`)
- **Java JDK 17+** (for Android builds)
- **Android Studio** (for mobile app development)

## Part 1: Deploy Web (Hosting + Functions)

### 1. Ensure Node 20

```bash
# Check your Node version
node -v  # Should output v20.x

# If using nvm (Linux/Mac):
nvm install 20.17.0
nvm use 20.17.0

# If using nvm-windows (Windows PowerShell):
nvm install 20.17.0
nvm use 20.17.0
```

### 2. Navigate to Project Root

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
```

### 3. Login to Firebase

```bash
firebase login
```

### 4. Verify Project Configuration

```bash
# Check which project is active
firebase use

# If needed, switch to correct project
firebase use gitverum
```

### 5. Install Dependencies

```bash
# Install Functions dependencies
cd functions
npm ci --no-audit
cd ..
```

### 6. Deploy to Production

Deploy hosting and functions together:

```bash
firebase deploy --only hosting,functions
```

Or deploy separately:

```bash
# Deploy functions only
firebase deploy --only functions

# Deploy hosting only
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 7. Post-Deployment Smoke Tests

Replace `<your-hosting-domain>` with your actual Firebase Hosting URL (e.g., `gitverum.web.app`):

#### Health Check
```bash
# Linux/Mac:
curl https://<your-hosting-domain>/api/health

# Windows PowerShell:
Invoke-RestMethod https://<your-hosting-domain>/api/health
```

Expected response:
```json
{"ok":true,"status":"healthy","service":"verum-omnis-api","version":"1.0.0","time":"..."}
```

#### Verify Endpoint
```bash
# Linux/Mac:
curl -X POST https://<your-hosting-domain>/api/v1/verify \
  -H "Content-Type: application/json"

# Windows PowerShell:
Invoke-RestMethod https://<your-hosting-domain>/api/v1/verify `
  -Method Post -ContentType "application/json"
```

#### Chat Test
```bash
# Linux/Mac:
curl -X POST https://<your-hosting-domain>/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Verum"}'

# Windows PowerShell:
Invoke-RestMethod https://<your-hosting-domain>/api/chat `
  -Method Post -ContentType "application/json" `
  -Body (@{ message = "Hello Verum" } | ConvertTo-Json)
```

#### Anchor Test
```bash
# Linux/Mac:
curl -X POST https://<your-hosting-domain>/api/v1/anchor \
  -H "Content-Type: application/json" \
  -d '{"hash":"test123abc"}'

# Windows PowerShell:
Invoke-RestMethod https://<your-hosting-domain>/api/v1/anchor `
  -Method Post -ContentType "application/json" `
  -Body (@{ hash = "test123abc" } | ConvertTo-Json)
```

## Part 2: Enable Firestore (Persistent Receipts)

By default, the system uses in-memory receipt storage. To enable persistent storage:

### 1. Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`gitverum`)
3. Navigate to **Firestore Database**
4. Click **Create database**
5. Choose **Production mode** (recommended) or **Test mode**
6. Select a location (e.g., `us-central`)

### 2. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

The rules in `firestore.rules` restrict all direct client access, allowing only Cloud Functions to read/write data.

### 3. Verify Firestore Integration

After enabling Firestore, the Functions will automatically use it. Test with:

```bash
# Create an anchor
curl -X POST https://<your-hosting-domain>/api/v1/anchor \
  -H "Content-Type: application/json" \
  -d '{"hash":"firestore-test-123"}'

# Retrieve the receipt
curl -X POST https://<your-hosting-domain>/api/v1/assistant \
  -H "Content-Type: application/json" \
  -d '{"mode":"receipt","hash":"firestore-test-123"}'
```

Check the Firebase Console → Firestore → `receipts` collection to confirm the data was written.

## Part 3: Mobile App (Capacitor → Android)

### 1. Configure Production API URL

Edit `capacitor-app/capacitor.config.ts` and update the server URL:

```typescript
const config: CapacitorConfig = {
  appId: 'foundation.verumglobal.app',
  appName: 'Verum Omnis',
  webDir: 'www',
  server: {
    url: 'https://gitverum.web.app',  // Replace with your actual hosting domain
    cleartext: false
  }
};
```

### 2. Build the Web Assets

```bash
cd capacitor-app
npm ci --no-audit
npm run build
```

This copies the `web/` directory into `capacitor-app/www/`.

### 3. Sync Capacitor

```bash
npx cap sync android
```

### 4. Build Debug APK (for Testing)

```bash
cd android
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

### 5. Build Release AAB (for Play Store)

#### Create Signing Key (One-Time)

```bash
keytool -genkeypair -v \
  -keystore verum-signing.keystore \
  -alias verum \
  -keyalg RSA \
  -keysize 2048 \
  -validity 3650
```

#### Configure Signing in build.gradle

Edit `android/app/build.gradle` and add the signing config in the `android` block:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../verum-signing.keystore')
            storePassword 'your-password'
            keyAlias 'verum'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... other settings
        }
    }
}
```

#### Build Release AAB

```bash
./gradlew bundleRelease

# Output: app/build/outputs/bundle/release/app-release.aab
```

### 6. Update Download Page

After building the APK/AAB, update `web/download.html` with:

1. **Upload the APK** to Firebase Hosting or Cloud Storage
2. **Calculate checksum**:
   ```bash
   # Linux/Mac:
   sha512sum app-debug.apk
   
   # Windows PowerShell:
   certutil -hashfile app-debug.apk SHA512
   ```
3. **Update the download link and hash** in `download.html`

## Part 4: Acceptance Testing

Use this checklist to verify everything works after deployment:

### Functions
- [ ] `GET /api/health` returns `{ ok: true }`
- [ ] `POST /api/v1/verify` returns pack info
- [ ] `POST /api/chat` echoes message
- [ ] `POST /api/v1/anchor` creates receipt
- [ ] `POST /api/v1/seal` generates PDF

### Frontend
- [ ] Logos display correctly (white in header, blue avatar)
- [ ] Theme toggle works and persists after refresh
- [ ] Chat history persists in localStorage
- [ ] File upload → hash calculation works
- [ ] Anchor and Seal buttons function correctly
- [ ] Export conversation to PDF includes watermark and hash

### Receipts
- [ ] New anchors appear in Firestore (not just memory)
- [ ] Receipt retrieval works via `/v1/assistant` with `mode=receipt`

### Mobile (Debug APK)
- [ ] App loads and displays the web UI
- [ ] API calls to `/api/*` work on device
- [ ] HTTPS connections succeed (Android 9+ network security)

## Troubleshooting

### Functions Not Found

**Problem:** After deploying, API calls return 404 or "Function does not exist"

**Solutions:**
1. Verify you're on the correct project: `firebase use gitverum`
2. Ensure `functions/index.js` exports the function: `export const api2 = onRequest(...)`
3. Check `firebase.json` rewrites point to `api2`
4. Redeploy: `firebase deploy --only functions`

### Node Version Error

**Problem:** `firebase deploy` fails with "Node version not supported"

**Solution:**
```bash
nvm use 20.17.0
node -v  # Verify it shows v20.x
firebase deploy --only functions
```

### CORS Errors

**Problem:** Browser shows CORS errors when calling API

**Solution:**
The API already has `cors({ origin: true })` configured. If issues persist:
1. Ensure the request includes proper headers
2. Check browser console for actual error details
3. Verify the API is deployed and accessible

### Immutable Pack Verification Fails

**Problem:** Functions crash on cold start with "Immutable artifact tampered"

**Solutions:**
1. Verify all files in `functions/assets/rules/` match `manifest.json` hashes
2. For local testing, set: `SKIP_IMMUTABLE_VERIFY=1`
3. For production, ensure files are committed correctly

### Firestore Receipts Not Persisting

**Problem:** Receipts disappear after function restarts

**Solutions:**
1. Verify Firestore database is created in Firebase Console
2. Check function logs for "Firestore receipts enabled" message
3. Ensure `firestore.rules` are deployed
4. Verify firebase-admin initializes correctly (check logs)

## Environment Variables

For local development, you can use a `.env` file in the `functions/` directory:

```bash
SKIP_IMMUTABLE_VERIFY=1
```

For production, set environment variables via Firebase Console or CLI:

```bash
firebase functions:config:set app.skip_verify="0"
firebase deploy --only functions
```

## Next Steps

1. **Set up CI/CD**: Configure GitHub Actions for automated deployments
2. **Enable Firestore**: Follow Part 2 above
3. **Build Mobile App**: Follow Part 3 above
4. **Custom Domain**: Set up custom domain in Firebase Hosting settings
5. **Monitoring**: Enable Firebase Performance Monitoring
6. **Analytics**: Set up Firebase Analytics for usage tracking

## Support

- **Documentation**: See `README.md` and `PRODUCTION_READINESS_REPORT.md`
- **Issues**: File issues on GitHub repository
- **Firebase Docs**: https://firebase.google.com/docs
