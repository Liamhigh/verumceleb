# Verum Omnis Functions

Firebase Cloud Functions for the Verum Omnis platform, implementing document verification, sealing, anchoring, and AI-powered analysis.

## Requirements

- **Node.js**: v20.x (see `.nvmrc`)
- **Firebase CLI**: Install globally with `npm install -g firebase-tools`

## Quick Start

### 1. Install Dependencies

```bash
cd functions
npm ci
```

### 2. Configure Environment

```bash
cp .env.sample .env
# Edit .env and fill in your values
```

Required environment variables:
- `FIREBASE_APP_ENV`: Environment (prod|staging|local)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID

Optional (for AI features):
- `OPENAI_API_KEY`: OpenAI API key
- `DEEPSEEK_API_KEY`: DeepSeek API key
- `ANTHROPIC_API_KEY`: Anthropic API key

Optional (for blockchain anchoring):
- `ANCHOR_RPC_URL`: Ethereum/Polygon RPC URL
- `ANCHOR_PRIVATE_KEY`: Private key for anchoring

### 3. Build

```bash
npm run build
```

This compiles TypeScript to JavaScript using tsup/esbuild.

### 4. Run Tests

```bash
npm test
```

### 5. Run Locally with Emulators

```bash
# From the monorepo root
firebase emulators:start

# Or from the functions directory
npm run serve
```

The emulators will start on:
- Functions: http://localhost:5001
- Hosting: http://localhost:5000
- Emulator UI: http://localhost:4000

### 6. Run Smoke Tests

After starting the emulators, run the smoke tests:

**On Unix/Linux/macOS:**
```bash
cd ../..  # Go to repo root
./scripts/smoke-tests.sh
```

**On Windows (PowerShell):**
```powershell
cd ..\..  # Go to repo root
.\scripts\smoke-tests.ps1
```

## Development Workflow

### Watch Mode

```bash
npm run dev
```

This runs tsup in watch mode, automatically rebuilding when source files change.

### Linting

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

### Formatting

```bash
npm run format
```

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

### Chat
- `POST /chat` - Chat with AI assistant
  - Body: `{ "message": "..." }`

### V1 API

#### Verify
- `GET /v1/verify` - Basic verification info
- `POST /v1/verify` - Verify a document hash
  - Body: `{ "sha512": "..." }`

#### Seal
- `POST /v1/seal` - Seal a document
  - Body: `{ "sha512": "...", "filename": "...", "title": "..." }`

#### Contradict
- `POST /v1/contradict` - Detect contradictions
  - Body: `{ "items": ["statement1", "statement2", ...] }`

#### Anchor
- `POST /v1/anchor` - Anchor a hash to blockchain
  - Body: `{ "sha512": "..." }`

#### Assistant
- `POST /v1/assistant` - Multi-purpose assistant endpoint
  - Modes: `verify`, `policy`, `anchor`, `receipt`, `notice`, `seal`
  - Body: `{ "mode": "...", "hash": "..." }`

## Deployment

### Deploy to Firebase

```bash
npm run deploy
```

This will:
1. Build the TypeScript code
2. Deploy both Functions and Hosting

### Deploy Functions Only

```bash
firebase deploy --only functions
```

### Deploy to Specific Environment

Set the Firebase project alias first:

```bash
firebase use production   # or staging, dev, etc.
npm run deploy
```

## Architecture

### Directory Structure

```
functions/
├── src/
│   ├── config/          # Environment configuration
│   ├── middleware/      # Express middleware (error handling, validation)
│   ├── routes/          # API route handlers
│   │   ├── v1/         # V1 API routes
│   │   ├── chat.ts
│   │   ├── health.ts
│   │   └── index.ts
│   └── index.ts        # Main entry point
├── test/               # Tests
├── .env.sample         # Environment variables template
├── .gitignore
├── .nvmrc              # Node version
├── build.sh            # Build script
├── eslint.config.js    # ESLint configuration
├── package.json
├── tsconfig.json       # TypeScript configuration
└── README.md
```

### Security Features

- **Helmet**: Security headers
- **CORS**: Precise origin control
- **Rate Limiting**: 60 req/min per IP
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Structured error responses with machine codes
- **Request Logging**: Structured logs with pino

### Error Codes

All errors follow the `VO_E_*` pattern:
- `VO_E_INPUT`: Invalid input
- `VO_E_NOT_FOUND`: Resource not found
- `VO_E_RATE_LIMIT`: Rate limit exceeded
- `VO_E_INTERNAL`: Internal server error

## Troubleshooting

### Build Issues

If you see TypeScript errors:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Emulator Issues

If emulators won't start:
```bash
firebase emulators:start --import=.emulator --export-on-exit
```

### Test Failures

Ensure you've built the code first:
```bash
npm run build
npm test
```

## Performance

- **Cold Start**: < 2.5s (target)
- **p95 Latency**: < 1.5s for /verify with 2MB file (target)
- **Body Limits**: JSON 2MB, files 16-50MB

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Run lint: `npm run lint:fix`
5. Build: `npm run build`
6. Submit PR

## License

Proprietary - Verum Omnis
