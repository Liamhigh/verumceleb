# Functions - Quick Dev Notes

- Run `npm install` in this folder to install dependencies.
- Run `node test-generate-pdf.js` to generate a single test PDF at `./tmp-test-seal.pdf`.
- Run `node generate-batch-seals.js` to generate multiple PDF seals and a `seals/forensics.json` file.
- To run end-to-end locally, start the emulators from the monorepo root and then POST to `/api/v1/seal`:

```pwsh
cd ..\verum-omnis-monorepo
firebase emulators:start
# in another terminal
cd functions
curl -X POST http://localhost:5000/api/v1/seal -H "Content-Type: application/json" -d '{"hash":"abc","title":"My Seal","notes":"test"}' --output seal.pdf
```

- Receipts are now written to Firestore when available; otherwise they remain in-memory (good for local emulators).