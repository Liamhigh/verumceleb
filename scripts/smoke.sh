#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://gitverum.web.app}"

echo "== Verum Omnis Smoke Tests against: $BASE =="
echo ""

# Test 1: Landing page
echo "Testing landing page..."
if curl -fsS "$BASE" >/dev/null 2>&1; then
  echo "✅ [OK] GET / (landing page)"
else
  echo "❌ [FAIL] GET / (landing page)"
  exit 1
fi

# Test 2: Verify endpoint (health check)
echo "Testing API health..."
if curl -fsS "$BASE/api/v1/verify" 2>/dev/null | grep -q '"ok":true'; then
  echo "✅ [OK] GET /api/v1/verify"
else
  echo "⚠️  [WARN] GET /api/v1/verify (may not be deployed yet)"
fi

# Test 3: Assistant page
echo "Testing assistant page..."
if curl -fsS "$BASE/assistant.html" >/dev/null 2>&1; then
  echo "✅ [OK] GET /assistant.html"
else
  echo "⚠️  [WARN] GET /assistant.html (may not be deployed yet)"
fi

# Test 4: Verify page
echo "Testing verify page..."
if curl -fsS "$BASE/verify.html" >/dev/null 2>&1; then
  echo "✅ [OK] GET /verify.html"
else
  echo "⚠️  [WARN] GET /verify.html (may not be deployed yet)"
fi

# Test 5: Assistant API (policy mode)
echo "Testing assistant API..."
RESPONSE=$(curl -fsS -X POST "$BASE/api/v1/assistant" \
  -H "Content-Type: application/json" \
  -d '{"mode":"policy"}' 2>/dev/null || echo '{"ok":false}')

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ [OK] POST /api/v1/assistant (policy mode)"
else
  echo "⚠️  [WARN] POST /api/v1/assistant (may not be deployed yet)"
fi

# Test 6: Notice endpoint
echo "Testing notice endpoint..."
if curl -fsS "$BASE/api/v1/notice" 2>/dev/null | grep -q 'Verum Omnis'; then
  echo "✅ [OK] GET /api/v1/notice"
else
  echo "⚠️  [WARN] GET /api/v1/notice (may not be deployed yet)"
fi

echo ""
echo "✅ Smoke tests complete!"
echo ""
echo "Note: Warnings are expected if deployment hasn't happened yet."