# Verum Omnis — Execution Notes (Ops)

## Quick start (web + functions, local)
```bash
# Web (static in /web)
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/web
# if this is pure static HTML, just serve; otherwise install & build
python3 -m http.server 5173

# Functions
cd ../functions
npm ci
npm run serve  # or: firebase emulators:start
```

## Deploy
Push to `main`. GitHub Actions will deploy Hosting + Functions.
Set secret `FIREBASE_SERVICE_ACCOUNT` with your JSON key.


---
**Copilot rules:** see [.github/copilot-instructions.md](.github/copilot-instructions.md)


---
**Copilot rules:** see [.github/copilot-instructions.md](.github/copilot-instructions.md)
