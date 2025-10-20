# Verum Celeb - Verum Omnis Repository

This repository contains the **Verum Omnis Founders Release** - a stateless, hash-first forensic documentation system with cryptographic integrity verification.

## 🚀 Quick Navigation

- **🎯 [DEPLOYMENT QUICKSTART](./DEPLOYMENT_QUICKSTART.md)** - Complete deployment in 3 steps
- **Main Application**: [`verum-omnis-founders-gift-v5/verum-omnis-monorepo/`](./verum-omnis-founders-gift-v5/verum-omnis-monorepo/)
- **Deployment Guide**: [`DEPLOYMENT.md`](./verum-omnis-founders-gift-v5/verum-omnis-monorepo/DEPLOYMENT.md)
- **Product Specification**: [`PRODUCT_SPEC.md`](./verum-omnis-founders-gift-v5/verum-omnis-monorepo/PRODUCT_SPEC.md)
- **Development Setup**: [`README.md`](./verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md)
- **Testing Guide**: [`TESTING.md`](./verum-omnis-founders-gift-v5/verum-omnis-monorepo/TESTING.md)
- **AI Agent Instructions**: [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)

## 📖 What is Verum Omnis?

**Verum Omnis** provides cryptographically verifiable document integrity without storing personally identifiable information (PII). The system consists of:

- **Web Application**: Document sealing and verification interface
- **Mobile Apps**: iOS and Android native apps via Capacitor
- **Backend API**: Firebase Functions for hash anchoring and PDF generation
- **Constitutional Governance**: Immutable rules enforced through cryptographic verification

## 🎯 Core Features

- ✅ **SHA-512 Hash Anchoring**: Cryptographic proof of document existence
- ✅ **PDF Sealing**: Generate sealed PDFs with embedded hashes and QR codes
- ✅ **Stateless Architecture**: No PII storage, privacy by design
- ✅ **Immutable Governance**: Constitutional rules verified at cold start
- ✅ **Cross-Platform**: Web + iOS + Android
- ✅ **Firestore Integration**: Persistent receipt storage
- ✅ **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions

## 🛠️ Quick Start

```bash
# Navigate to the main application
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Install dependencies
cd functions && npm install && cd ..

# Start local development
firebase emulators:start
```

Access the application at:
- **Web UI**: http://localhost:5000
- **API**: http://localhost:5001/api2/v1/verify
- **Emulator UI**: http://localhost:4000

## 📋 Documentation Structure

```
.
├── README.md (this file)
├── .github/
│   ├── copilot-instructions.md      # AI agent guidance
│   └── workflows/
│       └── deploy.yml                # CI/CD pipeline
│
└── verum-omnis-founders-gift-v5/verum-omnis-monorepo/
    ├── README.md                     # Development setup
    ├── PRODUCT_SPEC.md               # Complete product specification
    ├── TESTING.md                    # Testing guide
    ├── functions/                    # Backend API (Firebase Functions)
    │   ├── index.js                  # Main API endpoints
    │   ├── assets/rules/             # Immutable constitutional rules
    │   ├── pdf/                      # PDF generation
    │   └── receipts-kv.js            # Receipt storage
    ├── web/                          # Frontend (static HTML/CSS/JS)
    │   ├── index.html                # Landing page
    │   ├── verify.html               # Seal & verify interface
    │   ├── legal.html                # Legal documentation
    │   └── assets/                   # Logos and styles
    └── capacitor-app/                # Mobile app wrapper
        ├── android/                  # Android native project
        └── ios/                      # iOS native project (future)
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           User Interfaces                       │
│   Web (Firebase) | iOS (Capacitor) | Android    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│          API Layer (Firebase Functions)         │
│  /v1/verify | /v1/anchor | /v1/seal | /v1/...  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│        Storage Layer (Firestore + Memory)       │
│            Receipt persistence                  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│     Immutable Rules Engine (SHA-512 verified)   │
│         Constitutional governance               │
└─────────────────────────────────────────────────┘
```

## 🔒 Security Model

- **Cryptographic Verification**: All constitutional rules are SHA-512 verified on every function cold start
- **Stateless Design**: No PII storage, all operations are hash-based
- **Immutable Governance**: Rules cannot be casually modified; strict update process required
- **Privacy First**: Documents are never stored, only cryptographic hashes

## 🧪 Testing

```bash
# Run comprehensive API tests
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
node test-api.js

# Run with Firebase emulators
cd ..
firebase emulators:start
```

## 🚢 Deployment

**Automated** (via GitHub Actions):
- Push to `main` branch triggers automatic deployment
- Requires `FIREBASE_TOKEN` secret in GitHub

**Manual**:
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
firebase deploy --only hosting,functions
```

## 📱 Mobile Development

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/capacitor-app

# Build web assets
npm run build

# Sync with native platforms
npx cap sync

# Open in IDE
npx cap open android  # or ios
```

## 🤝 Contributing

This is a constitutional system with cryptographically enforced governance. Any changes to rules files require following the documented governance update process.

See [.github/copilot-instructions.md](./.github/copilot-instructions.md) for development guidelines.

## 📄 License

(To be determined)

**Patent Status**: Patent Pending

---

**⚖️ Constitutional Notice**: This system implements cryptographically enforced governance. Casual modifications to rules files will break integrity verification. Follow the documented governance process for any constitutional changes.
