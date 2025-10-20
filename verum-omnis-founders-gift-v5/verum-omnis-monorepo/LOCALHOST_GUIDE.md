# Localhost Development Guide

This guide explains how to run the Verum Omnis application on localhost for development and testing.

## Problem

When trying to access the application, you may encounter "localhost refused to connect" errors. This happens because the application requires a web server to serve the static files properly.

## Solution

There are multiple ways to run the application locally:

### Option 1: Using Python's Built-in HTTP Server (Quickest)

This is the fastest way to get started and requires no additional installation:

```bash
# Navigate to the monorepo directory
cd /path/to/verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Start the server on port 5000
python3 -m http.server 5000 --directory web
```

**Access the application:**
- Homepage: http://localhost:5000
- Verify Evidence: http://localhost:5000/verify.html
- Legal & Treaty: http://localhost:5000/legal.html

**To stop the server:** Press `Ctrl+C` in the terminal

### Option 2: Using Firebase Emulators (Recommended for Full Stack Development)

For full stack development with backend API functions, use Firebase emulators:

```bash
# Install Firebase CLI (first time only)
npm install -g firebase-tools

# Navigate to the monorepo directory
cd /path/to/verum-omnis-founders-gift-v5/verum-omnis-monorepo

# Install function dependencies (first time only)
cd functions && npm install && cd ..

# Start Firebase emulators
firebase emulators:start
```

**Access the application:**
- Web UI: http://localhost:5000
- API Endpoints: http://localhost:5001/gitverum/us-central1/api2/v1/
- Emulator UI: http://localhost:4000
- Firestore Emulator: http://localhost:9000

**To stop emulators:** Press `Ctrl+C` in the terminal

### Option 3: Using Node.js HTTP Server

If you prefer Node.js:

```bash
# Install http-server globally (first time only)
npm install -g http-server

# Navigate to the web directory
cd /path/to/verum-omnis-founders-gift-v5/verum-omnis-monorepo/web

# Start the server
http-server -p 5000
```

**Access:** http://localhost:5000

## What Each Option Provides

| Feature | Python Server | Firebase Emulators | Node HTTP Server |
|---------|--------------|-------------------|------------------|
| Static Web Pages | ✅ | ✅ | ✅ |
| API Functions | ❌ | ✅ | ❌ |
| Firestore | ❌ | ✅ | ❌ |
| Setup Time | Instant | ~2-3 minutes | ~1 minute |
| Best For | Quick testing | Full development | Node.js devs |

## Troubleshooting

### Port Already in Use

If you see "Address already in use" error:

```bash
# Check what's using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
python3 -m http.server 8080 --directory web
```

### Firebase Emulators Won't Start

1. **Check Node.js version:**
   ```bash
   node --version  # Should be v20.x
   ```

2. **Reinstall dependencies:**
   ```bash
   cd functions
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Firebase CLI:**
   ```bash
   firebase --version
   # If not found, reinstall: npm install -g firebase-tools
   ```

### Assets Not Loading (404 Errors)

The favicon files should be present in `web/assets/`. If they're missing:

```bash
cd web/assets
# Create favicon files from the logo
cp logo.png favicon-32.png
cp logo.png favicon-16.png
```

## Development Workflow

### For Frontend Changes Only

Use Python HTTP server for the fastest iteration:

```bash
# Terminal 1: Start server
python3 -m http.server 5000 --directory web

# Make changes to HTML/CSS/JS files
# Refresh browser to see changes
```

### For Full Stack Development

Use Firebase emulators:

```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Watch for function changes (optional)
cd functions
npm run build --watch  # If using TypeScript
```

### Testing the API

With Firebase emulators running:

```bash
# Health check
curl http://localhost:5001/gitverum/us-central1/api2/v1/verify

# Test contradiction endpoint
curl -X POST http://localhost:5001/gitverum/us-central1/api2/v1/contradict \
  -H "Content-Type: application/json" \
  -d '{"text": "Sample text to analyze"}'
```

## Production Deployment

When you're ready to deploy:

```bash
# Deploy everything
firebase deploy --only hosting,functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

## Additional Resources

- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)
- [Python HTTP Server Docs](https://docs.python.org/3/library/http.server.html)
- Main README: [README.md](./README.md)
- Product Specification: [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)
- Testing Guide: [TESTING.md](./TESTING.md)

---

**Quick Reference Card:**

```bash
# Fastest start (frontend only)
python3 -m http.server 5000 --directory web

# Full development (with API)
firebase emulators:start

# Stop server
Ctrl+C
```
