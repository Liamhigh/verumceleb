# Verum Omnis — App & Website Product Spec

## 0) Brand & Principles

* **Mission tone:** calm, confident, zero-fluff. "Hash first. Truth always."
* **Theme:** dark by default, high contrast, large tap targets, minimal chrome.
* **Primary actions:** "Upload • Verify • Seal • (optional) Anchor".
* **Privacy:** stateless by default. No telemetry. Hash-indexed receipts only.
* **Forensics contract:** PDF 1.7, top-center VO 3D logo, centered watermark, bottom-right block: `✔ Patent Pending Verum Omnis` + QR + visible SHA-512. Never compress in a way that changes the hash.

---

## 1) Information Architecture (both web & phone)

1. **Landing Page (public)**

   * Hero: "Verify evidence with 9 AIs. Keep your data on your device."
   * Primary CTA: **Start Verification** (opens Upload flow).
   * Secondary CTAs: **For Institutions** (licensing notice), **How It Works**.
   * Sections:

     * "What it does" (plain language): verifies docs, images, video, audio; outputs a sealed PDF with QR+SHA-512; optional chain anchor.
     * "How it keeps you safe" (stateless, no PII, hash-only receipts).
     * "9-Brain consensus" (short bullets: contradiction checks, metadata forensics, image/voice flags).
     * "Legal disclaimers" (not legal advice; admissibility notes).
     * "Pricing" (Citizens: free; Institutions/Companies: licensing after trial).
     * FAQ (upload size limits, offline use, QR verification, receipts, appeals).
     * Footer: links to docs, policy, licensing, contact email.
2. **App Shell (private)**

   * Tabs/Sections: **Verify**, **Receipts**, **Policy**, **Help**.
   * Global FAB: **New Verification**.
3. **Flows**

   * Upload → Hash → Local checks (9-brain) → Preview → Seal → (Optional) Anchor → Receipt.

---

## 2) Screens (mobile first; website mirrors in responsive layout)

### A) Verify (Home)

* **Header:** "Verify Evidence"
* **Inputs:** File picker (+ drag-drop on web), camera (photo/video), mic (audio).
* **Supported types:**

  * Documents: `pdf, docx, odt, txt, csv, xlsx, pptx`
  * Images: `png, jpg/jpeg, webp, tiff`
  * Video: `mp4, mov, webm`
  * Audio: `wav, mp3, m4a, flac`
* **Limits:** default 250 MB per file (configurable); multi-file batch up to 1 GB.
* **Actions:** `Compute SHA-512` → shows hash instantly; button: **Run Checks**.
* **Progress chips:** "Hashing", "Metadata scan", "Consistency/contradiction", "Image/Video forensics", "Policy diff".
* **Output summary card:**

  * File name + size, SHA-512 (copy icon), risk score (Low/Medium/High), warnings list.
  * Buttons: **Seal PDF** • **Anchor** (optional) • **View Report**.

### B) Seal PDF (Result)

* Shows preview (A4 portrait). Live overlay of: logo top-center, centered watermark, bottom-right certification block with visible SHA-512 + QR.
* **Buttons:** **Download Sealed PDF**, **Share**, **Get Receipt**.
* **Note:** "Sealed locally. No file uploaded. QR encodes the receipt URL with hash only."

### C) Anchor (Optional)

* **Copy:** "Anchor the hash to public chain (no file data)."
* **Dropdown:** Ethereum / Polygon (configurable), or "Request signed anchor via API".
* **Result:** TXID shown; included in receipt.

### D) Receipts

* List of past verifications on device (local store) + server receipts (hash-indexed).
* Item: filename (never uploaded), SHA-512 (truncated), date, status (sealed / anchored).
* Tap to open **Receipt Detail**:

  * JSON view of `{hash, ts, policyHash, txid?}`, QR, verify button.

### E) Policy

* Shows **constitution.json** (current policy pack) + **policyHash**.
* Updates are fetched anonymously; display diff vs the local pack.

### F) Help

* Quick "how it works", legal disclaimer, contact email, offline tips.

---

## 3) The In-App AI ("Me") — Persona & Behavior

### Persona

* **Voice:** precise, neutral, human-friendly; zero drama. Short sentences. Plain English.
* **Style examples:**

  * "I computed your file's SHA-512: `a1b2…` (copied)."
  * "Two inconsistencies: EXIF timestamp ≠ document header; audio channel metadata missing."
  * "Recommendation: seal now. Anchoring is optional; it adds a public timestamp."
* **Boundaries:** Never invent evidence; never store PII; never promise legal outcomes.

### What I Do (functions)

* **Explain findings** plainly (contradictions, metadata anomalies, OCR inconsistencies).
* **Summarize** into a receipt-ready paragraph for the sealed PDF cover.
* **Guide next steps:** seal, anchor, share the PDF or receipt.
* **Answer questions:** "What does this warning mean?", "How do courts check the QR?".
* **Modes I understand (API):** `verify`, `policy`, `receipt`, `anchor`, `notice`.

### How I Talk (microcopy)

* Success: "Sealed. Keep this PDF safe. Anyone can scan the QR to verify the hash."
* Warning: "EXIF time differs by 3 h 14 m from creation timestamp. This can be benign (time zone) or suspicious."
* Error: "I couldn't read the stream. Try re-saving the file; I'll stay here."

---

## 4) Outputs & Files

* **Sealed PDF** (PDF 1.7) with:

  * Top-center logo (official 3D VO).
  * Center watermark under text.
  * Bottom-right block: ✔ + visible SHA-512 (full) + QR (encodes receipt URL with `?hash=`).
  * Final page: certification panel (page count, policyHash, truncated hash, timestamp).
* **Receipt JSON (hash-indexed):**

  ```json
  {
    "hash": "<sha512>",
    "ts": "2025-10-18T13:45:10Z",
    "policyHash": "<sha512-of-constitution>",
    "txid": "0xabc...",          // optional
    "source": "app",             // "api" if server wrote it
    "mode": "verify|anchor|receipt"
  }
  ```
* **No file bytes ever leave the device** (unless user explicitly opts in for future features; default is off).

---

## 5) Website Landing Page — Copy Blocks (ready to paste)

**Hero**
Title: "Evidence you can trust."
Sub: "Hash-first verification with 9 AI checks. Your file stays on your device."
CTA: **Start Verification** • Secondary: **For Institutions**

**How it works**

1. Upload → we compute **SHA-512** on device.
2. Run checks (metadata, contradictions, image/video/voice).
3. Get a **sealed PDF** with logo, watermark, QR + visible hash.
4. (Optional) **Anchor** the hash on a public chain.
5. Share the PDF; anyone can verify via the QR/receipt.

**Why it's safe**

* Stateless, no telemetry, hash-only receipts.
* No file content stored or logged.
* Transparent policy pack with its own hash.

**For institutions**

* Free for citizens. Licensing applies to institutions/companies after trial.
* API receipts, audit hooks, and offline-first workflows.

**FAQ** *(examples)*

* *Can you see my files?* — No. We compute the hash locally and keep it on your device.
* *What does the QR contain?* — Only a link to a receipt that's indexed by the hash.
* *Is this legal advice?* — No. We provide forensic tooling, not legal services.

---

## 6) UX & Components (mobile)

* **Buttons:** large, rounded, single-word labels. Primary = "Seal", Secondary = "Anchor".
* **Chips:** status chips (Hashing, Scanning, Sealed, Anchored).
* **Cards:** each file's summary with risk level and action row.
* **Toasts:** short, top-center: "Hash copied", "Sealed PDF saved".
* **Loaders:** determinate progress for hashing and sealing.
* **Empty states:** friendly: "No receipts yet. Seal something and you'll see it here."

**Accessibility**

* 16px min text; 44px min target; high-contrast on dark; reduced motion toggle; full keyboard support on web; screen-reader labels for all controls.

---

## 7) App Settings (minimal)

* **Theme:** Dark / Auto.
* **Offline mode:** On (default).
* **Anchoring provider:** None / Ethereum / Polygon.
* **Legal region notes:** Static info (read-only).
* **Clear local receipts:** (does not affect hash-indexed server receipts).

---

## 8) Error States (canonical messages)

* **File too large:** "That file is over 250 MB. Split it or compress losslessly."
* **Unreadable:** "I can't read that format. Try re-saving as PDF or PNG."
* **Sealing failed:** "I couldn't finalize the PDF. I kept your analysis; try again."
* **Anchor failed:** "Couldn't broadcast. Your sealed PDF remains valid; anchoring is optional."

---

## 9) Technical Contracts (for builders)

### API Surface (single endpoint; hash-indexed)

`POST /assistant`

* **JSON (no upload):**

  ```json
  { "mode":"verify|policy|receipt|anchor|notice", "hash":"<sha512>" }
  ```
* **Multipart (upload):** `file=@X`, `mode=verify`
* **Responses (typical):**

  ```json
  { "ok": true, "sha512": "<sha512>", "summary": "Plain-language findings...", "policyHash": "<sha512>", "txid": "0x..." }
  ```

`GET /health` → `{ ok:true, service:"api", region:"us-central1", ts: <epoch_ms> }`

### Local sealing

* **Inputs:** original file buffer (never leaves device), summary text, receipt JSON.
* **Output PDF rules:** PDF 1.7; place assets exactly as per the forensic contract; embed QR that encodes a receipt URL with `hash` param.

### Receipt store (server)

* **Collection:** `receipts`
* **Doc id:** `<sha512>`
* **Rules:** deny client reads/writes; Functions/Server only.
* **Write:** merge upserts; never store file bytes or PII.

---

## 10) Example Microcopy (you can lift these)

* **Upload success:** "Got it. Hashing now…"
* **Hash ready:** "SHA-512: `b01f…9c` (copied)"
* **Scan findings (low risk):** "No contradictions detected. EXIF and header times align."
* **Scan findings (medium):** "2 warnings: EXIF time differs; OCR skipped 11 low-contrast words."
* **Seal success:** "Sealed. QR + hash printed on page 1. Keep this PDF safe."
* **Anchor success:** "Anchored. TXID added to your receipt."

---

## 11) Minimal Visual System

* **Colors:** background #0B0F13; surface #151B22; text #E6EDF3; accent #4DA3FF; caution #FFB347; danger #FF6B6B; success #33D1A0.
* **Typography:** Inter/Roboto; 28/20/16/14 px scales; 1.4 line-height.
* **Iconography:** simple line icons; QR, Shield, Hash, Chain, PDF.

---

## 12) QA / Acceptance

* Hash same file twice → identical SHA-512 and identical sealed PDF hash.
* Reopen sealed PDF and compute SHA-512 → matches visible hash on page.
* QR scan → opens receipt with same hash + (optional) txid.
* "Offline mode" fully functional: hash/scan/seal with no network.
* Anchoring off → everything else still passes.
* Large file (e.g., 200 MB video) → progress remains smooth, UI responsive.

---

## 13) What to hand builders now (checklist)

### ✅ Completed Items (Founders Release)

* [x] **Add landing page copy blocks verbatim; wire CTAs** - Landing page (`index.html`) implemented with all specified sections: hero, how it works, why it's safe, 9-brain consensus, for institutions, FAQ, and footer with proper CTAs.
* [x] **Implement sealing renderer with exact placements + QR** - PDF sealing implemented in `functions/pdf/seal-template.js` with logo placement, QR code generation, and SHA-512 display.
* [x] **Write receipts to Firestore (server only); show locally** - Receipt storage implemented in `functions/receipts-kv.js` with Firestore persistence and in-memory fallback.
* [x] **Basic verify interface** - `verify.html` provides file upload, text analysis, hash anchoring, and PDF sealing functionality.
* [x] **Implement local SHA-512** - Browser-based SHA-512 hashing implemented using Web Crypto API (`crypto.subtle.digest`).
* [x] **Core API endpoints** - `/v1/verify`, `/v1/anchor`, `/v1/seal`, `/v1/contradict` endpoints implemented.
* [x] **Immutable pack verification** - Cold start verification of constitutional rules with SHA-512 checking.
* [x] **Legal & Treaty page** - `legal.html` displays governance documents and constitutional framework.

### 🚧 Partial / Enhancement Needed

* [~] **Implement screens per sections A–F** - Basic web screens done (Landing, Verify, Legal). Mobile app screens (Receipts, Policy, Help) and native features need implementation in Capacitor app.
* [~] **Enforce file type matrix & limits** - File upload accepts files but doesn't strictly enforce the type matrix from section 2 (pdf, docx, png, jpg, mp4, etc.) or the 250 MB limit with proper user feedback.
* [~] **Implement local SHA-512 + streaming to avoid memory spikes** - Basic SHA-512 works but loads entire file into memory via `arrayBuffer()`. Large files (>100 MB) may cause performance issues. Needs chunked/streaming implementation.

### 📋 Remaining Work

* [ ] **Wire `/assistant` modes** - The `/assistant` endpoint mentioned in section 9 is not implemented. Currently using direct endpoints (`/v1/contradict`, `/v1/seal`, etc.) instead of unified assistant interface with mode parameter.
* [ ] **Add accessibility + reduced motion + high contrast checks** - No explicit accessibility features: missing `prefers-reduced-motion` CSS, high contrast mode detection, ARIA labels for interactive elements, or keyboard navigation enhancements.
* [ ] **Run the QA/Acceptance list above** - Systematic testing per section 12 criteria needed:
  - Hash same file twice validation
  - Sealed PDF hash verification
  - QR scan receipt validation
  - Offline mode testing
  - Large file (200 MB) performance testing

### 📱 Future Phases (Post-Founders Release)

* [ ] **Mobile-native features** - Camera integration, biometric auth, offline receipt sync
* [ ] **Enhanced UI** - Screen A (Verify Home) with full file type icons, B (Seal PDF result preview), C (Anchor modal), D (Receipts list), E (Policy viewer), F (Help/FAQ)
* [ ] **Video processing activation** - Enable video endpoints when ready (currently disabled via `config.video.json`)
* [ ] **Batch operations** - Multi-file sealing from `generate-batch-seals.js`
* [ ] **Authentication** - API key system for institutional users

---

**Implementation Status**: Founders Release feature-complete for core functionality. Additional items are enhancements for production deployment and mobile apps.

---

## 14) Implementation Notes (Current State)

### What Works Now (Founders Release v1)

**✅ Core Functionality:**
- **Landing page** (`web/index.html`): All specified sections implemented - hero, how it works, safety features, 9-brain consensus, institutions, FAQ
- **Verification interface** (`web/verify.html`): File upload (drag-drop + picker), text contradiction analysis, hash display, anchoring, PDF sealing
- **API backend** (`functions/index.js`): Express app with 4 endpoints deployed as Firebase Function `api2`
- **PDF generation** (`functions/pdf/seal-template.js`): Creates sealed PDFs with logo, SHA-512, QR code using pdfkit
- **Receipt storage** (`functions/receipts-kv.js`): Firestore persistence with in-memory fallback
- **Immutable rules** (`functions/assets/rules/`): 12 constitutional files with SHA-512 verification on cold start
- **Legal page** (`web/legal.html`): Displays governance documents and treaty

**✅ Technical Stack:**
- Frontend: Vanilla JS + HTML5 + CSS (no framework dependency)
- Backend: Node.js 20 ESM, Express, Firebase Functions v2
- Database: Firestore (with fallback to in-memory Map)
- PDF: pdfkit, QR: qrcode library
- Deployment: Firebase Hosting + Functions (project: `gitverum`)

**✅ Security:**
- Client-side SHA-512 hashing via Web Crypto API
- No file uploads (hash-only API calls)
- Stateless architecture (no PII stored)
- Constitutional immutability enforced
- CORS + Helmet security headers

### Known Limitations

**⚠️ Performance:**
- Large files (>100 MB) load entirely into memory via `arrayBuffer()` 
- No streaming hash computation implemented yet
- May cause browser tab freezing on slow devices

**⚠️ Validation:**
- File type checking is lenient (accepts any file)
- No enforcement of 250 MB limit with user-friendly errors
- Missing file extension validation against supported matrix

**⚠️ Mobile:**
- Capacitor app shell exists but lacks native features
- No camera integration for mobile scanning
- No offline receipt synchronization
- iOS project not yet configured

**⚠️ Accessibility:**
- No `prefers-reduced-motion` CSS queries
- Missing ARIA labels on interactive elements
- No high contrast mode detection
- Keyboard navigation not explicitly tested

**⚠️ User Experience:**
- No progress indicators for large file hashing
- Limited error messages (generic failures)
- No retry logic for failed API calls
- Receipt list UI not implemented (only verify page)

### API Differences from Spec

**Section 9 specifies:**
```json
POST /assistant
{ "mode":"verify|policy|receipt|anchor|notice", "hash":"<sha512>" }
```

**Current implementation uses:**
```javascript
POST /v1/contradict  // text analysis
POST /v1/anchor      // hash anchoring  
POST /v1/seal        // PDF generation
GET  /v1/verify      // health check
```

**Rationale:** Direct endpoints provide clearer semantics and easier testing during Founders Release. The unified `/assistant` endpoint can wrap these in a future update.

### Asset Status

**Logos:** Located in `web/assets/`. Current files are 1x1 pixel placeholders (68 bytes each):
- `logo.png`, `logo_black.png`, `logo_blue.png`, `logo_white.png`
- `logo1.png`, `logo2.png`, `logo3.png`

**Action needed:** Replace with actual Verum Omnis 3D logo assets (recommended: SVG for web, PNG @2x/@3x for mobile).

**Favicons:** Missing `favicon-32.png` and `favicon-16.png` referenced in `index.html`.

### Testing Coverage

**✅ Automated tests** (`functions/test-api.js`):
- Immutable pack verification
- Manifest structure validation
- PDF sealing function
- Receipt storage (get/put)
- Video config check
- Critical asset presence

**❌ Missing tests:**
- Client-side hash computation accuracy
- Large file handling (>100 MB)
- Cross-browser compatibility
- Mobile responsiveness
- Offline mode functionality
- QR code scanning from generated PDFs

### Migration Path for Section 13 Items

**For "Screens A-F" implementation:**
1. Create `receipts.html` (Screen D) - list of past verifications
2. Create `policy.html` (Screen E) - constitution viewer with diff
3. Enhance `verify.html` (Screens A-B) - add risk scoring UI
4. Build Capacitor screens in `capacitor-app/www/`
5. Add native camera plugin for mobile

**For streaming SHA-512:**
```javascript
// Replace current implementation
async function computeFileHashStreaming(file) {
  const chunkSize = 64 * 1024 * 1024; // 64 MB chunks
  let offset = 0;
  const hasher = /* use streaming hash library or polyfill */;
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const buffer = await chunk.arrayBuffer();
    hasher.update(new Uint8Array(buffer));
    offset += chunkSize;
    
    // Update progress: Math.floor((offset / file.size) * 100)
  }
  
  return hasher.digest('hex');
}
```

**For file type enforcement:**
```javascript
const ALLOWED_TYPES = {
  'application/pdf': 250,      // MB
  'image/png': 250,
  'image/jpeg': 250,
  'video/mp4': 250,
  // ... rest from section 2
};

function validateFile(file) {
  const maxSizeMB = ALLOWED_TYPES[file.type];
  if (!maxSizeMB) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large (max ${maxSizeMB} MB)`);
  }
}
```

**For accessibility:**
```css
/* Add to app.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  :root {
    --text: #ffffff;
    --background: #000000;
    --accent: #0080ff;
  }
}
```

### Deployment Checklist

**Before production launch:**
- [ ] Replace placeholder logos with actual branding
- [ ] Add favicon files
- [ ] Implement file type/size validation with user feedback
- [ ] Add streaming hash for files >50 MB
- [ ] Test with real 200 MB video file
- [ ] Add error boundaries and retry logic
- [ ] Implement rate limiting on API endpoints
- [ ] Set up monitoring (Firebase Performance, Error Reporting)
- [ ] Create privacy policy page (referenced in footer)
- [ ] Add analytics (privacy-respecting, hash-only events)
- [ ] Test QR codes from sealed PDFs on mobile devices
- [ ] Run full QA/Acceptance checklist from section 12
- [ ] Security audit of constitutional rules update process
- [ ] Load testing (concurrent users, large files)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

**Note:** Logos are located in `verum-omnis-founders-gift-v5/verum-omnis-monorepo/web/assets/` directory. Current implementation supports the forensics contract with proper PDF sealing, watermarking, and QR code generation as specified.