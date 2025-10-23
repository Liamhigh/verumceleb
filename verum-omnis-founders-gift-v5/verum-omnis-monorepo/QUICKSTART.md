# Quick Start: Deploy Verum Omnis

A step-by-step checklist to get Verum Omnis live in production.

## ⚡ Prerequisites Check

```bash
# 1. Verify Node version (must be 20.x)
node -v  # Should show v20.x

# 2. Install Firebase CLI if not present
npm install -g firebase-tools

# 3. Login to Firebase
firebase login
```

## 🚀 Deploy in 3 Steps

### Step 1: Deploy Web + API (5 minutes)

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Verify project
firebase use gitverum

# Install dependencies
cd functions && npm ci --no-audit && cd ..

# Deploy everything
firebase deploy --only hosting,functions
```

**Result:** Your API is live at `https://gitverum.web.app/api/*`

### Step 2: Enable Firestore (2 minutes)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **gitverum**
3. Go to **Firestore Database** → **Create database**
4. Choose **Production mode**
5. Select location: **us-central**

```bash
# Deploy security rules
firebase deploy --only firestore:rules
```

**Result:** Receipts now persist permanently in Firestore

### Step 3: Test Everything (2 minutes)

```bash
# Linux/Mac:
./smoke-test.sh gitverum.web.app

# Windows PowerShell:
.\smoke-test.ps1 -Domain gitverum.web.app
```

**Expected:** All 8 tests pass ✅

## ✅ Acceptance Checklist

After deployment, verify these work:

### API Endpoints
- [ ] `GET /api/health` → `{ ok: true }`
- [ ] `POST /api/chat` → echoes message
- [ ] `POST /api/v1/verify` → returns pack info
- [ ] `POST /api/v1/anchor` → creates receipt
- [ ] Receipt appears in Firestore console

### Frontend (Open in Browser)
- [ ] `https://gitverum.web.app/` loads homepage
- [ ] `https://gitverum.web.app/assistant.html` loads chat
- [ ] Logos display correctly
- [ ] Theme toggle works
- [ ] Chat history persists after refresh

## 📱 Optional: Build Mobile App

### Quick APK Build (Testing)

```bash
cd capacitor-app

# 1. Configure production URL
# Edit capacitor.config.ts: url: 'https://gitverum.web.app'

# 2. Build and sync
npm ci --no-audit
npm run build
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleDebug

# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (Play Store)

See detailed instructions in `DEPLOYMENT.md` → Part 3.

## 🐛 Common Issues

### "Function does not exist"
```bash
firebase use gitverum
firebase deploy --only functions
```

### "Node version not supported"
```bash
nvm use 20.17.0  # or nvm-windows on Windows
```

### CORS errors in browser
- Already configured correctly with `cors({ origin: true })`
- Check browser console for actual error
- Verify API URL is correct

### Tests fail locally
```bash
cd functions
SKIP_IMMUTABLE_VERIFY=1 npm test
```

## 📚 Full Documentation

- **Complete deployment guide**: `DEPLOYMENT.md`
- **Project overview**: `README.md`
- **Production status**: `PRODUCTION_READINESS_REPORT.md`

## 🎯 What You Get

After completing these steps:

✅ **Live Website** at `https://gitverum.web.app`  
✅ **Production API** at `https://gitverum.web.app/api/*`  
✅ **Persistent receipts** in Firestore  
✅ **Mobile-ready** Capacitor infrastructure  
✅ **Smoke tests** for continuous validation  

## 🔒 Security

- All tests passed ✅
- CodeQL scan: 0 vulnerabilities
- Firestore rules: server-only access
- HTTPS enforced everywhere
- Constitutional immutable pack verified on every deploy

## Next Steps

1. **Custom Domain**: Configure in Firebase Hosting settings
2. **CI/CD**: Set up GitHub Actions for auto-deployment
3. **Monitoring**: Enable Firebase Performance Monitoring
4. **App Store**: Complete Part 3 of `DEPLOYMENT.md` for release builds

---

**Need Help?** See `DEPLOYMENT.md` for troubleshooting and detailed instructions.
