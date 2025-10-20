# 🚀 Quick Deployment Reference

## Current Status: ✅ READY TO DEPLOY

All tests passing, configuration verified, deployment workflow configured.

## Required Actions (2 steps)

### 1️⃣ Configure FIREBASE_TOKEN (One-time setup)

```bash
# Run locally (requires Firebase CLI)
firebase login:ci

# Copy the displayed token (e.g., 1//0abc...xyz)
```

Then add to GitHub:
1. Go to: https://github.com/Liamhigh/verumceleb/settings/secrets/actions
2. Click **New repository secret**
3. Name: `FIREBASE_TOKEN`
4. Value: Paste the token
5. Click **Add secret**

### 2️⃣ Deploy

```bash
# Option A: Merge this PR to trigger auto-deployment
# GitHub Actions will automatically deploy to Firebase

# Option B: Manual merge
cd /home/runner/work/verumceleb/verumceleb
git checkout main
git merge copilot/vscode1760955344063
git push origin main
```

## Monitor Deployment

Watch deployment progress:
- GitHub Actions: https://github.com/Liamhigh/verumceleb/actions
- Expected deploy time: ~5-10 minutes

## Verify Deployment

After successful deployment:
- **Website**: https://gitverum.web.app
- **API Health Check**: https://us-central1-gitverum.cloudfunctions.net/api2/v1/verify
- **Functions Console**: https://console.firebase.google.com/project/gitverum/functions

## What Gets Deployed

✅ **Hosting** (Static web files from `web/`)
- Landing page (`index.html`)
- Verification interface (`verify.html`)
- Legal documentation (`legal.html`)
- Logo assets and styles

✅ **Functions** (Backend API from `functions/`)
- Function name: `api2`
- Endpoints: `/v1/verify`, `/v1/anchor`, `/v1/seal`
- Immutable pack verification
- Firestore receipt storage

✅ **Firestore** (Database rules and indexes)
- Receipt storage collection
- Security rules from `firestore.rules`

## Project Details

- **Firebase Project ID**: `gitverum`
- **Node Version**: 20 (ESM modules)
- **Function Runtime**: Node.js 20
- **Region**: us-central1

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing FIREBASE_TOKEN secret | Run `firebase login:ci` and add token to GitHub Secrets |
| Tests failing | Check GitHub Actions logs; tests must pass before deployment |
| Immutable pack error | Don't modify `functions/assets/rules/` without governance process |
| Permission denied | Verify Firebase project access and IAM roles |

## For Full Details

See `DEPLOYMENT_GUIDE.md` for comprehensive instructions, troubleshooting, and security notes.

---

**⚡ Quick Summary**: Configure `FIREBASE_TOKEN` secret, then merge to `main`. GitHub Actions handles the rest!
