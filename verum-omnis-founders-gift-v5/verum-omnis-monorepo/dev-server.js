#!/usr/bin/env node
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Proxy /api/** to the functions API at port 5001
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));

// Serve static files from web/
app.use(express.static(path.join(__dirname, 'web')));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 Verum Omnis Dev Server`);
  console.log(`   Site: http://localhost:${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api/v1/*`);
  console.log(`\n   Functions running on port 5001`);
  console.log(`   Proxy: /api/** → http://localhost:5001\n`);
});
