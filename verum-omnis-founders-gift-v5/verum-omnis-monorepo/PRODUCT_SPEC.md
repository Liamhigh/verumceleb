# Verum Omnis - Comprehensive Product Specification

## Executive Summary

**Verum Omnis** is a stateless, hash-first forensic documentation system that provides cryptographic integrity verification for documents. The system consists of a web application, mobile app (iOS/Android), and backend API that enable users to seal documents with cryptographic proof, verify document authenticity, and maintain an immutable audit trail.

**Core Value Proposition**: Provide cryptographically verifiable document integrity without storing personally identifiable information (PII), ensuring privacy while maintaining forensic-grade authenticity.

---

## 1. Brand Principles

### Brand Identity
- **Name**: Verum Omnis (Latin: "All Truth")
- **Tagline**: "Patent Pending Verum Omnis" (appears on all sealed documents)
- **Core Promise**: Cryptographic integrity meets constitutional governance

### Design Philosophy
1. **Transparency First**: All operations are hash-based and verifiable
2. **Privacy by Design**: No PII storage, stateless architecture
3. **Immutable Governance**: Constitutional rules are cryptographically locked
4. **Accessibility**: Simple, clean interfaces for complex cryptographic operations

### Visual Identity
- **Logo Variants**:
  - `logo_black.png` - Primary logo for light backgrounds
  - `logo_blue.png` - Accent logo for branded materials
  - `logo_white.png` - Logo for dark backgrounds
  - `logo.png` - Default logo for general use

- **Color Palette**: (Inferred from branding)
  - Primary: Professional blue tones
  - Accent: Black for emphasis
  - Background: Clean white/light gray

---

## 2. Information Architecture

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACES                       │
├──────────────────┬──────────────────┬───────────────────┤
│   Web Frontend   │   iOS App        │   Android App     │
│   (Firebase      │   (Capacitor)    │   (Capacitor)     │
│    Hosting)      │                  │                   │
└──────────────────┴──────────────────┴───────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     API LAYER                            │
│              (Firebase Functions v2)                     │
│                                                          │
│  • /v1/verify    - Health check                         │
│  • /v1/anchor    - Hash anchoring                       │
│  • /v1/seal      - PDF generation                       │
│  • /v1/contradict - Text analysis                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                           │
│                                                          │
│  • Firestore     - Receipt persistence                  │
│  • In-Memory     - Fallback storage                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              IMMUTABLE RULES ENGINE                      │
│                                                          │
│  • Constitutional rules (SHA-512 verified)              │
│  • Guardianship treaty                                  │
│  • Policy documents                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Document Sealing Flow**:
1. User uploads or inputs document
2. System generates SHA-512 hash
3. Hash is anchored with timestamp receipt
4. PDF seal is generated with:
   - SHA-512 hash
   - QR code (links to verification)
   - Verum Omnis watermark/logo
   - Timestamp and metadata
5. Sealed PDF returned to user
6. Receipt stored in Firestore (or memory)

**Verification Flow**:
1. User provides document or hash
2. System recalculates SHA-512 hash
3. System retrieves receipt from storage
4. Verification result displayed with details

---

## 3. Screens & User Flows

### 3.1 Web Application Screens

#### Screen 1: Landing Page (`/index.html`)
**Purpose**: Welcome users and provide navigation to core features

**Components**:
- Hero section with Verum Omnis branding
- Brief description of constitutional locking
- Navigation links:
  - "Verify & Seal" → `/verify.html`
  - "Legal & Treaty" → `/legal.html`
- Logo gallery showcasing three logo variants
- Notice about UI flexibility vs. immutable rules

**User Actions**:
- Navigate to verification tool
- View legal documentation
- Understand system guarantees

#### Screen 2: Verify & Seal (`/verify.html`)
**Purpose**: Core functionality for document sealing and verification

**Components**:
- Document upload interface (or text input)
- Hash display area
- "Seal Document" button
- "Verify Hash" section
- Results display area

**User Actions**:
- Upload document or enter text
- Generate SHA-512 hash
- Create sealed PDF with cryptographic proof
- Verify existing document hashes
- Download sealed PDFs

**Technical Details**:
- Max file size: 4MB (configurable)
- Supported formats: Any (hash-based, format-agnostic)
- Hash algorithm: SHA-512
- PDF output: PDF 1.7 compliant

#### Screen 3: Legal & Treaty (`/legal.html`)
**Purpose**: Display constitutional documents and governance framework

**Components**:
- Guardianship Treaty viewer
- Constitutional rules documentation
- Policy documents
- Governance update process explanation

**User Actions**:
- Read constitutional documents
- Understand governance model
- View treaty details
- Download official documents

### 3.2 Mobile App Screens

The mobile app (iOS/Android via Capacitor) loads the web frontend with additional native capabilities:

**Core Screens** (mirrors web):
1. Landing/Home
2. Verify & Seal
3. Legal & Treaty

**Additional Mobile Features**:
- Offline hash calculation
- Local receipt caching
- Native file picker integration
- Camera integration for QR code scanning (future)
- Biometric authentication (future)

**Platform-Specific Considerations**:
- iOS: Requires splash screens and app icons compliant with Apple guidelines
- Android: Requires adaptive icons and proper permissions in manifest
- Both: Deep linking support for `vo://` protocol (QR codes)

---

## 4. In-App AI Behavior & Features

### 4.1 Text Contradiction Analysis

**Endpoint**: `POST /v1/contradict`

**Purpose**: Analyze text for internal contradictions or inconsistencies

**Current Status**: Stub implementation (returns empty findings)

**Planned Behavior**:
- Accept text input (up to 4MB)
- Use external LLM API for analysis
- Return contradiction score and findings
- No text storage (stateless processing)

**Request Format**:
```json
{
  "text": "Document text to analyze..."
}
```

**Response Format**:
```json
{
  "ok": true,
  "result": {
    "findings": [],
    "score": {
      "contradiction": 0.0
    }
  }
}
```

### 4.2 Future AI Capabilities

**Video Analysis** (Disabled by default):
- Video upload and processing
- Transcription services
- Threat detection in video content
- Deepfake detection (roadmap)

**Activation Control**: `config.video.json`
```json
{
  "enabled": false,
  "upload": false,
  "transcription": false,
  "threatDetection": false
}
```

---

## 5. Outputs & Deliverables

### 5.1 Sealed PDF Document

**Generated by**: `POST /v1/seal`

**Components**:
1. **Header Section**:
   - Verum Omnis logo watermark
   - "✔ Patent Pending Verum Omnis" badge
   - Document title (user-provided)

2. **Hash Section**:
   - SHA-512 hash (128 characters)
   - Displayed in monospace font
   - Clearly labeled

3. **QR Code**:
   - Encodes verification URL: `vo://{hash}`
   - Scannable for quick verification
   - Standard QR code size and error correction

4. **Metadata**:
   - Issue timestamp (ISO 8601 format)
   - Optional notes (user-provided)
   - Version information

5. **Footer**:
   - Constitutional notice
   - System identifier: "Founders Release"

**Technical Specifications**:
- Format: PDF 1.7
- Encryption: None (hash is public proof)
- Fonts: Embedded standard fonts
- Size: Typically < 100KB

### 5.2 Receipt Object

**Generated by**: `POST /v1/anchor`

**Format**: JSON

**Structure**:
```json
{
  "ok": true,
  "hash": "abc123...",
  "issuedAt": "2025-10-18T18:00:00.000Z"
}
```

**Storage**:
- Primary: Firestore collection `receipts`
- Fallback: In-memory Map (non-persistent)
- Key: Hash value
- Retention: Indefinite (no automatic deletion)

### 5.3 Verification Response

**Generated by**: `GET /v1/verify` or verification requests

**Format**: JSON

**Success Response**:
```json
{
  "ok": true,
  "pack": "founders-release",
  "time": "2025-10-18T18:00:00.000Z"
}
```

**Error Response**:
```json
{
  "ok": false,
  "error": "error_code_here",
  "message": "Human-readable description"
}
```

---

## 6. Technical Contracts

### 6.1 API Endpoint Specifications

#### Health Check
```
GET /v1/verify
Response: 200 OK
{
  "ok": true,
  "pack": "founders-release",
  "time": "ISO-8601-timestamp"
}
```

#### Hash Anchoring
```
POST /v1/anchor
Content-Type: application/json

Request:
{
  "hash": "SHA-512 hash string (128 chars hex)"
}

Response: 200 OK
{
  "ok": true,
  "hash": "echo of input hash",
  "issuedAt": "ISO-8601-timestamp"
}

Error Responses:
- 400: Missing or invalid hash
- 500: Receipt storage failed
```

#### Document Sealing
```
POST /v1/seal
Content-Type: application/json

Request:
{
  "hash": "SHA-512 hash string (required)",
  "title": "Document title (optional)",
  "notes": "Additional notes (optional)"
}

Response: 200 OK
Content-Type: application/pdf
[PDF binary data]

Error Responses:
- 400: Missing or invalid hash
- 500: PDF generation failed
```

#### Contradiction Analysis
```
POST /v1/contradict
Content-Type: application/json

Request:
{
  "text": "Text to analyze (max 4MB)"
}

Response: 200 OK
{
  "ok": true,
  "result": {
    "findings": [],
    "score": {
      "contradiction": 0.0
    }
  }
}

Error Responses:
- 400: Missing text
- 500: Analysis failed
```

### 6.2 Security Requirements

#### Input Validation
- All endpoints validate required fields
- Hash values must be valid hexadecimal
- Text inputs limited to 4MB
- No script injection allowed

#### Rate Limiting
- Implemented at Firebase Functions level
- Default: 100 requests/minute per IP
- Configurable via Firebase settings

#### CORS Policy
- Origin: `true` (accepts all origins)
- Allows: GET, POST
- Headers: Content-Type, Authorization

#### Authentication
- Current: None (public endpoints)
- Future: API key authentication for high-volume users
- Admin endpoints: Firebase Authentication required

### 6.3 Immutable Pack Contract

**Critical Guarantee**: The system MUST verify all constitutional rules on every cold start.

**Verification Process**:
1. Load `manifest.json` from `assets/rules/`
2. For each file in manifest:
   - Read file contents
   - Calculate SHA-512 hash
   - Compare with manifest hash
   - FAIL IMMEDIATELY if mismatch detected
3. Scan rules directory for extra files
4. FAIL IMMEDIATELY if unexpected files found

**Failure Behavior**:
- Throw error (no graceful degradation)
- Log detailed error message
- Prevent function deployment
- Alert monitoring systems

**Update Process**:
1. Generate new SHA-512 for modified files
2. Update `manifest.json` with new hashes
3. Update system `RULES_PACK_HASH`
4. Anchor new manifest with receipt
5. Deploy with strict verification

### 6.4 Storage Contracts

#### Receipt Storage
- **Interface**: `putReceipt(hash, receipt)`, `getReceipt(hash)`
- **Primary**: Firestore collection `receipts`
- **Fallback**: In-memory `Map()` (warning logged)
- **Guarantee**: At-least-once write (Firestore)
- **Consistency**: Eventually consistent
- **Durability**: Firestore guarantees persist across restarts

#### File Storage
- **Assets**: Stored in functions bundle (immutable)
- **Uploads**: Not stored (hash-only processing)
- **Outputs**: Temporary files in `/tmp/`, auto-deleted
- **Cleanup**: Functions runtime handles temp cleanup

---

## 7. Development Specifications

### 7.1 Technology Stack

**Frontend**:
- HTML5, CSS3, JavaScript (vanilla)
- No framework dependencies
- Firebase Hosting
- Responsive design (mobile-first)

**Backend**:
- Node.js 20 (ESM modules)
- Firebase Functions v2
- Express.js framework
- Pino logger

**Mobile**:
- Capacitor 6.x
- Android: SDK 21+ (Lollipop)
- iOS: iOS 13+
- TypeScript support

**Dependencies**:
```json
{
  "express": "^4.21.1",
  "firebase-functions": "^6.0.1",
  "firebase-admin": "^12.7.0",
  "cors": "^2.8.5",
  "helmet": "^8.0.0",
  "pdfkit": "^0.15.0",
  "qrcode": "^1.5.4",
  "multer": "^1.4.5-lts.1",
  "pino": "^9.5.0"
}
```

### 7.2 File Limits & Constraints

**Upload Limits**:
- Max body size: 4MB (JSON payload)
- Max file size: 4MB (future file uploads)
- Max text length: 4MB

**Hash Requirements**:
- Algorithm: SHA-512 only
- Format: Hexadecimal string
- Length: Exactly 128 characters
- Case: Lowercase preferred

**PDF Generation**:
- Max size: 10MB (practical limit)
- Timeout: 30 seconds
- Format: PDF 1.7 only

### 7.3 Environment Configuration

**Firebase Project**:
- Project ID: `gitverum`
- Region: `us-central1`
- Node runtime: 20

**Required Secrets** (Future):
- `OPENAI_API_KEY` - For AI analysis features
- Additional API keys as features expand

**Firebase Services**:
- Hosting: Enabled
- Functions: Enabled
- Firestore: Enabled
- Authentication: Disabled (currently)

### 7.4 Deployment Pipeline

**GitHub Actions Workflow**:
1. **Test Stage** (all branches):
   - Install Node.js 20, Java 21
   - Run `npm ci` in functions/
   - Verify immutable pack integrity
   - Run comprehensive API tests (`test-api.js`)
   - Build Capacitor app
   - Run Android unit tests

2. **Deploy Stage** (main branch only):
   - Install Firebase CLI
   - Deploy functions and hosting
   - Requires `FIREBASE_TOKEN` secret

**Manual Deployment**:
```bash
firebase deploy --only hosting,functions
```

---

## 8. Testing Strategy

### 8.1 Automated Tests

**Unit Tests** (`functions/test-api.js`):
- ✅ Immutable pack verification
- ✅ Manifest structure validation
- ✅ PDF sealing functionality
- ✅ Receipt storage (get/put operations)
- ✅ Video configuration checks
- ✅ Critical asset presence

**Integration Tests**:
- Immutable pack serves as integration test
- Successful function deployment = system integrity verified

**Mobile Tests**:
- Android: `./gradlew :app:test`
- iOS: XCTest suite (future)

### 8.2 Manual Testing Checklist

**Web Application**:
- [ ] Landing page loads correctly
- [ ] All navigation links work
- [ ] Logo variants display properly
- [ ] Verify & Seal interface functions
- [ ] Legal page displays documents
- [ ] Responsive design on mobile browsers

**API Endpoints**:
- [ ] Health check returns valid response
- [ ] Hash anchoring creates receipts
- [ ] PDF sealing generates valid PDFs
- [ ] Error responses are properly formatted

**Mobile App**:
- [ ] App installs on Android device
- [ ] App installs on iOS device
- [ ] Web content loads correctly
- [ ] Offline hash calculation works
- [ ] Deep linking responds to `vo://` URLs

### 8.3 Performance Benchmarks

**Expected Response Times**:
- Health check: < 100ms
- Hash anchoring: < 500ms
- PDF generation: < 2 seconds
- Verification: < 200ms

**Scalability Targets**:
- Concurrent users: 1,000+
- Requests per second: 100+
- Cold start time: < 3 seconds

---

## 9. Compliance & Governance

### 9.1 Constitutional Rules

The system is governed by immutable rules stored in `functions/assets/rules/`:

**Core Documents**:
1. `01_constitution.json` - Foundational governance rules
2. `02_contradiction_engine.yaml` - Analysis policies
3. `05_pdf_seal_policy.yaml` - Document sealing standards
4. `07_risk_scoring.yaml` - Risk assessment rules
5. `08_data_handling.yaml` - Privacy and data policies
6. `09_audit_trail.yaml` - Logging requirements
7. `27_guardianship.yaml` - Governance oversight
8. `28_founders.yaml` - Founders' specifications
9. `gift_rules_v5.json` - Consolidated rule set

**Treaty Documents**:
- `Guardianship_Treaty_Verum_Omnis_Founders.pdf`
- `Guardianship_Treaty_Verum_Omnis_Founders.yaml`

### 9.2 Privacy Guarantees

**No PII Storage**:
- System does NOT store document contents
- System does NOT store user information
- System only stores: hashes, timestamps, receipts

**Stateless Design**:
- Each request is independent
- No session management
- No user tracking

**Data Retention**:
- Receipts: Stored indefinitely
- Logs: 30-day retention (Firebase default)
- Temp files: Deleted immediately

### 9.3 Audit Trail

**Logged Events**:
- Function cold starts
- Immutable pack verification
- Receipt creation
- PDF generation
- Errors and failures

**Log Format**: JSON via Pino logger
**Log Level**: Info (production), Debug (development)
**Log Storage**: Firebase Cloud Logging

---

## 10. Future Roadmap

### Phase 1: Current (Founders Release) ✅
- Core API endpoints
- PDF sealing
- Receipt storage
- Immutable pack system
- Web frontend
- Mobile app wrapper

### Phase 2: Enhanced Verification (Q1 2026)
- [ ] Public verification portal
- [ ] Batch sealing operations
- [ ] API key authentication
- [ ] Enhanced QR code features
- [ ] Mobile native camera integration

### Phase 3: AI Integration (Q2 2026)
- [ ] Text contradiction analysis (LLM-powered)
- [ ] Document comparison
- [ ] Automated risk scoring
- [ ] Anomaly detection

### Phase 4: Video Processing (Q3 2026)
- [ ] Video upload and storage
- [ ] Transcription services
- [ ] Deepfake detection
- [ ] Threat analysis

### Phase 5: Enterprise Features (Q4 2026)
- [ ] Multi-user organizations
- [ ] Role-based access control
- [ ] Custom branding
- [ ] SLA guarantees
- [ ] Compliance reporting

---

## 11. Success Metrics

### User Engagement
- Active users (monthly)
- Documents sealed per day
- Verification requests per day
- Mobile app installations

### Technical Performance
- API response times (p50, p95, p99)
- Error rates
- Function cold start frequency
- Firestore read/write operations

### Business Metrics
- User acquisition cost
- Conversion rate (visitor → user)
- Retention rate (30-day)
- API usage growth

---

## 12. Support & Documentation

### User Documentation
- Landing page instructions
- Verification guide
- PDF seal interpretation
- Mobile app setup

### Developer Documentation
- API reference (this document)
- Deployment guide (README.md)
- Testing guide (TESTING.md)
- Contributing guidelines (future)

### Legal Documentation
- Terms of service (future)
- Privacy policy (future)
- Constitutional documents (present)
- Guardianship treaty (present)

---

## Appendix A: Glossary

**Terms**:
- **Hash**: SHA-512 cryptographic hash of document
- **Seal**: Cryptographically signed PDF with embedded hash
- **Receipt**: Timestamped record of hash anchoring
- **Immutable Pack**: Constitutional rules with cryptographic verification
- **Stateless**: No user data storage, hash-only processing
- **Constitutional**: Governance rules that cannot be casually modified

**Protocols**:
- `vo://` - Verum Omnis deep link protocol for verification

---

## Appendix B: Contact & Governance

**Project Maintainer**: Verum Omnis Foundation
**License**: (To be determined)
**Patent Status**: Patent Pending

**Governance Model**:
- Constitutional rules require cryptographic update process
- Guardianship treaty defines oversight structure
- Community input via GitHub issues (future)

---

## Document History

- **v1.0** (2025-10-18): Initial comprehensive product specification
- Created as part of Founders Release documentation
- Based on existing codebase and architectural decisions

---

**⚖️ Constitutional Notice**: This product specification reflects the current implementation of Verum Omnis Founders Release. Any changes to core functionality must follow the constitutional update process to maintain cryptographic integrity.
