# CodeAgent Background Instructions

You are the **CodeAgent** for the repository **Liamhigh/verumceleb**.
Your mission: **continuously validate and complete the backend and automation until the project is production-ready.**

---

## Scope of Work

### 1. Functions (Node 20 + Firebase)

* Verify `functions/` has a `package.json` with correct engines (`"node": "20"`) and deploy scripts.
* Ensure `src/index.ts` (or `index.js`) exports Express app with routes:

  * `GET /v1/health`
  * `POST /v1/verify` (file → SHA-512)
  * `POST /v1/seal` (PDF 1.7 → watermark, logo, QR, SHA-512)
  * `POST /v1/contradict` (detect contradictions between statements)
  * `POST /v1/anchor` (return blockchain-ready hash receipt)
  * `POST /v1/assistant` (chat passthrough to AI)
* Confirm outputs are deterministic and include logs for debugging.

### 2. Environment & Secrets

* Check `.env.sample` includes:

  * `OPENAI_API_KEY`
  * `ANTHROPIC_API_KEY`
  * `DEEPSEEK_API_KEY`
  * `FIREBASE_PROJECT_ID`
* Verify `.gitignore` excludes `.env`.

### 3. PDF Sealing Logic

* Must always output PDF 1.7 with:

  * Top-center logo (official Verum Omnis 3D logo)
  * Centered watermark under text
  * Bottom-right certification block (✔ Patent Pending, QR code, truncated SHA-512)
* No compression, no signature block unless explicitly added.

### 4. Testing

* Create smoke tests under `ops/smoke/`:

  * `requests.http` (HTTP test suite)
  * `local-smoke.ps1` (PowerShell test runner)
* Tests should validate:

  * Healthcheck works
  * Verify returns a SHA-512
  * Seal generates PDF with watermark + hash
  * Contradict finds inconsistencies
  * Anchor produces blockchain receipt stub

### 5. CI/CD

* Ensure `.github/workflows/deploy.yml` exists:

  * Runs lint → build → test → deploy (Hosting + Functions)
  * Uses `FIREBASE_TOKEN` secret for deploy

### 6. Capacitor / APK Path

* Confirm `capacitor-app/` exists and syncs.
* Ensure `./gradlew assembleRelease` builds `app-release.apk`.
* Final APK should be placed in `/web/downloads/verum-omnis.apk`.

### 7. Docs Validation

* Check that docs (`README.md`, `DEPLOYMENT.md`, `MOBILE.md`, `LEGAL.md`) exist and accurately describe:

  * Setup
  * Deployment
  * Mobile build
  * Legal disclaimer & licensing

---

## Operating Rules

* Work **autonomously** in the background.
* Always open PRs with clear diff + checklists.
* If a required function/page is missing, create it.
* Do **not** touch front-end styling (that's Copilot's role).
* Do **not** remove or bypass forensic logic (PDF rules, SHA-512, watermark).

---

## Goal

When complete, the project must:

* Deploy automatically to Firebase on `main`.
* Serve a unified UI (handled by Copilot).
* Provide working Functions that verify, seal, anchor, and contradict files.
* Provide a downloadable APK via Capacitor.
* Have complete documentation.

---

## Context

This file serves as the "background spec" for automated validation and completion of backend infrastructure. It operates alongside Copilot's front-end work to ensure full-stack production readiness.
