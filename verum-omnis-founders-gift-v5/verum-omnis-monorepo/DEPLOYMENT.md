# Deployment Guide - Verum Omnis

This guide walks you through completing the deployment setup for the Verum Omnis project.

## ✅ Deployment Readiness Checklist

### Prerequisites Completed
- ✅ All tests passing (6/6 tests verified)
- ✅ Firebase project configured (`gitverum`)
- ✅ CI/CD pipeline configured (`.github/workflows/deploy.yml`)
- ✅ Immutable pack verification working
- ✅ Functions dependencies installed
- ✅ Capacitor app configured

### Remaining Setup Steps

#### 1. Configure Firebase Authentication Token

**Required for automated deployments via GitHub Actions**

**Step-by-step:**

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate a CI token for GitHub Actions
firebase login:ci
```

This will output a token like: `1//0xxxxxxxxxxxxxxxxx`

**Add to GitHub Secrets:**

1. Go to your repository: https://github.com/Liamhigh/verumceleb
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `FIREBASE_TOKEN`
5. Value: Paste the token from the `firebase login:ci` command
6. Click "Add secret"

#### 2. Manual Deployment (Alternative to CI/CD)

If you want to deploy manually without setting up GitHub Actions:

```bash
# Navigate to the project directory
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy hosting and functions
firebase deploy --only hosting,functions --project gitverum
```

**Expected output:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/gitverum/overview
Hosting URL: https://gitverum.web.app
Function URL(s):
  api2(us-central1): https://us-central1-gitverum.cloudfunctions.net/api2
```

#### 3. Verify Deployment

After deployment, verify the application is working:

**Web Application:**
```bash
# Visit your hosting URL
open https://gitverum.web.app

# Or custom domain if configured
open https://your-custom-domain.com
```

**API Health Check:**
```bash
# Test the API endpoint
curl https://us-central1-gitverum.cloudfunctions.net/api2/v1/verify
```

Expected response:
```json
{
  "status": "ok",
  "service": "Verum Omnis API v1",
  "timestamp": "2025-10-20T08:59:27.000Z"
}
```

**Test Document Sealing:**
```bash
# Test hash anchoring
curl -X POST https://us-central1-gitverum.cloudfunctions.net/api2/v1/anchor \
  -H "Content-Type: application/json" \
  -d '{"hash": "abc123", "metadata": {"type": "test"}}'
```

#### 4. Mobile App Deployment

**Android:**

1. Build the web assets:
   ```bash
   cd capacitor-app
   npm run build
   npx cap sync android
   ```

2. Open in Android Studio:
   ```bash
   npx cap open android
   ```

3. In Android Studio:
   - Build → Generate Signed Bundle/APK
   - Follow the wizard to create a keystore and sign the APK
   - Upload to Google Play Console

**iOS (when ready):**

1. Build the web assets:
   ```bash
   cd capacitor-app
   npm run build
   npx cap sync ios
   ```

2. Open in Xcode:
   ```bash
   npx cap open ios
   ```

3. In Xcode:
   - Configure signing with your Apple Developer account
   - Archive and upload to App Store Connect

## 🔧 Deployment Configuration

### Firebase Configuration

**Project:** `gitverum`

**Files:**
- `.firebaserc` - Project selection
- `firebase.json` - Hosting and functions configuration
- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Database indexes

### CI/CD Pipeline

**Workflow:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch → Test + Deploy
- Pull request to `main` → Test only

**Jobs:**
1. **Test Job:**
   - Node.js 20 setup
   - Java 21 setup (for Android tests)
   - Install dependencies
   - Run immutable pack verification
   - Run comprehensive API tests
   - Build Capacitor app
   - Run Android unit tests

2. **Deploy Job** (main branch only):
   - Install Firebase CLI
   - Install dependencies
   - Deploy to Firebase (hosting + functions)

### Environment Variables

**Required for CI/CD:**
- `FIREBASE_TOKEN` - Firebase CI authentication token

**Optional:**
- Set in Firebase console → Project settings → Service accounts
- For production, consider using workload identity federation

## 🚨 Troubleshooting

### Issue: "Firebase login required"
**Solution:** Run `firebase login` or set `FIREBASE_TOKEN` environment variable

### Issue: "Functions deployment failed"
**Possible causes:**
1. Node version mismatch (requires Node 20)
2. Missing dependencies (run `npm ci` in functions/)
3. Billing not enabled on Firebase project

**Solution:**
```bash
# Verify Node version
node --version  # Should show v20.x.x

# Install dependencies
cd functions && npm ci

# Check Firebase project billing
firebase projects:list
```

### Issue: "Immutable pack verification failed"
**Cause:** Constitutional rules files were modified

**Solution:** This is a security feature. Do NOT modify files in `functions/assets/rules/` or `functions/assets/treaty/` unless following the documented governance process.

### Issue: "Capacitor sync failed"
**Solution:**
```bash
cd capacitor-app
rm -rf node_modules
npm install
npx cap sync
```

### Issue: "Android build failed"
**Common causes:**
1. Java version (requires Java 21)
2. Gradle cache issues
3. Missing Android SDK components

**Solution:**
```bash
# Verify Java version
java --version  # Should show version 21

# Clear Gradle cache
cd android
./gradlew clean --no-daemon

# Rebuild
./gradlew assembleDebug
```

## 📊 Deployment Validation

After deployment, run these validation checks:

### 1. Web Application
- [ ] Landing page loads (/)
- [ ] Verify page loads (/verify.html)
- [ ] Legal page loads (/legal.html)
- [ ] Logo assets display correctly
- [ ] Forms are functional

### 2. API Endpoints
- [ ] GET /v1/verify returns 200
- [ ] POST /v1/anchor works
- [ ] POST /v1/seal generates PDF
- [ ] Error responses are proper JSON

### 3. Mobile App
- [ ] App installs without errors
- [ ] Web content loads in app
- [ ] Navigation works
- [ ] No console errors

### 4. Security
- [ ] Immutable pack verifies on cold start
- [ ] CORS headers are set correctly
- [ ] Rate limiting is active
- [ ] No sensitive data in logs

### 5. Performance
- [ ] Functions cold start < 3 seconds
- [ ] Page load time < 2 seconds
- [ ] PDF generation < 5 seconds
- [ ] API responses < 500ms (excluding PDF)

## 🔄 Regular Deployment Process

Once initial setup is complete, deployments are automatic:

1. **Make changes** in a feature branch
2. **Create pull request** → CI runs tests
3. **Merge to main** → CI deploys automatically
4. **Monitor deployment** in GitHub Actions
5. **Verify** at https://gitverum.web.app

## 📱 App Store Deployment (Future)

### Google Play Store
1. Build signed APK/AAB
2. Create Play Console account
3. Upload app listing (description, screenshots, etc.)
4. Submit for review
5. Wait for approval (typically 1-3 days)

### Apple App Store
1. Build and archive in Xcode
2. Upload to App Store Connect
3. Create app listing
4. Submit for review
5. Wait for approval (typically 1-5 days)

**Store Assets Needed:**
- App icon (512x512 PNG)
- Screenshots (various device sizes)
- Feature graphic
- Privacy policy URL
- App description and keywords
- Support contact information

## 🎯 Production Checklist

Before going to production:

- [ ] FIREBASE_TOKEN configured in GitHub Secrets
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Firebase)
- [ ] Firestore security rules reviewed
- [ ] Error monitoring set up (Firebase Crashlytics)
- [ ] Analytics configured (optional)
- [ ] Backup strategy defined
- [ ] Incident response plan documented
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email configured
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Compliance requirements met

## 📞 Support

If you encounter issues:

1. Check Firebase Console → Functions → Logs
2. Check GitHub Actions → Workflow runs
3. Review TESTING.md for test procedures
4. Check .github/copilot-instructions.md for development guidelines

## 🔐 Security Notes

- Never commit `FIREBASE_TOKEN` to the repository
- Keep Firebase service account keys secure
- Regularly review Firestore security rules
- Monitor Firebase usage for anomalies
- Follow the constitutional rules update process for governance changes

---

**Status:** ✅ Deployment configuration complete and tested  
**Last Updated:** 2025-10-20  
**Next Action:** Configure FIREBASE_TOKEN in GitHub Secrets for automated deployments
