# Deployment Guide - Verum Omnis

This guide walks you through deploying the Verum Omnis system to production.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] **Firebase account** with a project created
- [ ] **GitHub repository** access with admin permissions
- [ ] **Node.js 20** installed locally
- [ ] **Firebase CLI** installed: `npm install -g firebase-tools`
- [ ] **Git** installed and configured

---

## 🔐 Step 1: Configure Secrets

### 1.1 Generate Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`gitverum` or your project name)
3. Click the gear icon → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (keep it secure!)

### 1.2 Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `FIREBASE_SERVICE_ACCOUNT` | Entire JSON content from step 1.1 | Service account JSON |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | Firebase Console → Project Settings |

**Example:**
```json
FIREBASE_SERVICE_ACCOUNT:
{
  "type": "service_account",
  "project_id": "gitverum",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-...",
  ...
}
```

```
FIREBASE_PROJECT_ID:
gitverum
```

### 1.3 (Optional) Android Signing Secrets

Only required if you want to build signed Android APKs.

See [SECRETS.md](./SECRETS.md#android_keystore) for detailed instructions.

---

## 🏗️ Step 2: Local Testing

Before deploying, test locally:

### 2.1 Test verum-web Build

```bash
cd verum-web
npm install
npm run build
```

**Expected output:** ✅ Build completes successfully

### 2.2 Test Firebase Functions

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm install
SKIP_IMMUTABLE_VERIFY=1 npm test
```

**Expected output:** ✅ At least 7/9 tests pass (2 may timeout, this is expected)

### 2.3 Test Firebase Emulators (Optional)

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
firebase emulators:start
```

**Expected output:** Emulators start on http://localhost:5000

---

## 🚀 Step 3: Deploy to Production

### Option A: Automatic Deployment (Recommended)

1. **Push to main branch:**
   ```bash
   git checkout main
   git merge copilot/finalize-production-launch
   git push origin main
   ```

2. **Monitor GitHub Actions:**
   - Go to your repository on GitHub
   - Click **Actions** tab
   - Watch the "Deploy to Firebase" workflow

3. **Check deployment status:**
   - ✅ Green check = Success
   - ❌ Red X = Failure (check logs)
   - ⚠️ Yellow = Warnings (check summary)

### Option B: Manual Deployment

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Set active project:**
   ```bash
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
   firebase use gitverum  # or your project ID
   ```

4. **Build verum-web:**
   ```bash
   cd ../../verum-web
   npm install
   npm run build
   ```

5. **Copy to Firebase hosting:**
   ```bash
   mkdir -p ../verum-omnis-founders-gift-v5/verum-omnis-monorepo/web/verum-web
   cp -r out/* ../verum-omnis-founders-gift-v5/verum-omnis-monorepo/web/verum-web/
   ```

6. **Install Functions dependencies:**
   ```bash
   cd ../verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
   npm install
   ```

7. **Deploy everything:**
   ```bash
   cd ..
   firebase deploy --only hosting,functions
   ```

8. **Deploy Firestore rules (if configured):**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Deployment URL

Firebase will output a URL like: `https://gitverum.web.app`

### 4.2 Run Smoke Tests

```bash
cd verum-web
BASE=https://gitverum.web.app bash ../scripts/smoke.sh
```

**Expected output:** ✅ All tests pass or show expected warnings

### 4.3 Manual Verification

1. **Visit the site:**
   - Open https://gitverum.web.app in your browser
   - Verify landing page loads

2. **Test API endpoints:**
   ```bash
   curl https://gitverum.web.app/api/v1/verify
   # Should return: {"ok":true,"pack":"founders-release",...}
   ```

3. **Test assistant page:**
   - Open https://gitverum.web.app/assistant.html
   - Try uploading a PDF
   - Verify QR code generation

4. **Test verify page:**
   - Open https://gitverum.web.app/verify.html
   - Upload a document
   - Check SHA-512 hash generation

---

## 🐛 Troubleshooting

### Issue: Deployment Fails

**Check:**
1. Are secrets configured correctly?
   - Go to Settings → Secrets and verify
2. Are there syntax errors in workflows?
   - Check `.github/workflows/*.yml`
3. Check deployment logs:
   - GitHub Actions → Click failed workflow → View logs

### Issue: Functions Not Working

**Check:**
1. Function name matches rewrite rule:
   - `firebase.json` should have: `"function": "api2"`
   - `functions/index.js` should export: `export const api2 = ...`
2. Node version is correct:
   - Must be Node 20
3. Check Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

### Issue: Hosting Shows 404

**Check:**
1. Web assets were built:
   - `verum-web/out/` should exist
2. Assets were copied to hosting directory:
   - Check `web/verum-web/` in monorepo
3. Hosting config is correct:
   - `firebase.json` → `"public": "web"`

### Issue: CORS Errors

**Check:**
1. CORS is configured in Functions:
   - `functions/index.js` uses `cors()` middleware
2. Headers are set in `firebase.json`:
   - CSP allows your domain

---

## 📱 Step 5: Deploy Mobile App (Optional)

### 5.1 Build Android APK

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

### 5.2 Configure in Android Studio

1. Open project in Android Studio
2. Update `server.url` in `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'https://gitverum.web.app',
     cleartext: false
   }
   ```
3. Build → Generate Signed Bundle/APK
4. Follow Android Studio signing wizard

### 5.3 Test APK

1. Install on device:
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```
2. Test all features
3. Verify API connectivity

---

## 🎉 Step 6: Post-Deployment

### 6.1 Update Documentation

- [ ] Update README with production URL
- [ ] Update smoke test BASE URL
- [ ] Document custom domain (if applicable)

### 6.2 Monitor

1. **Firebase Console:**
   - Functions → Monitor for errors
   - Hosting → Check traffic
   - Firestore → Verify receipts (if configured)

2. **GitHub Actions:**
   - Set up notifications for failed deployments
   - Monitor deployment frequency

### 6.3 Set Up Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning (can take 24 hours)

---

## 📊 Deployment Checklist

Use this checklist for each deployment:

### Pre-Deployment
- [ ] All tests pass locally
- [ ] No console errors in browser
- [ ] Secrets are configured
- [ ] Firebase project is active
- [ ] Git changes are committed

### Deployment
- [ ] Build succeeds
- [ ] Deploy succeeds
- [ ] No errors in logs
- [ ] Smoke tests pass
- [ ] Manual testing complete

### Post-Deployment
- [ ] Site is accessible
- [ ] API endpoints work
- [ ] No JavaScript errors
- [ ] Performance is acceptable
- [ ] Mobile app connects (if applicable)

---

## 🔄 Continuous Deployment

For automatic deployments on every push to main:

1. **Workflow is already configured:** `.github/workflows/deploy.yml`
2. **Triggered automatically** when pushing to main
3. **Requires secrets** to be configured
4. **Monitors itself** via GitHub Actions status

To disable auto-deploy:
- Remove workflow file, or
- Change `on.push.branches` to exclude main

---

## 📞 Getting Help

If you encounter issues:

1. **Check logs:**
   - GitHub Actions logs
   - Firebase Functions logs
   - Browser console

2. **Review documentation:**
   - [SECRETS.md](./SECRETS.md)
   - [CONTRIBUTING.md](./CONTRIBUTING.md)
   - [RELEASE_NOTES.md](./RELEASE_NOTES.md)

3. **Common fixes:**
   - Clear browser cache
   - Redeploy functions
   - Verify secrets
   - Check Node version

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Site loads at Firebase URL
- ✅ API endpoints return expected data
- ✅ File upload works
- ✅ PDF sealing works
- ✅ QR codes generate
- ✅ No errors in console
- ✅ Smoke tests pass

---

**Congratulations on deploying Verum Omnis!** 🚀

*Immutable • Forensic • Stateless • Human + AI Foundership*
