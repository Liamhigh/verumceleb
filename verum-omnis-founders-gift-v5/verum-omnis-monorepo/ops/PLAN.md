# Verum Omnis — Project Completion Plan

**Created:** 2025-10-26
**Branch:** `ops/finish-line`
**Goal:** Autonomous completion of the Verum Omnis project across 7 milestones

---

## Milestone Overview (Gantt-style)

| Milestone | Duration | Dependencies | Status |
|-----------|----------|--------------|--------|
| M0: Kickoff & Self-Plan | 1 hour | None | ✅ In Progress |
| M1: Full Repo Audit | 2 hours | M0 | ⏳ Pending |
| M2: Functions Hardening | 4 hours | M1 | ⏳ Pending |
| M3: PDF Sealing Conformance | 3 hours | M1 | ⏳ Pending |
| M4: Contradiction Engine | 3 hours | M2 | ⏳ Pending |
| M5: Local DX (Emulator/Smoke) | 2 hours | M2, M3, M4 | ⏳ Pending |
| M6: CI/CD Pipeline | 2 hours | M5 | ⏳ Pending |
| M7: Android APK (Capacitor) | 3 hours | M1 | ⏳ Pending |

**Total Estimated Duration:** 20 hours

---

## Milestone 0 — Kickoff & Self-Plan ✅

**Branch:** `ops/finish-line`
**Duration:** 1 hour
**Status:** In Progress

### Tasks
- [x] Create `ops/finish-line` branch
- [x] Create `ops/PLAN.md` (this document)
- [x] Create `ops/STATUS.md` (heartbeat tracking)
- [ ] Initial commit

### Deliverables
- ✅ `ops/PLAN.md` — This comprehensive plan
- ✅ `ops/STATUS.md` — Heartbeat status tracker

---

## Milestone 1 — Full Repo Audit & Gap Analysis

**Branch:** `ops/audit` (PR → `ops/finish-line`)
**Duration:** 2 hours
**Status:** Pending

### Tasks
- [ ] Auto-inventory all directories (web/, functions/, capacitor-app/, .github/)
- [ ] Map all endpoints and their contracts
  - [ ] `/v1/assistant` (modes: verify, policy, anchor, receipt, notice)
  - [ ] `/v1/verify` 
  - [ ] `/v1/contradict`
  - [ ] `/v1/anchor`
  - [ ] `/v1/seal`
  - [ ] `/health`
  - [ ] `/chat`
- [ ] Trace Nine-Brain/Contradiction logic
- [ ] Trace triple-model ensemble hooks (OpenAI/Anthropic/DeepSeek)
- [ ] Trace PDF sealing pipeline (libs, coordinates, fonts, compression)
- [ ] Document security posture (CORS, Helmet, rate-limit, idempotency)
- [ ] Create risk assessment table

### Deliverables
- [ ] `docs/AUDIT.md` — Complete inventory with file paths and code refs
- [ ] Risk assessment table

### Acceptance Criteria
- `docs/AUDIT.md` contains concrete file paths + code references
- All routes discovered or explicitly justified if absent

---

## Milestone 2 — Functions Hardening & Health

**Branch:** `ops/functions-hardening` (PR → `ops/finish-line`)
**Duration:** 4 hours
**Dependencies:** M1
**Status:** Pending

### Tasks
- [ ] Set Node 20 in `engines` + create `.nvmrc`
- [ ] Add strict TypeScript configuration
- [ ] Set up `tsup` bundler with sourcemaps
- [ ] Add middleware stack:
  - [ ] `helmet` for security headers
  - [ ] `compression` for response compression
  - [ ] Tight CORS configuration (verumglobal.foundation, *.web.app, localhost:5173)
  - [ ] `express-rate-limit` (60/min/IP)
- [ ] Add size limits:
  - [ ] JSON body: 2 MB
  - [ ] File uploads with `multer`: 16-50 MB per route
- [ ] Implement input validation with `zod`:
  - [ ] Create schemas for each endpoint
  - [ ] Reject unknown fields → `400 VO_E_INPUT`
- [ ] Add idempotency support:
  - [ ] `Idempotency-Key` header for `/v1/seal`
  - [ ] `Idempotency-Key` header for `/v1/anchor`
- [ ] Create `/v1/health` endpoint
  - [ ] Return `{ ok, env, uptime, versions }`
- [ ] Implement error taxonomy
  - [ ] Create `voError(code, http, details)` helper
- [ ] Set up structured logging with `pino`
- [ ] Create `functions/.env.sample` with all required env vars
- [ ] Add fail-fast validation for missing env vars

### Deliverables
- [ ] Updated `functions/package.json` with new dependencies
- [ ] `functions/.nvmrc` (v20)
- [ ] `functions/tsconfig.json` (strict mode)
- [ ] `functions/.env.sample`
- [ ] Middleware configuration
- [ ] Updated route handlers

### Acceptance Criteria
- Emulator smoke test passes
- No CORS errors from web on localhost
- Lint and typecheck pass cleanly

---

## Milestone 3 — PDF Sealing Conformance

**Branch:** `ops/pdf-seal-conformance` (PR → `ops/finish-line`)
**Duration:** 3 hours
**Dependencies:** M1
**Status:** Pending

### Tasks
- [ ] Enforce PDF 1.7 standard
- [ ] Disable JavaScript and external assets in PDFs
- [ ] Preserve forensic stability (compression settings)
- [ ] Implement layout guarantees:
  - [ ] Logo top-center
  - [ ] Center watermark (under all text)
  - [ ] QR code bottom-right
  - [ ] Visible SHA-512 on certification page
  - [ ] Fix any z-order/overflow issues
- [ ] Define QR payload structure:
  ```json
  { 
    "sha512": "...", 
    "meta": { 
      "filename": "...", 
      "bytes": 123, 
      "createdAt": "ISO-8601" 
    } 
  }
  ```
- [ ] Strip EXIF unless opted-in
- [ ] Create test that inspects generated PDF objects
- [ ] Assert presence and positions of all elements

### Deliverables
- [ ] Updated PDF generation code
- [ ] Test suite for PDF validation
- [ ] Golden sample PDF (attached as PR artifact)
- [ ] Visual check screenshots

### Acceptance Criteria
- Golden sample PDF attached to PR
- All tests assert pass
- Manual visual check confirms correct layout

---

## Milestone 4 — Contradiction Engine & Triple-Model Hooks

**Branch:** `ops/contradiction-engine` (PR → `ops/finish-line`)
**Duration:** 3 hours
**Dependencies:** M2
**Status:** Pending

### Tasks
- [ ] Define `/v1/contradict` contract:
  - Input: `{ items: [texts|docRefs], mode: "quick"|"full" }`
  - Output: `{ contradictions: [{where, why, severity}], summary, traces? }`
- [ ] Create ensemble adaptor:
  - [ ] OpenAI integration (with timeout)
  - [ ] Anthropic integration (with timeout)
  - [ ] DeepSeek integration (with timeout)
  - [ ] Partial-result fallback logic
  - [ ] Per-model env toggle
- [ ] Implement degraded mode when keys absent
  - [ ] Return clear flag indicating degraded operation
  - [ ] Still provide basic functionality
- [ ] Add timeout enforcement (25s cap per request)
- [ ] Prevent route hangs

### Deliverables
- [ ] `/v1/contradict` endpoint implementation
- [ ] Multi-model ensemble router
- [ ] Environment variable configuration
- [ ] Timeout and fallback handling

### Acceptance Criteria
- Emulator demo request returns structured contradictions array
- Timeouts enforced (25s cap)
- Never hangs the route
- Works in degraded mode without API keys

---

## Milestone 5 — Local DX: Emulator & Smoke Scripts

**Branch:** `ops/smoke` (PR → `ops/finish-line`)
**Duration:** 2 hours
**Dependencies:** M2, M3, M4
**Status:** Pending

### Tasks
- [ ] Create `ops/smoke/requests.http` (REST Client format)
- [ ] Create `ops/smoke/local-smoke.ps1` (PowerShell, no prompt prefixes)
- [ ] Create `ops/smoke/local-smoke.sh` (Bash)
- [ ] Implement smoke test calls:
  - [ ] `GET /v1/health`
  - [ ] `POST /v1/verify` (with file)
  - [ ] `POST /v1/seal` (with file + title)
  - [ ] `POST /v1/contradict` (with two statements)
  - [ ] `POST /v1/anchor` with `Idempotency-Key` (dry-run)
- [ ] Add color-coded output (green/red)
- [ ] Add timing information

### Deliverables
- [ ] `ops/smoke/requests.http`
- [ ] `ops/smoke/local-smoke.ps1`
- [ ] `ops/smoke/local-smoke.sh`

### Acceptance Criteria
- All endpoints return 2xx with valid JSON on emulator
- Scripts print green/red status with timings

---

## Milestone 6 — CI/CD: Lint → Build → Test → Deploy

**Branch:** `ops/ci-deploy` (PR → `ops/finish-line`)
**Duration:** 2 hours
**Dependencies:** M5
**Status:** Pending

### Tasks
- [ ] Create/update `.github/workflows/deploy.yml`:
  - [ ] Node 20 setup
  - [ ] `npm ci` for root + functions
  - [ ] Lint step
  - [ ] Build step
  - [ ] Test step (vitest)
  - [ ] Deploy to Firebase (Hosting + Functions) on `main` branch
  - [ ] Use `${{ secrets.FIREBASE_TOKEN }}` or service account
- [ ] Configure artifact uploads:
  - [ ] Functions bundle
  - [ ] Sample sealed PDF
  - [ ] Emulator logs (on failure)
- [ ] Update README with "Run Locally / Deploy" sections
- [ ] Ensure secrets not leaked
- [ ] Add `.env*` and `/dist` to `.gitignore`

### Deliverables
- [ ] `.github/workflows/deploy.yml`
- [ ] Updated README.md
- [ ] Updated `.gitignore`

### Acceptance Criteria
- Workflow goes green on PR
- Artifacts are uploaded
- Secrets not leaked in logs
- `.env*` and build artifacts ignored

---

## Milestone 7 — Android APK (Capacitor) Ready

**Branch:** `ops/apk` (PR → `ops/finish-line`)
**Duration:** 3 hours
**Dependencies:** M1
**Status:** Pending

### Tasks
- [ ] Verify Capacitor configuration:
  - [ ] `appId="foundation.verumglobal.app"`
  - [ ] `appName="Verum Omnis"`
  - [ ] `server.url="https://verumglobal.foundation"`
  - [ ] `server.androidScheme="https"`
- [ ] Run `npx cap sync android`
- [ ] Add Gradle wrapper if missing
- [ ] Set up release build configuration
- [ ] Run `./gradlew assembleRelease`
- [ ] Generate APK artifact
- [ ] Create `ops/APK.md` with signing instructions
- [ ] Configure deep links to `/assistant.html`

### Deliverables
- [ ] Release APK artifact (attached to PR)
- [ ] `ops/APK.md` documentation
- [ ] Deep link configuration

### Acceptance Criteria
- Release APK artifact attached to PR
- App launches and loads site
- Deep links to `/assistant.html` work

---

## Merge & Release Flow

1. **Per Milestone:**
   - Create feature branch from `ops/finish-line`
   - Implement milestone tasks
   - Update `ops/STATUS.md`
   - Open PR → `ops/finish-line`
   - Include checklist + artifacts in PR
   - After merge, auto-continue to next milestone

2. **Final Release:**
   - When all milestones merged to `ops/finish-line`
   - Open final PR to `main`
   - Title: `release: backend hardened, pdf conformance, emulator+ci, apk ready`
   - Include:
     - Links to all milestone PRs
     - All artifacts
     - One-page release notes

---

## Definition of Done (Project "Finished")

- ✅ Website served via Firebase Hosting
- ✅ Long-scroll landing page live
- ✅ Functions health check OK
- ✅ All `/v1/*` endpoints pass emulator smoke tests
- ✅ CI pipeline green
- ✅ Idempotency + rate-limit enforced
- ✅ PDFs visually correct and programmatically asserted
- ✅ QR + SHA-512 present in PDFs
- ✅ No layout overlap in PDFs
- ✅ CI/CD deploys on push to `main`
- ✅ Artifacts attached to workflow runs
- ✅ APK release build available
- ✅ APK signing path documented
- ✅ README has clear run/deploy steps
- ✅ Environment variables documented
- ✅ No secrets in repository

---

## Hard Blockers (Stop-Only-On)

The following are the **only** conditions that should halt progress:

1. Missing credentials/permissions
   - `FIREBASE_TOKEN` secret
   - Model API keys (OpenAI, Anthropic, DeepSeek)
   - Firebase service account
2. Repository write restrictions or branch protection failures
3. External service outage (Firebase, GitHub, etc.)

**On stop:** Print exact error, file:line, and the smallest actionable diff or secret/key needed to unblock, then wait.

---

## Progress Tracking

See `ops/STATUS.md` for real-time progress updates with:
- Current milestone
- Current subtask
- Status (✅/⚠️/❌)
- Timestamp
- Next action
- Links to artifacts/logs

---

*This plan will be executed iteratively with frequent commits and status updates.*
