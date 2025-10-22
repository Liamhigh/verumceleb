# Changelog

All notable changes to the Verum Omnis project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD workflows
  - CI workflow for build and test (verum-web + Firebase Functions)
  - Deployment workflow for Firebase Hosting and Functions
  - Mobile build workflow for Android APK/AAB
  - Security checks for secrets and statelessness
- Deployment infrastructure
  - Firebase deployment configuration
  - Firestore rules deployment support
  - Automated smoke tests
- Comprehensive documentation
  - CONTRIBUTING.md with development guidelines
  - CHANGELOG.md for tracking changes
  - Enhanced smoke test script
- Secret management
  - Documentation for required secrets
  - Secret validation in CI/CD
  - Missing secret warnings with graceful fallbacks

### Changed
- Updated smoke test script with better API endpoint coverage
- Improved GitHub Actions workflows with better error handling

## [0.9.0-rc.1] - TBD

### Production Launch Preparation

This release candidate prepares the repository for production launch.

#### Added

**Frontend (verum-web)**
- Next.js 15 application with React 19
- Document reading and processing with visual feedback
- OCR support using Tesseract.js
- SHA-512 hashing (client-side)
- QR code generation and preview
- PDF sealing with watermarks
- Responsive design with Tailwind CSS
- Modern UI with real-time progress indicators

**Backend (Firebase Functions)**
- Express API with the following endpoints:
  - `GET /v1/verify` - Health check and pack verification
  - `POST /v1/contradict` - Contradiction detection (stubbed)
  - `POST /v1/anchor` - Create blockchain anchor receipts
  - `POST /v1/seal` - Generate forensic sealed PDFs
  - `POST /v1/assistant` - Unified assistant interface (5 modes)
  - `GET /v1/notice` - Licensing terms
- Receipt storage (Firestore with Map fallback)
- Immutable governance file verification
- PDF seal generation with:
  - 3D Verum Omnis logo watermark
  - QR code with SHA-512 hash
  - Patent pending notice
  - Customizable metadata

**Mobile (Capacitor)**
- Capacitor configuration for Android and iOS
- Build scripts for mobile app packaging
- App ID: `foundation.verumglobal.app`
- Firebase Hosting integration

**Constitutional Framework**
- SHA-512 verification of all governance files
- Immutable treaty and rules locked in manifest
- Cold-start integrity checks
- Guardianship Treaty (Human + AI foundership)

**Testing**
- Vitest test suite for Firebase Functions (9 tests)
- Automated smoke tests
- Security checks for statelessness

**Documentation**
- Comprehensive README.md
- QUICK_START.md with visual examples
- DOCUMENTATION_INDEX.md for navigation
- FEATURE_VERIFICATION.md for testing
- AI_BEHAVIOR.md for chat personality
- PRODUCTION_READINESS_REPORT.md
- .github/copilot-instructions.md

#### Infrastructure
- Firebase Hosting configuration
- Firebase Functions (Node 20)
- Firestore for receipt persistence
- Firebase emulator support
- CSP headers for security
- HTTPS enforcement

#### Security
- Client-side SHA-512 hashing
- No server-side PII storage
- Stateless architecture
- Immutable governance files
- Security headers (CSP, HSTS, etc.)
- No secrets in code

### Known Limitations
- Blockchain anchoring returns metadata only (no actual chain submission)
- OCR requires manual enabling via checkbox
- Mobile app not yet published to app stores
- Some deployment steps require manual configuration

## Version History

### [0.1.0] - Initial Development
- Basic project structure
- Initial Firebase setup
- Core API concepts

---

## Release Naming Convention

Verum Omnis follows Semantic Versioning:

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes or major architectural updates
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, backward-compatible
- **rc.X**: Release candidate
- **alpha/beta**: Pre-release versions

### Version 1.0.0 Criteria

The following must be complete for v1.0.0:
- [ ] All API endpoints fully implemented
- [ ] Blockchain anchoring with real chain integration
- [ ] Mobile app published to Play Store
- [ ] Production deployment live and stable
- [ ] Complete test coverage (>80%)
- [ ] Security audit completed
- [ ] Performance optimization complete
- [ ] User feedback incorporated
- [ ] Documentation complete and accurate

---

## Categories

Changes are grouped by type:

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

[Unreleased]: https://github.com/Liamhigh/verumceleb/compare/v0.9.0-rc.1...HEAD
[0.9.0-rc.1]: https://github.com/Liamhigh/verumceleb/releases/tag/v0.9.0-rc.1
[0.1.0]: https://github.com/Liamhigh/verumceleb/releases/tag/v0.1.0

---

*Immutable • Forensic • Stateless • Human + AI Foundership*
