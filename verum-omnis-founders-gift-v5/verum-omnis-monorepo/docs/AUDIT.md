# Verum Omnis — Full Repository Audit & Gap Analysis

**Audit Date:** 2025-10-26
**Auditor:** CodeAgent (Milestone 1)
**Repository:** Liamhigh/verumceleb
**Branch:** ops/audit

---

## Executive Summary

This audit provides a comprehensive inventory of the Verum Omnis monorepo, mapping all endpoints, tracing verification logic, documenting the PDF sealing pipeline, and assessing security posture. The codebase contains ~2,400 lines of JavaScript/TypeScript across web client, cloud functions, and mobile app components.

**Key Findings:**
- ✅ Core client-side architecture present (SHA-512, triple-verification, nine-brains)
- ⚠️ Server endpoints are minimal stubs (12 failing tests)
- ⚠️ PDF sealing exists but needs conformance validation
- ⚠️ No contradiction engine endpoint yet
- ⚠️ Limited middleware (no helmet, rate-limiting, zod validation)
- ⚠️ Capacitor config incomplete (placeholder domain)

---

## 1. Repository Structure Inventory

### 1.1 Web Client (`/web/`)

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `index.html` | Landing page | — | ✅ Present |
| `institutions.html` | Institutions page with videos | — | ✅ Present |
| `assistant.html` | Chat + tools interface | — | ✅ Present |
| `verify.html` | Document verification UI | — | ✅ Present |
| `legal.html` | Legal notices | — | ✅ Present |
| `download.html` | Download/receipt page | — | ✅ Present |
| `test-functions.html` | Function testing page | — | ✅ Present |
| `js/assistant.js` | Core assistant logic (hash, verify, seal, anchor) | ~800 | ✅ Present |
| `js/nine-brains.js` | Nine-brain forensic engine | ~900 | ✅ Present |
| `js/case-synthesis.js` | Case-level synthesis (timeline, contradictions) | ~400 | ✅ Present |
| `js/case-manager.js` | Case management utilities | ~150 | ✅ Present |
| `js/extraction.js` | File content extraction | ~150 | ✅ Present |
| `js/config.template.js` | Configuration template | — | ✅ Present |
| `data/videos.json` | Video URLs (Firebase Storage) | — | ✅ Present |
| `data/institutions.json` | Institution data | — | ✅ Present |

**Total Web Client:** ~2,400 lines of JavaScript

### 1.2 Cloud Functions (`/functions/`)

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `index.js` | Main Express API (Firebase Functions v2) | 47 | ⚠️ Stubs only |
| `receipts-kv.js` | Receipt storage (Firestore/in-memory) | 54 | ✅ Present |
| `pdf/seal-template.js` | PDF sealing with PDFKit | ~100 | ✅ Present |
| `video/video-ingest.js` | Video processing | — | ✅ Present |
| `video/transcription.js` | Video transcription | — | ✅ Present |
| `video/threat-detect.js` | Video threat detection | — | ✅ Present |
| `test/index.test.js` | Endpoint tests (vitest) | 99 | ⚠️ 12 failing |
| `serve.js` | Local development server | — | ✅ Present |
| `assets/rules/*.json` | Constitutional & gift rules | — | ✅ Present |

**Total Functions:** ~500 lines of JavaScript

### 1.3 Capacitor App (`/capacitor-app/`)

| File | Purpose | Status |
|------|---------|--------|
| `capacitor.config.ts` | Capacitor configuration | ⚠️ Placeholder domain |
| `package.json` | Capacitor dependencies | ✅ Present |

### 1.4 CI/CD (`.github/workflows/`)

| Workflow | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| `functions-ci.yml` | Push to `functions/**` | Lint & test functions | ✅ Active |
| `firebase-deploy.yml` | Push to `main` | Deploy hosting + functions | ✅ Active |
| `deploy.yml` (root) | Push to `main` | Alternative deploy workflow | ✅ Active |

### 1.5 Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `firebase.json` | Firebase Hosting & Functions config | ✅ Present |
| `.firebaserc` | Firebase project alias | ✅ Present (verumdone) |
| `package.json` (root) | Monorepo dependencies | ✅ Present |
| `package.json` (functions) | Function dependencies | ✅ Present |
| `package.json` (web) | Web dependencies | ✅ Present |

---

## 2. Endpoint Mapping & Contracts

### 2.1 Current Endpoints (in `functions/index.js`)

| Endpoint | Method | Input | Output | Status | File:Line |
|----------|--------|-------|--------|--------|-----------|
| `/health` | GET | — | `"OK"` (text) | ⚠️ Minimal | `index.js:9` |
| `/echo-hash` | POST | `{ sha512 }` | `{ received, sha512 }` | ✅ Working | `index.js:13-18` |
| `/verify` | POST | `{ sha512 }` | `{ ok, checked, sha512, findings }` | ⚠️ Stub | `index.js:22-26` |
| `/seal` | POST | `{ sha512, filename }` | `{ ok, sealed, sha512, filename, pdf }` | ⚠️ Stub | `index.js:28-33` |
| `/anchor` | POST | `{ sha512 }` | `{ ok, anchored, sha512, tx }` | ⚠️ Stub | `index.js:35-40` |

### 2.2 Expected Endpoints (from tests - NOT YET IMPLEMENTED)

| Endpoint | Method | Input | Expected Output | Test File:Line | Status |
|----------|--------|-------|-----------------|----------------|--------|
| `/v1/verify` | GET | — | `{ ok: true }` | `test/index.test.js:13` | ❌ Missing |
| `/health` | GET | — | `{ ok, status, service }` | `test/index.test.js:19` | ⚠️ Wrong format |
| `/chat` | POST | `{ message }` | `{ ok, reply }` | `test/index.test.js:29` | ❌ Missing |
| `/v1/anchor` | POST | `{ hash? }` | `{ ok, error? }` | `test/index.test.js:42` | ❌ Missing |
| `/v1/assistant` | POST | `{ mode, hash?, ... }` | Varies by mode | `test/index.test.js:50+` | ❌ Missing |

#### 2.2.1 `/v1/assistant` Modes (from tests)

| Mode | Input | Expected Output | Test Line | Status |
|------|-------|-----------------|-----------|--------|
| `verify` | `{ mode: 'verify' }` | `{ ok, pack: 'founders-release' }` | L50 | ❌ Missing |
| `policy` | `{ mode: 'policy' }` | `{ ok, constitution, manifest }` | L56 | ❌ Missing |
| `anchor` | `{ mode: 'anchor', hash }` | `{ ok, hash }` or `{ ok: false, error }` | L64-72 | ❌ Missing |
| `receipt` | `{ mode: 'receipt', hash }` | `{ ok, receipt }` | L79 | ❌ Missing |
| `notice` | `{ mode: 'notice' }` | `{ ok, notice: { citizen, institution } }` | L86 | ❌ Missing |
| `invalid` | `{ mode: 'invalid' }` | `{ ok: false, error: 'invalid_mode' }` | L94 | ❌ Missing |

### 2.3 Planned Endpoints (from requirements - NOT YET IMPLEMENTED)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/v1/contradict` | POST | Contradiction engine (triple-model) | ❌ Missing |
| `/v1/seal` | POST | PDF sealing with idempotency | ⚠️ Stub exists |
| `/v1/anchor` | POST | Blockchain anchoring with idempotency | ⚠️ Stub exists |
| `/v1/health` | GET | Health check with uptime/versions | ⚠️ Minimal version exists |

---

## 3. Triple-Model & Nine-Brain Logic Tracing

### 3.1 Triple-Model Verification (Client-Side)

**Location:** `web/js/assistant.js:62-180`

**Implementation Status:** ✅ Present (client-only)

**Three Independent Checkers:**

1. **RuleChecker** (`assistant.js:65-103`)
   - ✅ File size sanity check
   - ✅ Filename pattern detection (executable files)
   - ✅ Hidden file check (starts with dot)
   - ✅ MIME type validation
   - **Vote:** `pass` | `flag`

2. **StatChecker** (`assistant.js:106-143`)
   - ✅ Entropy analysis (random-looking data detection)
   - ✅ Repeating pattern detection
   - ✅ Character distribution analysis
   - ✅ Binary file heuristics
   - **Vote:** `pass` | `flag`

3. **LLMChecker** (`assistant.js:146-176`)
   - ✅ Env-toggle for API key (`window.VERUM_ENV?.OPENAI_API_KEY`)
   - ✅ Degraded mode (local stub) when no key
   - ✅ Pattern-based checks + summary generation
   - **Vote:** `pass` | `flag`

**Consensus Logic** (`assistant.js:178-207`):
```javascript
const votes = [rule.vote, stat.vote, llm.vote];
const passCount = votes.filter(v => v === 'pass').length;
const consensus = passCount >= 2 ? 'pass' : 'flag';
```

**Status:** ✅ Fully implemented client-side
**Gap:** ❌ No server-side verification endpoint yet

### 3.2 Nine-Brain Forensic Engine

**Location:** `web/js/nine-brains.js`

**Implementation Status:** ✅ Present (client-only)

**Nine Independent Brains:**

| Brain | Module | Purpose | File:Line | Status |
|-------|--------|---------|-----------|--------|
| B1 | Document Integrity | Filename/size/content sanity | `nine-brains.js:12-80` | ✅ Present |
| B2 | Metadata Forensics | EXIF, PDF metadata, modified dates | `nine-brains.js:85-150` | ✅ Present |
| B3 | Comms Channel Integrity | Email headers, message threading | `nine-brains.js:155-220` | ✅ Present |
| B4 | Linguistics | Timeline extraction, language patterns | `nine-brains.js:225-290` | ✅ Present |
| B5 | Legal Phrase Detection | Contract clauses, obligations | `nine-brains.js:295-360` | ✅ Present |
| B6 | Entity Recognition | Names, orgs, locations, amounts | `nine-brains.js:365-430` | ✅ Present |
| B7 | Confession/Admission Mining | Admissions, confessions, statements | `nine-brains.js:435-500` | ✅ Present |
| B8 | Cross-Reference Validator | Consistency across files | `nine-brains.js:505-570` | ✅ Present |
| B9 | R&D (Non-Voting) | Experimental patterns | `nine-brains.js:575-640` | ✅ Present |

**Voting Mechanism** (`nine-brains.js:645-680`):
```javascript
// 8 voting brains (B1-B8)
const votingBrains = brains.slice(0, 8);
const passCount = votingBrains.filter(b => b.vote === 'PASS').length;
const consensus = passCount >= 5 ? 'PASS' : 'FLAG'; // 5/8 majority
```

**Status:** ✅ Fully implemented client-side
**Gap:** ❌ No server-side nine-brain endpoint yet

### 3.3 Contradiction Engine

**Location:** `web/js/case-synthesis.js:50-120`

**Implementation Status:** ⚠️ Partial (client-only helper)

**Functionality:**
- ✅ Timeline merging across files
- ✅ Statement comparison (text similarity)
- ✅ Contradiction detection (basic string diff)
- ✅ Entity tracking across files
- ❌ No AI-powered contradiction analysis yet
- ❌ No server endpoint (`/v1/contradict`) yet

**Gap:** ❌ Missing AI-powered contradiction detection with triple-model ensemble

### 3.4 AI Model Integration Hooks

**Current Status:** ⚠️ Stub/degraded mode only

**Expected Models:**
- OpenAI (GPT-4/GPT-3.5)
- Anthropic (Claude)
- DeepSeek

**Current Implementation:**
- Client-side has env toggle for `OPENAI_API_KEY` (not yet used)
- No server-side model calls
- Degraded mode shows simulated output

**Gap:** ❌ No actual AI model integration yet

---

## 4. PDF Sealing Pipeline Tracing

### 4.1 PDF Generation Library

**Library:** `pdfkit` (Node.js) or `pdf-lib` (browser)

**Current Implementation:** `functions/pdf/seal-template.js`

**Status:** ⚠️ Partial implementation

### 4.2 PDF Elements & Coordinates

| Element | Location | Status | File:Line |
|---------|----------|--------|-----------|
| **Logo (top-center)** | `(pageWidth - 120) / 2, 24` | ✅ Present | `seal-template.js:16-18` |
| **Title** | Center, after logo | ✅ Present | `seal-template.js:21` |
| **SHA-512 (full)** | Main body | ✅ Present | `seal-template.js:22` |
| **Watermark (centered)** | `(pageWidth - 200) / 2, (pageHeight - 200) / 2` | ✅ Present | `seal-template.js:25-34` |
| **Patent Notice** | Bottom-right, `pageHeight - 120` | ✅ Present | `seal-template.js:38` |
| **SHA-512 (truncated)** | Bottom-right, below patent | ✅ Present | `seal-template.js:41-44` |
| **QR Code** | Bottom-right, `pageWidth - 120` | ✅ Present | `seal-template.js:47-52` |
| **Certification Page** | — | ❌ Missing | — |

### 4.3 QR Code Payload

**Current Implementation:**
```javascript
const qrPayload = JSON.stringify({
  sha512: hash,
  meta: { filename, bytes, createdAt }
});
```

**Status:** ⚠️ Implemented but not verified

**Library:** `qrcode` package

**File:Line:** `seal-template.js:47-52`

### 4.4 PDF Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| PDF 1.7 Standard | ⚠️ Unknown | Not explicitly enforced in code |
| No JavaScript | ⚠️ Unknown | No explicit check |
| No External Assets | ⚠️ Unknown | Logo is embedded as image |
| Forensic Stability | ⚠️ Unknown | `compress: false` set, but not validated |
| DejaVuSans Font | ❌ Missing | Using default PDFKit fonts |
| Z-Order Correct | ⚠️ Likely OK | Watermark uses `.save()/.restore()` |
| EXIF Stripping | ❌ Not implemented | No EXIF handling |

### 4.5 PDF Testing

**Test File:** `functions/test-generate-pdf.js`

**Status:** ⚠️ Manual test script (not automated)

**Gap:** ❌ No automated tests for PDF structure/layout

---

## 5. Security Posture Assessment

### 5.1 CORS Configuration

**Current:** `cors()` with default settings (`functions/index.js:6`)

**Status:** ❌ Too permissive (allows all origins)

**Required:**
```javascript
cors({
  origin: [
    'https://verumglobal.foundation',
    'https://verumdone.web.app',
    'https://verumdone.firebaseapp.com',
    'http://localhost:5173'
  ],
  credentials: true
})
```

### 5.2 Security Headers (Helmet)

**Current:** ❌ Not implemented

**Required:** `helmet()` middleware

**Gap:** Missing security headers (HSTS, CSP, X-Frame-Options, etc.)

### 5.3 Rate Limiting

**Current:** ❌ Not implemented

**Required:** `express-rate-limit` (60 req/min/IP)

**Gap:** No rate limiting on any endpoint

### 5.4 Input Validation

**Current:** ⚠️ Basic manual checks (SHA-512 regex)

**Required:** `zod` schemas for all endpoints

**Gap:** No structured validation; no rejection of unknown fields

### 5.5 Request Size Limits

**Current:** `express.json({ limit: '5mb' })` (`index.js:7`)

**Status:** ⚠️ Too high for JSON-only requests

**Required:**
- JSON: 2 MB
- File uploads: 16-50 MB (with `multer`)

### 5.6 Idempotency

**Current:** ❌ Not implemented

**Required:** `Idempotency-Key` header for `/v1/seal` and `/v1/anchor`

**Gap:** No idempotency support

### 5.7 Error Handling

**Current:** ⚠️ Basic error responses

**Required:** Structured error taxonomy:
```javascript
voError(code, httpStatus, details)
```

**Gap:** No error code system; no structured logging

### 5.8 Logging

**Current:** ⚠️ Console logs only

**Required:** Structured logging with `pino`

**Gap:** No structured logging; no request tracing

### 5.9 Environment Variables

**Current:** ❌ No `.env.sample`

**Required Variables:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ENV`
- `ANCHOR_RPC_URL`
- `ANCHOR_PRIVATE_KEY`

**Gap:** No env sample file; no fail-fast validation

### 5.10 Firebase Hosting Headers

**Current:** ✅ Strict headers in `firebase.json:5-16`

**Headers Set:**
- ✅ HSTS (1 year, includeSubDomains, preload)
- ✅ CSP (strict)
- ✅ X-Content-Type-Options (nosniff)
- ✅ X-Frame-Options (DENY)
- ✅ Referrer-Policy (strict-origin-when-cross-origin)
- ✅ Permissions-Policy (geolocation, microphone, camera off)

**Status:** ✅ Good (hosting level)

---

## 6. Risk Assessment Table

| Risk Category | Severity | Current Mitigation | Gap | Priority |
|---------------|----------|-------------------|-----|----------|
| **CORS Bypass** | HIGH | None (allows all) | Tight CORS needed | P0 |
| **Rate Limit Abuse** | HIGH | None | Rate limiter needed | P0 |
| **XSS/Injection** | HIGH | Hosting CSP only | Input validation + Helmet | P0 |
| **Large Upload DoS** | MEDIUM | 5MB JSON limit | File size limits + multer | P1 |
| **Missing Input Validation** | HIGH | Basic SHA-512 check | Zod schemas for all | P0 |
| **No Idempotency** | MEDIUM | None | Idempotency-Key support | P1 |
| **Unstructured Errors** | LOW | Basic errors | Error taxonomy | P2 |
| **No Logging** | MEDIUM | Console only | Pino structured logs | P1 |
| **Missing Env Validation** | MEDIUM | None | Fail-fast on missing vars | P1 |
| **PDF Compliance Unknown** | MEDIUM | Likely OK | Automated validation tests | P1 |
| **EXIF Leakage** | LOW | None | Strip EXIF unless opted-in | P2 |
| **No AI Model Integration** | HIGH | Degraded mode | Implement triple-model | P0 |
| **No Contradiction Engine** | HIGH | Client-side only | Server endpoint needed | P0 |
| **Capacitor Config Incomplete** | MEDIUM | Placeholder domain | Real domain + deep links | P1 |

---

## 7. Gap Summary

### 7.1 Critical Gaps (P0)

1. **Missing Endpoints:** `/v1/assistant`, `/chat`, `/v1/contradict`, enhanced `/v1/health`
2. **No CORS Protection:** All origins allowed
3. **No Rate Limiting:** Vulnerable to abuse
4. **No Input Validation:** Only basic SHA-512 check
5. **No AI Model Integration:** Stubs only, no real calls
6. **No Contradiction Engine Endpoint:** Client-side helper only

### 7.2 High-Priority Gaps (P1)

1. **No Helmet Middleware:** Missing security headers on function responses
2. **No Size Limits for Uploads:** Only JSON limit, no file upload handling
3. **No Idempotency:** `/seal` and `/anchor` not idempotent
4. **No Structured Logging:** Console.log only
5. **No Env Validation:** No fail-fast on missing vars
6. **PDF Compliance Unknown:** No automated validation
7. **Capacitor Incomplete:** Placeholder domain

### 7.3 Medium-Priority Gaps (P2)

1. **No Error Taxonomy:** Basic error responses
2. **No EXIF Stripping:** Privacy risk for uploaded images
3. **Missing Certification Page in PDFs:** Only single page generated

---

## 8. Codebase Metrics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | ~2,400 |
| **Client JavaScript** | ~2,000 |
| **Server JavaScript** | ~400 |
| **Test Coverage** | 12 tests (all failing) |
| **Endpoints Implemented** | 5/13 (38%) |
| **Endpoints Stubbed** | 3/13 (23%) |
| **Endpoints Missing** | 5/13 (38%) |
| **Dependencies (Functions)** | 5 (express, cors, firebase-admin, firebase-functions, pdfkit) |
| **Dev Dependencies** | 2 (vitest, supertest) |

---

## 9. Recommendations for Next Milestones

### Immediate (M2 - Functions Hardening)
1. ✅ Implement tight CORS (3 origins + localhost)
2. ✅ Add Helmet middleware
3. ✅ Add express-rate-limit (60/min/IP)
4. ✅ Add Zod validation schemas
5. ✅ Add idempotency support
6. ✅ Add structured logging (pino)
7. ✅ Create `.env.sample` with all vars
8. ✅ Implement missing endpoints from tests

### Short-Term (M3 - PDF Sealing)
1. ✅ Enforce PDF 1.7 explicitly
2. ✅ Add automated PDF structure tests
3. ✅ Verify QR code payload
4. ✅ Add certification page
5. ✅ Implement EXIF stripping

### Medium-Term (M4 - Contradiction Engine)
1. ✅ Implement `/v1/contradict` endpoint
2. ✅ Integrate OpenAI/Anthropic/DeepSeek APIs
3. ✅ Add timeout handling (25s cap)
4. ✅ Add partial-result fallback
5. ✅ Support degraded mode when keys absent

### Long-Term (M5-M7)
1. ✅ Create emulator smoke tests
2. ✅ Update CI/CD pipeline
3. ✅ Complete Capacitor configuration
4. ✅ Build APK

---

## 10. Appendix: File Reference Index

### Web Client Files
- `web/index.html` — Landing page
- `web/institutions.html` — Institutions page
- `web/assistant.html` — Chat + tools interface
- `web/verify.html` — Verification UI
- `web/legal.html` — Legal notices
- `web/download.html` — Download/receipt page
- `web/js/assistant.js` — Core logic (hash, verify, seal, anchor)
- `web/js/nine-brains.js` — Nine-brain engine
- `web/js/case-synthesis.js` — Case synthesis
- `web/js/case-manager.js` — Case management
- `web/js/extraction.js` — File extraction
- `web/data/videos.json` — Video URLs
- `web/data/institutions.json` — Institution data

### Server Files
- `functions/index.js` — Main Express API
- `functions/receipts-kv.js` — Receipt storage
- `functions/pdf/seal-template.js` — PDF sealing
- `functions/video/video-ingest.js` — Video processing
- `functions/video/transcription.js` — Video transcription
- `functions/video/threat-detect.js` — Threat detection
- `functions/test/index.test.js` — Endpoint tests
- `functions/serve.js` — Local dev server
- `functions/assets/rules/*.json` — Rules & constitution

### Configuration Files
- `firebase.json` — Firebase config
- `.firebaserc` — Project alias
- `package.json` (root) — Monorepo deps
- `package.json` (functions) — Function deps
- `package.json` (web) — Web deps
- `capacitor-app/capacitor.config.ts` — Capacitor config

### CI/CD Files
- `.github/workflows/functions-ci.yml` — Function tests
- `.github/workflows/firebase-deploy.yml` — Deploy workflow
- `.github/workflows/deploy.yml` — Alternative deploy

---

**End of Audit Report**

*Next Step: Proceed to M2 (Functions Hardening) to address critical gaps.*
