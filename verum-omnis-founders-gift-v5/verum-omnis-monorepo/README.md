# Verum Omnis - Founders Release

A stateless, hash-first forensic stack with cryptographically sealed documents and immutable governance.

## 📚 Documentation

- **[LOCALHOST_GUIDE.md](./LOCALHOST_GUIDE.md)** - **START HERE** - Complete guide for running the app locally
- **[PRODUCT_SPEC.md](./PRODUCT_SPEC.md)** - Comprehensive product specification with screens, features, and technical contracts
- **[TESTING.md](./TESTING.md)** - Testing guide for local and CI/CD environments
- **[.github/copilot-instructions.md](../../.github/copilot-instructions.md)** - AI coding agent instructions

## Quick Start

### ⚡ Fastest Way (Frontend Only)

**Option 1: Using the startup script**

```bash
# Navigate to the project
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Run the startup script
./start-local.sh
```

**Option 2: Direct command**

No installation needed! Just run:

```bash
# Navigate to the project
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Start the development server
python3 -m http.server 5000 --directory web
```

**Access:** http://localhost:5000

### 🔧 Full Stack Development

For API functions and Firestore:

**Prerequisites:**
- Node.js 20
- Firebase CLI: `npm install -g firebase-tools`
- Java 21 (for Android builds)

```bash
# Navigate to the project
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Install dependencies (first time only)
cd functions && npm install && cd ..

# Start Firebase emulators
firebase emulators:start
```

**Access:**
- **Web UI**: http://localhost:5000
- **API**: http://localhost:5001/gitverum/us-central1/api2/v1/verify
- **Emulator UI**: http://localhost:4000

📖 **See [LOCALHOST_GUIDE.md](./LOCALHOST_GUIDE.md) for detailed instructions and troubleshooting.**

### Deploy to Firebase

1. **Setup Firebase project**:
   ```bash
   firebase login
   firebase use gitverum  # or your project ID
   ```

2. **Deploy**:
   ```bash
   firebase deploy --only hosting,functions
   ```

3. **For production**: Set the `FIREBASE_TOKEN` secret in GitHub repository settings for automated deployments.

### Mobile Development

```bash
cd capacitor-app
npm install
npm run build              # Copy web files to www/
npx cap sync              # Sync with native platforms
npx cap open android      # Open Android Studio
```

## Architecture

- **`functions/`**: Firebase Functions API (Node.js 20 ESM)
  - Immutable rules verification on cold start
  - PDF sealing with cryptographic integrity
  - Receipt storage via Firestore (fallback to memory)

- **`web/`**: Static frontend with document sealing
- **`capacitor-app/`**: Mobile wrapper (Android/iOS)

## Key Features

- **Cryptographic Integrity**: All rules files SHA-512 verified at startup
- **Stateless Design**: No PII storage, hash-indexed operations
- **Constitutional Governance**: Immutable rules with controlled update process
- **Cross-Platform**: Web + mobile with offline capabilities

## Critical Files

- `functions/assets/rules/manifest.json` - Hash registry for immutable files
- `firebase.json` - Hosting + Functions configuration
- `.firebaserc` - Project ID configuration

## GitHub Actions

The repo includes automated CI/CD that:
- Verifies immutable pack integrity
- Runs Android unit tests  
- Deploys to Firebase on `main` branch pushes

Set `FIREBASE_TOKEN` secret for automated deployments:
```bash
firebase login:ci
# Copy the token to GitHub Settings > Secrets and variables > Actions
```

## Production Checklist

- [ ] Set Firebase secrets: `firebase functions:secrets:set OPENAI_API_KEY`
- [ ] Configure custom domain in Firebase Hosting
- [ ] Enable Firestore in Firebase Console
- [ ] Set up proper monitoring and alerts
- [ ] Configure Android/iOS app store assets and signing

---

**⚖️ Constitutional Notice**: This system implements cryptographically enforced governance. Casual modifications to rules files will break integrity verification. Follow the documented governance process for any constitutional changes.