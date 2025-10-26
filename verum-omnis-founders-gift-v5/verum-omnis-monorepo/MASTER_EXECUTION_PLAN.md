# Master Execution Plan: Verum Omnis Production Readiness

This document combines the responsibilities of **Copilot** (UI/Frontend) and **CodeAgent** (Backend/Automation) to ensure both work in parallel without overlap.

---

## Division of Responsibilities

### 🎨 Copilot (Designer/Builder)
**Role:** Makes pages look proper and unifies UI

**Responsibilities:**
- Front-end HTML/CSS/JavaScript
- UI/UX design and styling
- Dark theme implementation
- Responsive design (mobile-first)
- Page layout and visual components
- Logo placement and branding
- Chat interface design
- Form layouts and interactions

**Out of Scope:**
- Backend logic
- API endpoints
- Database operations
- Build/deployment automation
- Testing infrastructure

---

### ⚙️ CodeAgent (Engineer in Background)
**Role:** Keeps scanning repo, checking logic, making sure Functions and workflows run

**Responsibilities:**
- Backend API implementation
- Firebase Functions development
- CI/CD pipeline maintenance
- Testing infrastructure
- PDF sealing logic
- Cryptographic operations (SHA-512)
- Build automation
- Mobile app builds (APK)
- Documentation validation

**Out of Scope:**
- Front-end styling
- UI design decisions
- Visual branding
- Page layouts
- CSS modifications

---

## Current Project State

### ✅ Completed (CodeAgent)

1. **Functions Implementation**
   - All `/v1/` API endpoints implemented
   - 12/12 tests passing
   - Proper error handling and validation
   - Constitution and manifest loading
   - In-memory receipt storage

2. **Testing Infrastructure**
   - Unit tests with Vitest (12/12 passing)
   - Smoke tests (PowerShell + HTTP)
   - Test documentation

3. **CI/CD Pipeline**
   - Deploy workflow configured
   - Automatic deployment to Firebase
   - Test execution before deploy
   - Environment properly configured

4. **Documentation**
   - CodeAgent instructions created
   - MOBILE.md (mobile build guide)
   - LEGAL.md (licensing and disclaimers)
   - ops/smoke/README.md (smoke test guide)
   - .env.sample (environment template)

5. **Capacitor Setup**
   - Setup scripts created (Linux/Windows)
   - Package.json configured
   - Documentation provided

### 🚧 Remaining Work

#### Copilot (UI/Frontend)
- [ ] Unify dark theme across all pages
- [ ] Fix broken pages (Assistant, Institutions)
- [ ] Create Tax Returns page
- [ ] Create Legal Advice page
- [ ] Ensure consistent header/footer
- [ ] Implement responsive design
- [ ] Video integration from Firebase Storage
- [ ] Logo placement and watermarks

#### CodeAgent (Backend/Automation)
- [ ] Implement full PDF 1.7 sealing with PDFKit
  - Logo embedding
  - Watermark generation
  - QR code generation
  - Certification page
- [ ] Add AI integration (when API keys provided)
  - OpenAI integration
  - Anthropic integration
  - DeepSeek integration
  - Triple-verification logic
- [ ] Implement blockchain anchoring (when configured)
- [ ] Build actual Android APK
- [ ] Place APK in web/downloads/verum-omnis.apk
- [ ] Add comprehensive logging

---

## Coordination Rules

### File Ownership

**Copilot owns:**
- `web/*.html` (all HTML files)
- `web/css/*.css` (all stylesheets)
- `web/js/ui.js` (UI-specific JavaScript)
- `web/assets/` (images, fonts, static resources)

**CodeAgent owns:**
- `functions/` (all backend code)
- `.github/workflows/` (CI/CD pipelines)
- `capacitor-app/android/` (mobile native code)
- `ops/` (operational scripts)
- Root-level documentation (README, DEPLOYMENT, etc.)

**Shared (coordinate changes):**
- `web/js/assistant.js` (UI + business logic)
- `web/js/verify.js` (UI + hashing logic)
- `firebase.json` (hosting + functions config)
- Package.json files (dependencies)

### Communication Protocol

1. **Before modifying shared files:**
   - Check recent changes
   - Leave clear comments explaining changes
   - Update relevant documentation

2. **When changes affect the other role:**
   - Document API changes in README
   - Update integration tests
   - Add migration notes if needed

3. **Conflict resolution:**
   - Copilot changes take precedence for UI/UX decisions
   - CodeAgent changes take precedence for logic/security
   - Discuss breaking changes before implementing

---

## API Contract (Copilot ↔ CodeAgent)

### Endpoints Copilot Depends On

All endpoints return JSON with `{ ok: boolean, ... }` structure.

#### Health & Info
```
GET /health
→ { ok: true, status: "healthy", service: "verum-omnis-api" }

GET /v1/verify
→ { ok: true, pack: "founders-release", version: "..." }
```

#### Chat
```
POST /chat
Body: { message: string }
→ { ok: true, reply: string, message: string }
```

#### Verification
```
POST /v1/verify
Body: { sha512: string }
→ { ok: true, checked: true, sha512: string, findings: [] }
```

#### Sealing
```
POST /v1/seal
Body: { sha512: string, filename?: string }
→ { ok: true, sealed: true, sha512: string, filename: string | null, pdf: string }
```

#### Anchoring
```
POST /v1/anchor
Body: { sha512: string }
→ { ok: true, anchored: true, sha512: string, tx: string }
```

#### Contradiction Detection
```
POST /v1/contradict
Body: { statements: string[] }
→ { ok: true, contradictions: [...], count: number }
```

#### Unified Assistant
```
POST /v1/assistant
Body: { mode: string, hash?: string }
Modes: "verify" | "policy" | "anchor" | "receipt" | "notice"
→ Varies by mode
```

### Error Responses

All errors return:
```json
{
  "ok": false,
  "error": "error_code_string"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `404` - Not found
- `500` - Server error

---

## Development Workflow

### Local Development

**Copilot workflow:**
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/web
python3 -m http.server 8000
# Open http://localhost:8000 in browser
```

**CodeAgent workflow:**
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
SKIP_IMMUTABLE_VERIFY=1 node serve.js
# API available at http://localhost:8000/api
```

### Testing

**Copilot testing:**
- Manual UI testing in browser
- Responsive design testing
- Cross-browser compatibility

**CodeAgent testing:**
```bash
cd functions
npm test                    # Unit tests
cd ../ops/smoke
pwsh local-smoke.ps1        # Smoke tests
```

### Deployment

**Both roles:**
- Work on feature branches
- Open PRs with clear descriptions
- Wait for CI/CD to pass
- Merge to `main` triggers automatic deployment

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (CodeAgent)
- [ ] UI looks correct on mobile and desktop (Copilot)
- [ ] No console errors (Copilot)
- [ ] No build warnings (CodeAgent)
- [ ] Documentation updated (Both)
- [ ] Environment variables configured (CodeAgent)

### Deployment

- [ ] Merge to `main` branch
- [ ] CI/CD runs automatically
- [ ] Tests execute and pass
- [ ] Firebase Hosting deployed
- [ ] Firebase Functions deployed
- [ ] Smoke tests run on production

### Post-Deployment

- [ ] Verify live site loads (Copilot)
- [ ] Test critical user flows (Copilot)
- [ ] Check API health endpoints (CodeAgent)
- [ ] Monitor logs for errors (CodeAgent)
- [ ] Update DEPLOYMENT_SUMMARY.md (Both)

---

## Emergency Procedures

### Production Issues

**UI broken (Copilot handles):**
1. Revert recent HTML/CSS changes
2. Test locally
3. Deploy hotfix

**API broken (CodeAgent handles):**
1. Check logs: `firebase functions:log`
2. Revert recent function changes
3. Deploy hotfix
4. Update monitoring

### Rollback

```bash
# Revert to previous deployment
git revert <commit-hash>
git push origin main
# CI/CD will auto-deploy
```

---

## Success Metrics

### Copilot Success
- [ ] All pages load without errors
- [ ] Dark theme applied consistently
- [ ] Mobile-responsive on all pages
- [ ] Logo and branding correct
- [ ] Videos play from Firebase Storage
- [ ] Forms and buttons work
- [ ] Chat interface functional

### CodeAgent Success
- [ ] All API endpoints return correct responses
- [ ] 100% test pass rate
- [ ] CI/CD deploys successfully
- [ ] Mobile APK builds
- [ ] Documentation complete and accurate
- [ ] No security vulnerabilities
- [ ] Performance benchmarks met

### Combined Success
- [ ] End-to-end user flows work
- [ ] Document upload → hash → seal → download
- [ ] Chat interactions feel natural
- [ ] Institutions see 20% notice
- [ ] Citizens get free access
- [ ] Legal disclaimers visible
- [ ] Mobile app works on Android

---

## Contact & Escalation

**For UI/UX questions:** Tag Copilot
**For backend/logic questions:** Tag CodeAgent
**For architectural decisions:** Discuss both

---

*This plan ensures Copilot and CodeAgent work efficiently in parallel, delivering a production-ready Verum Omnis system.*
