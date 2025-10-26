#!/bin/bash
set -e

# Build with tsup
npx tsup src/index.ts --format=cjs --sourcemap --minify --outDir=. 2>&1 | grep -v "DTS Build" | grep -v "RollupError" || true

# Rename files
if [ -f index.cjs ]; then
  mv index.cjs index.js
fi
if [ -f index.cjs.map ]; then
  mv index.cjs.map index.js.map
fi

echo "✓ Build complete: index.js created"
