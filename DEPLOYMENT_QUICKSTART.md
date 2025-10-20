# 🚀 Deployment Quick Start Guide

**Quick reference for completing deployment of Verum Omnis**

## ✅ Current Status

Your project is **ready for deployment**! All tests pass and CI/CD is configured.

- ✅ All 6 API tests passing
- ✅ Immutable pack verification working
- ✅ CI/CD workflow configured
- ✅ Firebase project configured (`gitverum`)
- ✅ Deployment scripts created

## 🎯 Complete Deployment in 3 Steps

### Step 1: Configure GitHub Secret (for automated deployments)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login and generate CI token
firebase login:ci
```

Copy the token, then:

1. Go to: https://github.com/Liamhigh/verumceleb/settings/secrets/actions
2. Click "New repository secret"
3. Name: `FIREBASE_TOKEN`
4. Paste the token
5. Click "Add secret"

**That's it!** Now every push to `main` will automatically deploy.

### Step 2: Deploy Now (Manual Option)

If you want to deploy right now without waiting for CI:

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Quick deploy
./deploy.sh --production
```

Or using Firebase CLI directly:

```bash
firebase deploy --only hosting,functions --project gitverum
```

### Step 3: Verify Deployment

After deployment completes, verify it's working:

**Web Application:**
```bash
# Open in browser
open https://gitverum.web.app
```

**API Check:**
```bash
# Test the API
curl https://us-central1-gitverum.cloudfunctions.net/api2/v1/verify
```

Expected response:
```json
{"status":"ok","service":"Verum Omnis API v1","timestamp":"..."}
```

## 🛠️ Useful Commands

### Local Development
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Start local server
./deploy.sh --local

# Or use Firebase directly
firebase emulators:start
```

Access at:
- Web: http://localhost:5000
- API: http://localhost:5001/api2/v1/verify
- Emulator UI: http://localhost:4000

### Run Tests
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Run all pre-deployment checks
./deploy.sh --check

# Or run tests directly
cd functions && node test-api.js
```

### Build Mobile App
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app

# Build web assets and sync
npm run build
npx cap sync

# Open in IDE
npx cap open android  # or ios
```

## 📱 Mobile Deployment (Future)

When ready for app stores:

**Android (Google Play):**
1. Build signed APK in Android Studio
2. Create Play Console account
3. Upload and publish

**iOS (App Store):**
1. Build in Xcode with signing
2. Upload to App Store Connect
3. Submit for review

## 📚 Documentation

For detailed information:

- **[DEPLOYMENT.md](verum-omnis-founders-gift-v5/verum-omnis-monorepo/DEPLOYMENT.md)** - Complete deployment guide
- **[README.md](verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md)** - Development setup
- **[TESTING.md](verum-omnis-founders-gift-v5/verum-omnis-monorepo/TESTING.md)** - Testing procedures

## 🆘 Troubleshooting

### "Firebase login required"
```bash
firebase login
```

### "FIREBASE_TOKEN not set" (in CI)
Go to GitHub repo settings and add the secret (see Step 1 above)

### "Tests failing"
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
./deploy.sh --check
```

### "Node version wrong"
Install Node.js 20: https://nodejs.org/

### Need help?
Check the full [DEPLOYMENT.md](verum-omnis-founders-gift-v5/verum-omnis-monorepo/DEPLOYMENT.md) guide.

## 🎉 Next Steps After Deployment

1. ✅ Verify the app works at https://gitverum.web.app
2. ✅ Test API endpoints
3. ✅ Configure custom domain (optional)
4. ✅ Set up error monitoring
5. ✅ Plan mobile app store deployment

---

**Status:** ✅ Ready for Deployment  
**Project:** gitverum  
**Last Updated:** 2025-10-20
