# MASTER PROMPT FOR COPILOT — VERUM OMNIS (Tailored to this repo)

You are my anonymous build partner. **Finish the entire site + functions + Capacitor path without nagging me. Ship it.**  
If something truly requires a human secret/approval, open an issue titled `BLOCKED: …` with the exact next action, then keep going on everything else.

## Repo reality you must respect
- **Firebase Hosting** serves from `verum-omnis-founders-gift-v5/verum-omnis-monorepo/web` (see `firebase.json`).
- **Cloud Functions** live in `verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions` (Node 20).
- Existing CI only tests Functions (`.github/workflows/functions-ci.yml`). Add a workflow that builds & deploys **hosting + functions** on `main`.
- A **Capacitor** project exists at `verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app`. Provide scripts to build APK and generate `assetlinks.json`.
- Preserve security headers/CSP already present in `firebase.json`. Tighten only if safe.
- Do **not** commit large `node_modules/`. Ensure proper `.gitignore` coverage.

## Product requirements (non‑negotiable)
1. **Brand/UI**
   - Official 3D "Verum Omnis — the whole truth" logo top‑center; same logo as a faint centered watermark under page text.
   - Dark theme, mobile‑first, accessible.
   - Landing page (`/index.html`) explains plainly: app verifies documents/images/videos/voice; **individuals are free; institutions/companies owe 20% of recovered fraud after trial** (visible notice).
2. **Auth & Modes**
   - Entry choice: **Private Person**, **Institution**, **Company**.  
   - For Institution/Company: collect domain + show/sign 20% notice before continuing.
3. **Core functions**
   - **Upload portal** (`/verify.html`) for docs/images/video/audio.
   - **Hash & seal**: compute **SHA‑512** immediately client‑side; generate **PDF 1.7** sealed output with:
     - Top‑center logo,
     - Centered watermark,
     - Bottom‑right **"✔ Patent Pending Verum Omnis" + QR** (QR encodes hash + minimal metadata),
     - Certification page with truncated SHA‑512 + page count.
   - **Stateless**: no server‑side storage. If Functions are used for compute, inputs must be discarded after processing; any receipts stay **client‑side** (download / IndexedDB).
   - **AI checks**: add hooks for **triple verification** (3 OpenAI models) and **9‑brain fan‑out** (8 voting + 1 R&D non‑voting). Implement a **Contradiction Engine** that diffs model summaries and flags conflicts. If keys missing, **dev mode** shows simulated output (no failure).
   - **Legal Advice** module with a big disclaimer (informational, not legal services).
   - **Tax Returns** module with the note: **"50% cheaper than local country options."**
   - **Blockchain anchor** hook: clean abstraction; if env vars present, write a small receipt & return tx id, else no‑op.
4. **UX polish**
   - Buttons: **Copy hash**, **Download sealed PDF**, **Open receipt**, **Share**.
   - Friendly, calm copy. If an upload fails, show plain‑English recovery steps.
5. **Security & privacy**
   - No telemetry/analytics. Keys only via env. Never hardcode.
   - Keep CORS minimal; CSP strict but compatible with our pages.
6. **Delivery**
   - **Deploy** Hosting + Functions with CI on pushes to `main`.
   - **Capacitor** scripts to produce `.apk`, plus `public/.well-known/assetlinks.json` generator.

## Definition of Done
- Live site on Firebase Hosting from `/web`, with logo & watermark correct.
- Upload → **SHA‑512** → **PDF 1.7 sealed** → **QR** works end‑to‑end; user can download.
- Notice to Institutions/Companies about **20% after trial** is visible and enforced in flow.
- **Triple‑verification** stubs + **9‑brain router** + **Contradiction Engine** run locally with mock outputs; switch to real models when keys exist.
- **Legal Advice** (with disclaimer) and **Tax Returns** pages are present and wired.
- No server‑side persistence of user data.
- CI green (lint, basic tests), and deploys on `main`.
- Capacitor path can build an **APK** locally; docs explain iOS build.

## Immediate tasks (execute now)
1. Audit current `/web/*.html` and make sure **Open Chat** works and **Choose File** → **Hash** → **Sealed PDF** flow is complete.
2. Implement/verify client‑side **SHA‑512** and PDF 1.7 sealing with logo/watermark/QR/certification page.
3. Add modular **AI Router** in Functions or client with stubs for 3‑model + 9‑brain + Contradiction Engine (dev mode if no keys).
4. Add Institution/Company flow (domain capture + 20% notice) before chat/verify use.
5. Create `.github/workflows/deploy.yml` to build & deploy Hosting + Functions on `main`.
6. Add Capacitor scripts & a small action/README for `assetlinks.json`.
7. Ensure `.gitignore` excludes large vendor dirs; remove committed `node_modules` via a PR if present.
8. Write/refresh short docs: `docs/EXECUTION-PLAN.md`, `docs/SEALING.md`, `docs/AI-ROUTER.md`, `docs/STATELESS.md`.

**Work in small PRs.** Only open `BLOCKED:` issues for human‑only items (API keys/billing).
