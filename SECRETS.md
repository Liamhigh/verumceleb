# Required Secrets for Deployment

This document lists all required secrets for deploying and building the Verum Omnis project.

## GitHub Actions Secrets

Configure these in your GitHub repository settings: **Settings → Secrets and variables → Actions**

### Required for Firebase Deployment

#### `FIREBASE_SERVICE_ACCOUNT`
**Type:** JSON (stored as base64 or JSON string)  
**Purpose:** Firebase Admin SDK authentication for deploying functions and hosting  
**How to get:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`gitverum`)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Copy the entire JSON content or base64 encode it

**To set as secret:**
```bash
# Option 1: Copy JSON content directly
cat service-account.json
# Copy output and paste into GitHub secret

# Option 2: Base64 encode (recommended)
cat service-account.json | base64 | pbcopy  # macOS
cat service-account.json | base64 -w 0      # Linux
# Paste into GitHub secret
```

#### `FIREBASE_PROJECT_ID`
**Type:** String  
**Purpose:** Firebase project identifier  
**Value:** `gitverum` (or your Firebase project ID)  
**How to get:**
1. Go to Firebase Console
2. Project Settings
3. Copy "Project ID"

### Optional (Required for Signed Android Builds)

#### `ANDROID_KEYSTORE`
**Type:** Base64-encoded file  
**Purpose:** Android app signing keystore  
**How to create:**
```bash
# Create keystore
keytool -genkey -v -keystore verum-release.keystore \
  -alias verum-omnis -keyalg RSA -keysize 2048 -validity 10000

# Encode to base64
cat verum-release.keystore | base64 | pbcopy  # macOS
cat verum-release.keystore | base64 -w 0      # Linux
```

**⚠️ IMPORTANT:** Keep the original keystore file secure and backed up. If lost, you cannot update your app on Play Store!

#### `ANDROID_KEY_ALIAS`
**Type:** String  
**Purpose:** Alias used when creating the keystore  
**Example:** `verum-omnis`

#### `ANDROID_KEYSTORE_PASSWORD`
**Type:** String  
**Purpose:** Password for the keystore file  
**Security:** Use a strong password (20+ characters)

#### `ANDROID_KEY_PASSWORD`
**Type:** String  
**Purpose:** Password for the specific key alias  
**Note:** Can be the same as keystore password

## Environment Variables (Optional)

These can be set in Firebase Functions configuration:

### `GOOGLE_APPLICATION_CREDENTIALS`
**Type:** File path  
**Purpose:** Points to service account JSON for local development  
**Local setup:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

**Not needed in production** - Firebase Functions automatically use the deployed service account.

### `SKIP_IMMUTABLE_VERIFY`
**Type:** String (`1` or `true`)  
**Purpose:** Skip constitutional file verification (testing only)  
**Usage:**
```bash
# For local testing
export SKIP_IMMUTABLE_VERIFY=1
npm test
```

**⚠️ NEVER set this in production!** It bypasses critical security checks.

## Secret Security Best Practices

### DO ✅
- Store secrets in GitHub Secrets (encrypted at rest)
- Use strong, unique passwords for keystores
- Rotate service account keys regularly
- Use separate service accounts for dev/staging/prod
- Back up keystore files securely (encrypted storage)
- Use environment-specific secrets

### DON'T ❌
- Commit secrets to Git
- Share secrets in Slack/email/Discord
- Use weak passwords
- Reuse passwords across services
- Store secrets in plain text files
- Include secrets in screenshots or logs

## Verifying Secrets

### Check if secrets are set (locally)
```bash
# This will fail if secrets are missing (expected in CI)
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_SERVICE_ACCOUNT | wc -c  # Should be >100 chars
```

### Check in GitHub Actions
1. Go to repository → Actions
2. Click on a workflow run
3. Check "Check Required Secrets" job
4. Look for warnings like: `MISSING_SECRET:FIREBASE_SERVICE_ACCOUNT`

## Troubleshooting

### "MISSING_SECRET" warnings in Actions
**Cause:** Secret not configured in GitHub repository settings  
**Fix:** Add the missing secret following instructions above

### "Permission denied" when deploying
**Cause:** Invalid or expired service account key  
**Fix:** Regenerate service account key and update secret

### Mobile build fails with signing error
**Cause:** Missing or incorrect Android signing secrets  
**Fix:** 
1. Check that all 4 Android secrets are set
2. Verify keystore alias matches
3. Verify passwords are correct

### Firestore receipts not persisting
**Cause:** No service account configured  
**Fix:** Set `FIREBASE_SERVICE_ACCOUNT` secret  
**Note:** System falls back to in-memory storage when no credentials available

## Production Checklist

Before deploying to production, ensure:

- [ ] `FIREBASE_SERVICE_ACCOUNT` is set and valid
- [ ] `FIREBASE_PROJECT_ID` matches your Firebase project
- [ ] Service account has required permissions:
  - Cloud Functions Admin
  - Firebase Hosting Admin
  - Cloud Firestore User (if using Firestore)
- [ ] (For mobile) Android keystore created and backed up
- [ ] (For mobile) All 4 Android secrets configured
- [ ] No secrets committed to Git (run `git log -p | grep -i password`)
- [ ] `.gitignore` includes all secret file patterns

## Secret Rotation

Rotate secrets periodically (recommended: every 90 days):

### Firebase Service Account
1. Generate new key in Firebase Console
2. Update GitHub secret
3. Deploy to verify it works
4. Delete old key from Firebase Console

### Android Keystore
**⚠️ CRITICAL:** Cannot rotate keystore for published apps!  
Once published, you must use the same keystore forever.  
Instead, secure it properly from the start.

## Additional Resources

- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## Quick Reference

| Secret Name | Required? | Type | Used For |
|-------------|-----------|------|----------|
| `FIREBASE_SERVICE_ACCOUNT` | ✅ Yes | JSON/Base64 | Firebase deployment |
| `FIREBASE_PROJECT_ID` | ✅ Yes | String | Firebase project identification |
| `ANDROID_KEYSTORE` | ⚠️ Mobile only | Base64 file | Android app signing |
| `ANDROID_KEY_ALIAS` | ⚠️ Mobile only | String | Keystore alias |
| `ANDROID_KEYSTORE_PASSWORD` | ⚠️ Mobile only | String | Keystore password |
| `ANDROID_KEY_PASSWORD` | ⚠️ Mobile only | String | Key password |

---

*Last updated: 2025-10-21*  
*Immutable • Forensic • Stateless • Human + AI Foundership*
