# Verum Omnis — Execution Notes (Ops)

## Prerequisites

- **Node.js**: v20.x (required - see `.nvmrc` in functions/)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**: For version control

## Quick Start (Local Development)

### 1. Web (Static Hosting)
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/web
python3 -m http.server 5173
# or use any static file server
```

### 2. Functions (with Emulators)

**First time setup:**
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions

# Install dependencies
npm ci

# Configure environment
cp .env.sample .env
# Edit .env and set FIREBASE_APP_ENV=local and other values

# Build TypeScript
npm run build
```

**Run with emulators:**
```bash
# From monorepo root
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
firebase emulators:start

# Or from functions directory
cd functions
npm run serve
```

**Emulator URLs:**
- Functions: http://localhost:5001/verumdone/us-central1/api
- Hosting: http://localhost:5000
- Emulator UI: http://localhost:4000

### 3. Run Smoke Tests

After starting emulators:

**Unix/Linux/macOS:**
```bash
./scripts/smoke-tests.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\smoke-tests.ps1
```

## Development Workflow

### Build Functions
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm run build
```

### Run Tests
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm test
```

### Lint & Format
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

### Watch Mode (Auto-rebuild)
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
npm run dev
```

## Deployment

### Automatic Deployment (Recommended)

Push to `main` branch. GitHub Actions will automatically:
1. Run tests and linting
2. Build TypeScript functions
3. Deploy to Firebase (Hosting + Functions)

**Required Secrets:**
- `FIREBASE_TOKEN`: Firebase CI token (get with `firebase login:ci`)

### Manual Deployment

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions

# Build first
npm run build

# Deploy
cd ..
firebase deploy --only hosting,functions
```

## Architecture

### Monorepo Structure
```
verum-omnis-founders-gift-v5/verum-omnis-monorepo/
├── web/                 # Static hosting files
├── functions/           # Firebase Cloud Functions (TypeScript)
│   ├── src/            # TypeScript source
│   ├── index.js        # Compiled output
│   ├── package.json
│   └── README.md
├── capacitor-app/      # Mobile app
└── firebase.json       # Firebase configuration
```

### Functions Features

- ✅ **TypeScript**: Strict type checking with ES2022 target
- ✅ **Security**: Helmet, CORS, rate limiting, input validation
- ✅ **Observability**: Structured logging with Pino
- ✅ **Error Handling**: Standardized error codes (VO_E_*)
- ✅ **Testing**: Vitest with 100% route coverage
- ✅ **Build**: tsup/esbuild for fast, optimized builds

### API Endpoints

- `GET /health` - Health check
- `POST /chat` - Chat with AI
- `POST /v1/verify` - Verify document hash
- `POST /v1/seal` - Seal document
- `POST /v1/contradict` - Detect contradictions
- `POST /v1/anchor` - Anchor to blockchain
- `POST /v1/assistant` - Multi-purpose assistant

See `functions/README.md` for detailed API documentation.

## Environment Variables

Required in `functions/.env`:

```bash
# Required
FIREBASE_APP_ENV=local          # prod|staging|local
FIREBASE_PROJECT_ID=verumdone

# Optional (AI features)
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
ANTHROPIC_API_KEY=

# Optional (blockchain)
ANCHOR_RPC_URL=
ANCHOR_PRIVATE_KEY=
```

**Never commit `.env` files!** Use `.env.sample` as a template.

## Troubleshooting

### Functions won't build
```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests failing
```bash
# Ensure you've built first
npm run build
npm test
```

### Emulators won't start
```bash
# Check Firebase CLI is installed
firebase --version

# Try with explicit import/export
firebase emulators:start --import=.emulator --export-on-exit
```

### CORS errors in browser
Check that your origin is in the allowed list in `src/index.ts`.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Test Functions**: Install → Build → Lint → Test
2. **Test Repository**: Run repository-level tests
3. **Deploy**: Build → Deploy to Firebase → Smoke tests

**Status:** All checks must pass before deployment to `main`.

## Performance Targets

- Cold start: < 2.5s
- p95 latency: < 1.5s (verify with 2MB file)
- Rate limit: 60 req/min per IP

## Security

- ✅ Input validation with Zod schemas
- ✅ Rate limiting (60 req/min)
- ✅ Helmet security headers
- ✅ CORS with explicit origin allow-list
- ✅ No secrets in code
- ✅ Structured error handling

---

**Copilot rules:** see [.github/copilot-instructions.md](.github/copilot-instructions.md)
