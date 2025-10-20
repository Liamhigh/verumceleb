# 🚀 Quick Start - Verum Omnis

## Troubleshooting "localhost refused to connect"

If you're seeing "localhost refused to connect", you need to start a web server. Here's how:

### Fastest Solution (No Installation Required)

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
python3 -m http.server 5000 --directory web
```

Then open: **http://localhost:5000**

### Or Use the Startup Script

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
./start-local.sh
```

## What This Does

- Starts a local web server on port 5000
- Serves the static website files from the `web/` directory
- Makes the application accessible in your browser

## Pages Available

- **Homepage**: http://localhost:5000
- **Verify Evidence**: http://localhost:5000/verify.html
- **Legal & Treaty**: http://localhost:5000/legal.html

## Stop the Server

Press `Ctrl+C` in the terminal

## Need More?

- **Full Documentation**: `verum-omnis-founders-gift-v5/verum-omnis-monorepo/LOCALHOST_GUIDE.md`
- **Product Spec**: `verum-omnis-founders-gift-v5/verum-omnis-monorepo/PRODUCT_SPEC.md`
- **Main README**: `verum-omnis-founders-gift-v5/verum-omnis-monorepo/README.md`

## For Full Stack Development (with API)

If you need backend functions:

```bash
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo
npm install -g firebase-tools  # First time only
cd functions && npm install && cd ..  # First time only
firebase emulators:start
```

---

**TL;DR**: Run `python3 -m http.server 5000 --directory web` from the monorepo directory!
