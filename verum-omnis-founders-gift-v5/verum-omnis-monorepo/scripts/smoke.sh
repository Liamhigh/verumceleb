#!/usr/bin/env bash
set -euo pipefail

# Simple production smoke tests for verumdone.web.app
HOST="verumdone.web.app"

echo "== Verify endpoint =="
curl -sS "https://${HOST}/api/v1/verify" | jq .

echo "\n== Assistant (verify mode) =="
curl -sS -X POST "https://${HOST}/api/v1/assistant" \
  -H "Content-Type: application/json" \
  -d '{"mode":"verify"}' | jq .

echo "\n== Anchor (dummy hash) =="
curl -sS -X POST "https://${HOST}/api/v1/anchor" \
  -H "Content-Type: application/json" \
  -d '{"hash":"test-123"}' | jq .

echo "\n== Health =="
curl -sS "https://${HOST}/health" | jq .
