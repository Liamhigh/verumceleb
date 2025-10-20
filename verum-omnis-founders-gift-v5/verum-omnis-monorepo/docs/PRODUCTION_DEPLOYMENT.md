# Production Deployment Runbook

The following steps harden Verum Omnis for production release. Complete each section **before** opening the production gate.

## 1. GitHub Actions Secrets

The CI workflow in `.github/workflows/deploy.yml` requires a Firebase CI token. If a run fails with `Context access might be invalid: FIREBASE_TOKEN`, the secret is either missing or expired.

1. Generate a fresh token:
   ```bash
   firebase login:ci
   ```
2. Copy the token value.
3. Navigate to **GitHub → Settings → Secrets and variables → Actions**.
4. Add a new repository secret named `FIREBASE_TOKEN` and paste the token.
5. Re-run the failed workflow from the GitHub Actions tab.

> 🔁 **Refresh cadence:** Firebase CLI tokens expire periodically. Regenerate the token every 90 days or after rotating credentials.

## 2. Firebase Project Hardening

| Area | Action | Notes |
| --- | --- | --- |
| Hosting | Add custom domain via Firebase Console → Hosting → Custom domain | Configure A/AAAA records with registrar and enable automatic HTTPS |
| Functions | Enable **minimum instances = 1** for `api2` | Reduces cold starts for production workloads |
| Firestore | Enable **production mode** and set location `us-central` (or region of choice) | Required for durable receipt storage |
| Security | Set up IAM roles: `firebasehosting.admin`, `cloudfunctions.developer`, `firestore.user` for deploy bot | Principle of least privilege |
| Monitoring | Enable Cloud Logging & Error Reporting alerts | Route critical alerts to on-call channel |

## 3. Receipt Persistence

1. Create Firestore collection `receipts` (or update config) for persistent receipt storage.
2. Configure TTL (if required) or retention policies.
3. Verify Firestore indexes from `firestore.indexes.json` have been deployed:
   ```bash
   firebase deploy --only firestore:indexes
   ```
4. Validate read/write security rules in `firestore.rules`.

## 4. Observability & Alerts

- **Uptime checks:** Configure Cloud Monitoring uptime for `https://<your-domain>/api/v1/verify`.
- **Error budgets:** Create alert for Cloud Functions error rate > 1% over 5 minutes.
- **Logging sinks:** Route audit logs to BigQuery or Cloud Storage for long-term retention.
- **Receipt verification:** Schedule a nightly job to call `tests/e2e/run-e2e.js` against staging.

## 5. Custom Domain Checklist

1. Reserve domain with registrar (ensure WHOIS privacy as needed).
2. Add domain in Firebase Hosting → follow DNS TXT verification.
3. Point `A` records to `151.101.1.195` (Firebase hosting) or use provided addresses.
4. Wait for SSL certificate provisioning (up to 24 hours).
5. Confirm `https://yourdomain` serves production build.
6. Update `capacitor.config.ts` with the new production URL before mobile release.

## 6. Mobile Release Pipeline

- **Android Keystore:** Generate Play Store keystore and store secrets via GitHub Encrypted Secrets or Play Console.
- **Versioning:** Update `android/app/build.gradle` versionCode/versionName per release.
- **Store assets:** Provide 512×512 icons and 1024×500 feature graphics derived from `/web/assets/logo.png`.
- **CI Hooks:** Extend `.github/workflows/deploy.yml` with Play Store upload once credentials are ready.

## 7. Launch Verification

1. Run the local end-to-end script against production base:
   ```bash
   node tests/e2e/run-e2e.js --base https://gitverum.web.app/api/v1
   ```
2. Trigger manual sealing via `/verify.html` and confirm PDF watermarking, QR, and SHA-512.
3. Validate immutable rules hash by calling `/api/v1/verify`.
4. Capture screenshots for release notes and compliance packages.

## 8. Incident Response

- Document runbooks in this folder for:
  - Immutable pack failure
  - Firestore outage
  - PDF generation errors
- Set up on-call rotation and escalation matrix.
- Maintain a public status page (e.g., via GitHub Pages) for transparency.

---

**Immutable Governance Reminder:** Any change to `functions/assets/rules/*` must follow the constitutional update protocol (hash regeneration, manifest update, RULES_PACK_HASH bump, anchoring). Production deploys will fail if hashes drift.
