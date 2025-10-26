# Verum Omnis — Master Execution Plan

**Repo:** `Liamhigh/verumceleb`
**Base:** `main`
**Goal:** Production-ready web + Functions + APK + docs

## Roles

* **Copilot → “Designer/Builder” (UI)**

  * Owns: landing & pages, shared header/footer, Tailwind dark theme, responsiveness, video wiring.
  * Must **not** change backend logic or PDF sealing protocol.

* **CodeAgent → “Engineer in Background” (Logic/Ops)**

  * Owns: Functions hardening, tests, CI/CD, PDF conformance, APK build path, environment safety.
  * Must **not** change page styling or content design.

---

## Branching Strategy

* UI: `feat/ui-unification`, `feat/ui-pages`, `feat/video-wiring`
* Ops/Backend: `ops/runtime-guardrails`, `ops/smoke`, `ops/ci-deploy`, `ops/apk`
* Release trunk (optional): `ops/finish-line`

Merge to `main` only via PR with checklists.

---

## Non-Negotiables (both)

* **PDF protocol (do not change):** PDF 1.7, logo **top-center**, centered watermark, QR **bottom-right**, visible SHA-512 on certification page, no overlap, stable fonts (e.g., DejaVuSans).
* **Legal/Governance text:** unchanged.
* **No telemetry.**
* **No paid SaaS** without explicit TODO + approval.

---

## Milestones & Owners

### 1) UI Unification (Copilot)

* Refactor `web/index.html`, `assistant.html`, `institutions.html`, `features.html` to share **one** header & footer.
* Tailwind via CDN; dark theme; rounded cards; mobile-first 360–1440px.
* Fix Assistant page layout (chat + upload card, results panel).
* Remove duplicate logos; tidy spacing.
* **PR:** `feat: unify UI theme + fix broken pages`
* **Done when:** No horizontal scroll; Lighthouse (mobile) ≥90 across P/A/SEO/BP.

### 2) Video Wiring (Copilot)

* Use `web/data/videos.json` to hydrate hero/section videos.
* Fallback URLs if JSON missing; no blank space on failure.
* **PR:** `feat: wire videos.json + graceful fallback`

### 3) Required Pages (Copilot)

* `web/legal.html` (disclaimer copy prominent).
* `web/tax.html` (note: **“50% cheaper than local country option.”**)
* Institutions/company flow: selection (Private Person | Institution | Company) + **20% recovered-fraud fee** notice before access.
* **PR:** `feat: legal + tax + institution flow`

### 4) Functions Guardrails (CodeAgent)

* Node 20 engines; `.nvmrc=v20`; `helmet`, `compression`, **CORS allowlist** (`verumglobal.foundation`, `*.web.app`, `localhost:5173`), `express-rate-limit` (60/min), `zod` validation for all `/v1/*`.
* `/v1/health` returns `{ ok:true, env, uptime, versions }`.
* Error taxonomy + `pino` logs.
* **PR:** `chore(functions): health, cors, limits, zod, rate-limit, logs`

### 5) PDF Seal Conformance (CodeAgent)

* Assert PDF-1.7; coordinate placements; QR payload `{ sha512, meta:{ filename, bytes, createdAt } }`.
* Add tests that parse output; attach **golden sample PDF** as PR artifact.
* **PR:** `test(pdf): seal conformance + golden sample`

### 6) Smoke Tests (CodeAgent)

* `ops/smoke/requests.http`, `ops/smoke/local-smoke.ps1`, `ops/smoke/local-smoke.sh`

  * `GET /v1/health`
  * `POST /v1/verify` (file → sha512)
  * `POST /v1/seal` (file+title → pdf, qr, sha512)
  * `POST /v1/contradict` (two statements)
  * `POST /v1/anchor` (Idempotency-Key; dry-run without RPC)
* **PR:** `chore(ops): smoke scripts for all routes`

### 7) CI/CD (CodeAgent)

* `.github/workflows/deploy.yml`

  * Trigger: push to `main`
  * Steps: **lint → build → test → deploy (Hosting + Functions)**
  * Cache node_modules; upload artifacts (bundle, golden PDF, logs)
  * Uses `${{ secrets.FIREBASE_TOKEN }}`
* **PR:** `ci: auto-deploy firebase + smoke in CI`

### 8) APK Path (CodeAgent)

* `capacitor-app/` sync + `./gradlew assembleRelease`.
* Ensure APK at `capacitor-app/android/app/build/outputs/apk/release/app-release.apk`.
* Copy to `web/downloads/verum-omnis.apk`; link from landing CTA.
* **PR:** `ops: capacitor build + expose apk`

### 9) Docs (Either can own; prefer CodeAgent to draft)

* `README.md`, `DEPLOYMENT.md`, `MOBILE.md`, `LEGAL.md`
* Include quick start, emulator, smoke tests, CI, APK path, disclaimers.
* **PR:** `docs: add README, DEPLOYMENT, MOBILE, LEGAL`

---

## Ready-to-Paste Prompts

### Copilot Prompt (UI work)

> You are my front-end finisher for **Liamhigh/verumceleb** (Base: `main`).
> Branch `feat/ui-unification`. Refactor `web/index.html`, `assistant.html`, `institutions.html`, `features.html` to share one header/footer, Tailwind CDN, dark theme, responsive 360–1440px. Wire `web/data/videos.json` with fallback. Create `web/legal.html` (clear disclaimer), `web/tax.html` (note “50% cheaper”), and add Institution/Company flow with **20% fee** notice before access. Do **not** modify backend logic or PDF rules. Open PRs with checklists and before/after screenshots.

### CodeAgent Prompt (background engineering)

> Repo `Liamhigh/verumceleb`, Base `main`, branch `ops/runtime-guardrails`.
> Audit Functions → add health/cors/limits/zod/rate-limit/logs (Node 20). Enforce PDF 1.7 seal placements + test + golden sample. Add smoke scripts; integrate deploy workflow with smoke step; prepare Capacitor APK build and copy to `/web/downloads/verum-omnis.apk`. Open a PR per milestone with artifacts. Stop only on hard blockers (missing secrets/permissions) and print exact fix.

---

## Checklists (paste into each PR)

**UI PR checklist (Copilot)**

* [ ] Shared header/footer + Tailwind CDN + dark theme
* [ ] Hero/logo not duplicated; spacing consistent
* [ ] Videos load from `web/data/videos.json` with graceful fallback
* [ ] `legal.html` & `tax.html` exist and are linked
* [ ] Institution/Company fee notice shown pre-access
* [ ] Responsive 360–1440px; **no horizontal scroll**
* [ ] Lighthouse (mobile) ≥90 P/A/SEO/BP

**Ops PR checklist (CodeAgent)**

* [ ] `/v1/health, /v1/verify, /v1/seal, /v1/contradict, /v1/anchor` respond locally
* [ ] Zod validation + rate-limit active; CORS headers correct
* [ ] Golden PDF attached; conformance tests pass
* [ ] CI workflow green; artifacts uploaded
* [ ] `.env*` ignored; secrets not committed
* [ ] APK built and linked from landing

---

## Definition of Done

* Firebase **deploys automatically** on `main`.
* Unified UI live; all nav works (Home, Assistant, Features, Institutions, Legal, Tax).
* Functions solid with smoke tests passing locally & in CI.
* PDF seal meets visual + programmatic assertions.
* APK downloadable from landing.
* Docs complete and accurate.

---

## Useful Commands (dev)

```bash
# Functions (local)
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm ci
npm run build && firebase emulators:start

# Smoke (from repo root or ops dir)
sh ops/smoke/local-smoke.sh
pwsh ops/smoke/local-smoke.ps1
```

```bash
# Capacitor Android
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app
npx cap sync android
cd android && ./gradlew assembleRelease
# copy to web:
cp app/build/outputs/apk/release/app-release.apk ../../web/downloads/verum-omnis.apk
```
