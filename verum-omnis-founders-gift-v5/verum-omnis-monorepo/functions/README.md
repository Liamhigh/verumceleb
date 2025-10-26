# Verum Omnis Functions

Firebase Cloud Functions for the Verum Omnis platform, providing secure document verification, sealing, and anchoring services.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase CLI (for deployment)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Run linter:**
   ```bash
   npm run lint
   ```

5. **Type check:**
   ```bash
   npm run typecheck
   ```

6. **Watch mode (auto-rebuild on changes):**
   ```bash
   npm run watch
   ```

## 🏗️ Architecture

This project uses:

- **TypeScript** with strict type checking
- **Express.js** for HTTP routing
- **Zod** for runtime validation
- **Helmet** for security headers
- **Compression** for response optimization
- **Rate limiting** to prevent abuse
- **CORS** with tight origin controls
- **Idempotency** for `/seal` and `/anchor` endpoints

## 📋 API Endpoints

### Health & Status

- `GET /health` - Basic health check
- `GET /v1/health` - Detailed health check with version info
- `GET /v1/verify` - Verify service status

### Chat & Assistant

- `POST /chat` - Echo chat endpoint (development)
- `POST /v1/assistant` - Multi-mode assistant endpoint
  - Modes: `verify`, `policy`, `anchor`, `receipt`, `notice`

### Verification & Sealing

- `POST /verify` - Verify a document hash
- `POST /seal` - Seal a document (with idempotency)
- `POST /anchor` - Anchor a hash (with idempotency)
- `POST /v1/anchor` - V1 anchor endpoint

### Hash Operations

- `POST /echo-hash` - Echo back a SHA-512 hash (validation test)

## 🔒 Security Features

### Headers

- HSTS with preload
- Content Security Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer Policy

### Rate Limiting

- 100 requests per 15 minutes per IP
- Configurable via `express-rate-limit`

### Idempotency

The `/seal` and `/anchor` endpoints support idempotency keys via the `Idempotency-Key` header:

```bash
curl -X POST https://yourapp.web.app/api/seal \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-operation-id-123" \
  -d '{"sha512":"..."}'
```

Idempotency keys are stored for 24 hours.

### Input Validation

All inputs are validated using Zod schemas. SHA-512 hashes must be exactly 128 hexadecimal characters.

## 🧪 Testing

### Unit Tests

```bash
npm test
```

Tests use Vitest and Supertest. All 12 test cases should pass.

### Emulator Smoke Tests

Run comprehensive smoke tests against Firebase emulators:

```bash
# From repository root
./scripts/emulator-smoke-test.sh
```

This script:
1. Builds the functions
2. Starts Firebase emulators
3. Runs 13 endpoint tests
4. Reports results and exits

### Manual Emulator Testing

```bash
# From monorepo root
cd ../
firebase emulators:start

# In another terminal, test endpoints
curl http://localhost:5001/verumdone/us-central1/api/health
```

## 📦 Build & Deploy

### Build

TypeScript is compiled to JavaScript in the `dist/` directory:

```bash
npm run build
```

The `dist/` directory is excluded from git but included in Firebase deployments.

### Deploy to Firebase

From the monorepo root:

```bash
firebase deploy --only functions
```

Or deploy both hosting and functions:

```bash
firebase deploy --only hosting,functions
```

## 🔧 Development Workflow

1. **Make changes** in `src/index.ts`
2. **Build** with `npm run build` (or use watch mode)
3. **Test** with `npm test`
4. **Lint** with `npm run lint`
5. **Type check** with `npm run typecheck`
6. **Commit** when all checks pass

## 📁 Project Structure

```
functions/
├── src/
│   └── index.ts          # Main TypeScript source
├── dist/                 # Compiled JavaScript (git-ignored)
├── test/
│   └── index.test.js     # Test suite
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.json        # ESLint configuration
└── README.md             # This file
```

## 🌍 Environment Variables

### Required

None for basic operation.

### Optional

- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (default: Firebase Hosting URLs)
- `NODE_ENV` - Set to `production` for production mode

## 🚨 Troubleshooting

### Tests fail with "Cannot find module"

Make sure you've built the TypeScript code:

```bash
npm run build
```

### Linter errors

Fix automatically where possible:

```bash
npm run lint -- --fix
```

### Type errors

Run type check to see all errors:

```bash
npm run typecheck
```

## 📝 Legacy Notes

- Old PDF generation code is in `test-generate-pdf.js` and `generate-batch-seals.js` (not yet ported to TypeScript)
- Receipts are stored in-memory; Firestore integration is planned
- Run `node test-generate-pdf.js` to generate a single test PDF at `./tmp-test-seal.pdf`
- Run `node generate-batch-seals.js` to generate multiple PDF seals and a `seals/forensics.json` file

## 🔗 Related Documentation

- [Main README](../README.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md)
- [Production Readiness Report](../PRODUCTION_READINESS_REPORT.md)
