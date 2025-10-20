# Verum Omnis Deployment Guide

This guide provides step-by-step instructions for deploying the Verum Omnis application to production.

## 🎯 Overview

Verum Omnis uses **GitHub Actions** for automated CI/CD. When code is pushed to the `main` branch, the workflow automatically:
1. Runs tests (immutable pack verification, API tests, Android unit tests)
2. Deploys to Firebase (hosting + functions) if tests pass

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] **Firebase Project**: `gitverum` project must exist in Firebase Console
- [ ] **Firebase CLI Access**: Ability to run `firebase login:ci` locally
- [ ] **GitHub Repository Access**: Admin permissions to add secrets
- [ ] **All Tests Passing**: Local verification completed

## 🔐 Step 1: Configure FIREBASE_TOKEN Secret

The GitHub Actions workflow requires a `FIREBASE_TOKEN` secret to authenticate with Firebase.

### Generate Firebase CI Token

Run this command locally (requires Firebase CLI):

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login and generate CI token
firebase login:ci
```

This command will:
1. Open your browser for Firebase authentication
2. Display a CI token (e.g., `1//0abc...xyz`)
3. **Copy this token** - you'll need it in the next step

### Add Token to GitHub Secrets

1. Navigate to your GitHub repository: `https://github.com/Liamhigh/verumceleb`
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_TOKEN`
5. Value: Paste the token from `firebase login:ci`
6. Click **Add secret**

## 🚀 Step 2: Deploy via GitHub Actions

Once the `FIREBASE_TOKEN` secret is configured:

### Option A: Automatic Deployment (Recommended)

Simply push to the `main` branch:

```bash
cd /home/runner/work/verumceleb/verumceleb

# Merge your changes to main
git checkout main
git merge copilot/vscode1760955344063
git push origin main
```

The deployment will automatically trigger. Monitor progress at:
`https://github.com/Liamhigh/verumceleb/actions`

### Option B: Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Firebase** workflow
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow**

## 📊 Step 3: Monitor Deployment

### GitHub Actions Dashboard

1. Navigate to: `https://github.com/Liamhigh/verumceleb/actions`
2. Click on the running workflow
3. Monitor the following steps:
   - ✅ Test Functions (verify immutable pack)
   - ✅ Run comprehensive API tests
   - ✅ Run Android unit tests
   - ✅ Deploy to Firebase

### Expected Output

If successful, you'll see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/gitverum/overview
Hosting URL: https://gitverum.web.app
Functions URL: https://us-central1-gitverum.cloudfunctions.net/api2
```

## 🔍 Step 4: Verify Deployment

### Test the Live Site

1. **Visit the website**: `https://gitverum.web.app`
2. **Check API health**: `https://us-central1-gitverum.cloudfunctions.net/api2/v1/verify`
3. **Test document sealing**: Navigate to `/verify.html` and try sealing a document

### Expected API Response

```json
{
  "status": "ok",
  "service": "Verum Omnis API",
  "version": "1.0.0",
  "timestamp": "2025-10-20T10:16:41.521Z"
}
```

## 🐛 Troubleshooting

### Error: "Context access might be invalid: FIREBASE_TOKEN"

**Cause**: The `FIREBASE_TOKEN` secret is missing or expired.

**Solution**:
1. Generate a new token: `firebase login:ci`
2. Update the GitHub secret with the new token
3. Re-run the failed workflow

### Error: "Immutable pack verification failed"

**Cause**: Constitutional rules files have been modified without proper governance.

**Solution**:
1. Review changes in `functions/assets/rules/`
2. Follow the constitutional update process (see `.github/copilot-instructions.md`)
3. Regenerate SHA-512 hashes and update `manifest.json`

### Error: "Build failed" or "Tests failed"

**Cause**: Code changes broke existing functionality.

**Solution**:
1. Review the GitHub Actions logs for specific error messages
2. Run tests locally: `cd functions && node test-api.js`
3. Fix the issues and push again

### Error: "Permission denied" during deployment

**Cause**: Firebase CLI lacks necessary permissions.

**Solution**:
1. Verify the Firebase project ID in `.firebaserc` is `gitverum`
2. Check IAM permissions in Firebase Console
3. Ensure the account that generated the token has deployment rights

## 📝 Post-Deployment Checklist

After successful deployment:

- [ ] **Verify website loads**: Visit `https://gitverum.web.app`
- [ ] **Test API endpoints**: Check `/api/v1/verify`, `/api/v1/anchor`, `/api/v1/seal`
- [ ] **Test document sealing**: Upload a document and verify PDF generation
- [ ] **Check Firestore**: Verify receipt storage is working
- [ ] **Test mobile app**: Update Capacitor config to point to production URL
- [ ] **Set up monitoring**: Configure Cloud Monitoring uptime checks
- [ ] **Update documentation**: Document any configuration changes

## 🔄 Ongoing Maintenance

### Token Refresh

Firebase CI tokens expire periodically. Regenerate every **90 days** or when rotated:

```bash
firebase login:ci
# Update GitHub secret with new token
```

### Deployment Cadence

- **Development**: Push to feature branches, merge to `main` when ready
- **Production**: Every merge to `main` triggers automatic deployment
- **Hotfixes**: Create hotfix branch, test, merge to `main`

## 🔒 Security Notes

- Never commit `FIREBASE_TOKEN` to the repository
- Store all secrets in GitHub Secrets, never in code
- Follow principle of least privilege for Firebase IAM roles
- Rotate tokens after team member changes

## 📚 Additional Resources

- **Firebase Console**: https://console.firebase.google.com/project/gitverum
- **GitHub Actions**: https://github.com/Liamhigh/verumceleb/actions
- **Production Deployment Runbook**: `verum-omnis-founders-gift-v5/verum-omnis-monorepo/docs/PRODUCTION_DEPLOYMENT.md`
- **Testing Guide**: `verum-omnis-founders-gift-v5/verum-omnis-monorepo/TESTING.md`
- **AI Agent Instructions**: `.github/copilot-instructions.md`

## 📞 Support

For issues or questions:
1. Check GitHub Actions logs for error details
2. Review `SECURITY_SUMMARY.md` for security-related issues
3. Consult `TESTING.md` for test-related problems
4. Create a GitHub Issue with deployment logs attached

---

**Constitutional Notice**: This system implements cryptographically enforced governance. Any changes to `functions/assets/rules/*` files require following the documented constitutional update process.
