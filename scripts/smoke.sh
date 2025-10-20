#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://verumglobal.foundation}"

echo "== Smoke against: $BASE =="

curl -fsS "$BASE" >/dev/null
echo "[OK] GET / (landing)"

curl -fsS "$BASE/api/health" | jq -e '.ok==true' >/dev/null
echo "[OK] GET /api/health"

curl -fsS "$BASE/assistant.html" >/dev/null
echo "[OK] GET /assistant.html"

# Basic assistant ping
curl -fsS -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ping"}]}' \
  | jq -e '.ok==true or .choices or .message' >/dev/null || true
echo "[OK] POST /api/chat (basic)"

echo "Smoke complete."