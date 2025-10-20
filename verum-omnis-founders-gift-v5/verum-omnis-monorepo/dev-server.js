#!/usr/bin/env node
/**
 * Local development server for Verum Omnis
 * - Serves static files from /web
 * - Proxies /api/** requests to Express app in /functions
 * - Mimics Firebase Hosting behavior locally
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const WEB_DIR = path.join(__dirname, 'web');

// Import the Express app from functions
const functionsDir = path.join(__dirname, 'functions');
process.env.SKIP_IMMUTABLE_VERIFY = '1'; // Skip verification for local dev

let expressApp;
try {
  const functionsModule = await import('./functions/index.js');
  expressApp = functionsModule.app;
  console.log('✓ Express API loaded from functions/index.js');
} catch (err) {
  console.error('✗ Failed to load Express app:', err.message);
  process.exit(1);
}

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Proxy /api/** requests to Express app
  if (req.url.startsWith('/api/')) {
    // Strip /api prefix to match Express routes (which are /v1/*)
    const originalUrl = req.url;
    req.url = req.url.replace(/^\/api/, '');
    expressApp(req, res);
    return;
  }

  // Serve static files from /web
  let urlPath = req.url.split('?')[0]; // Remove query params
  
  // Default to index.html for root
  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  const filePath = path.join(WEB_DIR, urlPath);
  
  // Security check: prevent directory traversal
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try .html extension for clean URLs
      const htmlPath = filePath + '.html';
      fs.stat(htmlPath, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          serveStaticFile(res, htmlPath);
        }
      });
    } else {
      serveStaticFile(res, filePath);
    }
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Verum Omnis • Local Development Server      ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Site:     http://localhost:${PORT}`);
  console.log(`🔌 API:      http://localhost:${PORT}/api/v1/*`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  • GET  /api/v1/verify');
  console.log('  • POST /api/v1/contradict');
  console.log('  • POST /api/v1/anchor');
  console.log('  • POST /api/v1/seal');
  console.log('');
  console.log('📄 Pages:');
  console.log(`  • http://localhost:${PORT}/`);
  console.log(`  • http://localhost:${PORT}/verify.html`);
  console.log(`  • http://localhost:${PORT}/legal.html`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});
