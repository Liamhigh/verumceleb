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

## Development Setup
To work on this repository locally:

**Functions (testing and development):**
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm ci
npm test  # Run tests with vitest
npm run serve  # Start local Firebase emulators
```

**Web (static hosting):**
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/web
# Serve static files locally
python3 -m http.server 5173
```

**Linting & Testing:**
- Functions are tested via CI on every push to `functions/**` paths
- Tests use vitest framework
- Always run `npm test` in functions directory before committing

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

---

# Asset sourcing – videos (Issue #50)

**Do not commit video binaries to the repo.**  
All videos are hosted in **Firebase Storage** for project **verumdone**.

## Source bucket & URL format
- Bucket: `verumdone.firebasestorage.app`
- Public URL template (no token required):
```
https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/<PATH-ENCODED>?alt=media
```
Where `<PATH-ENCODED>` is the object path with `/` → `%2F` and spaces → `%20`.

## File mapping
- **Landing hero (index.html):**
  - Object path: `assets/video landing page.mp4`
  - URL: `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fvideo%20landing%20page.mp4?alt=media`

- **Institutions page (institutions.html):**
  - Object path: `assets/bank promo.mp4`
  - URL: `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fbank%20promo.mp4?alt=media`
  - Object path: `assets/bank promo long.mp4`
  - URL: `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fbank%20promo%20long.mp4?alt=media`

## Placement rules
- `web/index.html` renders **one** autoplay/muted/loop hero `<video>` using the **landing** URL above.
- `web/institutions.html` renders **two** `<video>` tags (stacked on mobile, side-by-side on md+), using the two **institutions** URLs above.
- Keep the header logo at `/assets/logo.png` (small image can live in repo).

## Config file
URLs are also stored in `web/data/videos.json`:
```json
{
  "landing": "https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fvideo%20landing%20page.mp4?alt=media",
  "institutions1": "https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fbank%20promo%20long.mp4?alt=media",
  "institutions2": "https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/assets%2Fbank%20promo.mp4?alt=media"
}
```

## Storage rule (already applied)
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /assets/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

## Acceptance checks
* Landing page plays the hero video from Firebase.
* Institutions page plays both videos from Firebase.
* No video files are added to the repository.

---

# Verum Omnis — Client-Only Assistant (No Server)

## Goal

A **chat-first web app** that behaves like a normal AI chat (like this conversation), and **also** lets the user **Verify**, **Seal**, and **Anchor** documents. **All logic runs in the browser** (no server required). If env keys are present, optional cloud calls may be used; otherwise everything must still work locally.

---

## Pages & Files

* `web/index.html` — public landing (hero video + CTAs)
* `web/institutions.html` — two promo videos + pricing blocks
* `web/assistant.html` — **chat UI (primary)** + **tools panel (verify/seal/anchor)**
* `web/data/videos.json` — holds Firebase video URLs (landing, institutions1, institutions2)
* `web/assets/*` — logos, small images only (no videos)
* `web/js/assistant.js` — all client logic (hashing, verify, seal, anchor, chat loop)
* `web/js/libs/` — client libs: `pdf-lib`, `qrcode`, minimal NLP helpers

**Do not use any server or functions.** No fetch to our backend is required for core features.

---

## UX / Layout (exact)

### Header (every page)

* Left: logo + **Verum Omnis**
* Right nav: **Open Chat** (`/assistant.html`), **Institutions** (`/institutions.html`)

### Landing (`web/index.html`)

* Full-width **hero `<video>`** (autoplay, muted, loop) reading `videos.json.landing`
* Headline: "The World's First Legal AI"
* Subtext paragraph (short)
* Three feature cards
* Two CTAs: **Open Chat**, **Institutions**

### Institutions (`web/institutions.html`)

* Two `<video>` elements fed by `videos.json.institutions1/2`
* Three cards: **20% recovery**, **Legal AI**, **Investigation AI**
* Note re: SHA-512 + QR verification

### Assistant (`web/assistant.html`)

**Two columns (md+), stacked on mobile:**

* **Left (70%) — Chat**

  * Scrollable thread, bubbles (assistant + user)
  * Input box + Send
  * First message (assistant):

    > "Hi — I'm your Verum Omnis assistant. We can chat normally, and I can Verify, Seal, and Anchor documents. Drop a file anytime."
* **Right (30%) — Tools**

  * File input (accept: `.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.mp3,.mp4`)
  * Hash pane (shows **SHA-512** immediately after select)
  * Buttons:

    * **Check this document** → local **Verify** (triple-consensus logic; details below)
    * **Seal this document** → generate **sealed PDF** (logo, watermark, **truncated hash**, **QR**)
    * **Anchor this document** → produce **receipt JSON** (and optional on-chain call if env provided)

---

## Must-Have Behavior (client-only)

### 1) Hash (always local)

* On file select, do:

```js
const buf = await file.arrayBuffer();
const hash = await crypto.subtle.digest('SHA-512', buf);
const sha512 = [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
```

* Display full hex; copy button; keep `{sha512, filename, size, mime}` in memory.

### 2) Verify (triple-consensus, no server required)

* Implement **three independent checkers** fully in the browser. Each returns `{vote:'pass'|'flag', notes:[...]}`.

  * **RuleChecker** — lightweight heuristics (date/timestamp sanity, duplicate pages, red-flag phrases, OCR anomalies).
  * **StatChecker** — signal features (entropy spikes, repeated lines, font/metadata inconsistencies if PDF), thresholded.
  * **LLMChecker** — optional: if `OPENAI_API_KEY` (or similar) is present in `window.VERUM_ENV`, call an LLM; **otherwise** run a **local promptless stub** (pattern checks + summaries); must still work offline.
* **Consensus**:

```js
const votes = [rule.vote, stat.vote, llm.vote];
const passCount = votes.filter(v=>v==='pass').length;
const consensus = passCount >= 2 ? 'pass' : 'flag';
```

* Render a small table: 3 rows (Rule/Stat/LLM), final **Consensus** row, plus notes.

### 3) Seal (generate PDF in browser)

* Use **`pdf-lib`** to:

  * Load the original file if PDF; else create a 1-page PDF receipt referencing the original filename & hash.
  * Add **top-right logo**, **faint full-page watermark**, and **footer** with:

    * "✔ Patent Pending Verum Omnis"
    * "SHA-512 (trunc): `xxxx…xxxx`"
    * QR code (using `qrcode`) that encodes a JSON blob:

      ```json
      { "sha512": "<full>", "filename": "<name>", "ts": "<ISO>" }
      ```
* Offer a **Download "<name>.sealed.pdf"** button (no upload).

### 4) Anchor (receipt, optional chain)

* Always return a **client-generated receipt**:

```js
const receipt = {
  sha512, filename, ts: new Date().toISOString(),
  method: window.VERUM_ENV?.ANCHOR === 'ethereum' ? 'eth' : 'local',
  txHash: window.VERUM_ENV?.ANCHOR ? await sendTx(sha512) : null,
  receiptUrl: window.VERUM_ENV?.ANCHOR ? `https://.../${txHash}` : null
};
```

* If `window.VERUM_ENV.RPC_URL` + `PRIVATE_KEY` exist, allow optional **on-chain tx**; otherwise keep it local and downloadable as `anchor-receipt.json`.

### 5) Chat (like a normal AI)

* Default to a **client stub** that echoes, summarizes, and references any computed hash in context. Provide a **hook** to swap in a real LLM later if `OPENAI_API_KEY` is present:

```js
async function assistantReply(text){
  if (window.VERUM_ENV?.OPENAI_API_KEY) { /* call LLM */ }
  else { /* local stub: respond empathetically + mention tools */ }
}
```

* Show typing indicator, then append assistant bubble.

---

## Video Sourcing (no binaries in repo)

* URLs come from `web/data/videos.json`:

```json
{ "landing":"", "institutions1":"", "institutions2":"" }
```

* If a key is empty, render a visible placeholder "Add URL in videos.json".
* Firebase URL format (public):
  `https://firebasestorage.googleapis.com/v0/b/verumdone.firebasestorage.app/o/<PATH-ENCODED>?alt=media`

---

## Libraries (client-side only)

* `pdf-lib` (create/modify PDFs)
* `qrcode` (generate QR as dataURL)
* (optional) `pdfjs` for lightweight PDF metadata checks
* No backend, no Firebase Functions required.

---

## Minimal Code Hooks (must exist)

### `web/js/assistant.js` (key exports)

```js
export async function computeSHA512(file) { /* as above */ }
export async function verifyTriple({arrayBuffer, sha512, filename, mime}) { /* 3 checkers + consensus */ }
export async function sealPDF({arrayBuffer, sha512, filename}) { /* pdf-lib + qrcode; return Blob */ }
export async function anchor({sha512, filename}) { /* local receipt; optional chain */ }
export async function assistantReply(text) { /* chat behavior */ }
```

### Wire up UI

* File input → `computeSHA512` → show hash
* "Check" → `verifyTriple` → render table
* "Seal" → `sealPDF` → download link (`URL.createObjectURL`)
* "Anchor" → `anchor` → download `anchor-receipt.json`
* Chat input → `assistantReply` → append bubble

---

## Acceptance Criteria

* **No network** required for Verify/Seal/Anchor; they work offline after page load.
* Chat feels like a normal assistant; mentions tools when helpful.
* Hash shows instantly on file select (full SHA-512).
* Verify shows 3 model votes + final consensus.
* Seal downloads a **sealed PDF** with logo, watermark, truncated hash, and **QR** that decodes to `{sha512, filename, ts}`.
* Anchor downloads a **receipt JSON**; if env vars exist, can show `txHash`.
* Landing and Institutions videos play from `videos.json`.
* Mobile responsive and clean.

---

### Styling nudge

Tailwind classes, dark theme (`bg-slate-950 text-slate-100`), rounded 2xl cards, soft borders (`border-slate-800`). Chat bubbles with subtle shadows.

---
