# Functions - Quick Dev Notes

## Setup
- Run `npm install` in this folder to install dependencies.

## Testing
- Run `node test-api.js` to run comprehensive tests (immutable pack, PDF sealing, receipts, etc.)
- See `../TESTING.md` for detailed testing guide

## Batch PDF Generation
- Run `node generate-batch-seals.js` to generate multiple PDF seals and a `seals/forensics.json` file.

## Local Development
To run end-to-end locally, start the emulators from the monorepo root and then test endpoints:

```bash
cd ../verum-omnis-monorepo
firebase emulators:start

# In another terminal, test the seal endpoint
curl -X POST http://localhost:5001/api2/v1/seal \
  -H "Content-Type: application/json" \
  -d '{"hash":"abc","title":"My Seal","notes":"test"}' \
  --output seal.pdf
```

## Storage
- Receipts are written to Firestore when available
- Automatically falls back to in-memory storage (useful for local emulators)
- See `receipts-kv.js` for implementation

## Security
- Immutable pack verification runs on every cold start
- All constitutional rules are SHA-512 verified
- See `assets/rules/manifest.json` for hash registry
