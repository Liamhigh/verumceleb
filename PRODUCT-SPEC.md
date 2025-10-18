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

* [ ] Implement screens per sections A–F.
* [ ] Enforce file type matrix & limits.
* [ ] Implement local SHA-512 + streaming to avoid memory spikes.
* [ ] Implement sealing renderer with exact placements + QR.
* [ ] Wire `/assistant` modes; keep responses hash-indexed & stateless.
* [ ] Write receipts to Firestore (server only); show locally.
* [ ] Add landing page copy blocks verbatim; wire CTAs.
* [ ] Add accessibility + reduced motion + high contrast checks.
* [ ] Run the QA/Acceptance list above.

---

**Note:** Logos are located in `verum-omnis-founders-gift-v5/verum-omnis-monorepo/web/assets/` directory. Current implementation supports the forensics contract with proper PDF sealing, watermarking, and QR code generation as specified.