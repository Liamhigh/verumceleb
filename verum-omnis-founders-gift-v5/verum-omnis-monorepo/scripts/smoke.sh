#!/usr/bin/env bash
set -euo pipefail

# Basic smoke checks for the public site.
# Usage:
#   chmod +x scripts/smoke.sh
#   BASE=https://verumglobal.foundation ./scripts/smoke.sh

BASE=${BASE:-https://verumglobal.foundation}
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

echo "Running smoke checks against: $BASE"
echo

echo "1) Fetching home page..."
if ! curl -sSL --fail "$BASE" -o "$TMP"; then
  echo "ERROR: Failed to fetch $BASE"
  exit 1
fi

FAILED=0

echo
echo "2) Checking for logo (heuristic search in HTML)..."
if grep -iE '(<img[^>]+alt=[^"'\''>]*logo|class=["'\''][^"'\''>]*logo|id=["'\'']logo|alt=["'\''][^"'\''>]*logo)' "$TMP" >/dev/null; then
  echo "OK: Logo-related element found in HTML"
else
  echo "WARN: Logo not found in HTML (search for 'logo'). Manual check recommended."
  FAILED=1
fi

echo
echo "3) Checking for 'Open Chat' text in landing HTML..."
if grep -qi 'open chat' "$TMP"; then
  echo "OK: 'Open Chat' text found"
else
  echo "WARN: 'Open Chat' text not found in landing HTML"
  FAILED=1
fi

echo
echo "4) Checking /open-chat route (HTTP status)..."
OPEN_CHAT_URL="${BASE%/}/open-chat"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-redirs 5 "$OPEN_CHAT_URL" || echo "000")
if [[ "$HTTP_CODE" =~ ^(200|301|302)$ ]]; then
  echo "OK: $OPEN_CHAT_URL returned $HTTP_CODE"
else
  echo "WARN/ERR: $OPEN_CHAT_URL returned $HTTP_CODE"
  FAILED=1
fi

echo
echo "5) Optional API OPTIONS/CORS hint for upload endpoint (heuristic)..."
API_UPLOAD="${BASE%/}/api/upload"
HTTP_CODE_OPTIONS=$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS --max-redirs 5 "$API_UPLOAD" || echo "000")
echo "Note: OPTIONS $API_UPLOAD -> HTTP $HTTP_CODE_OPTIONS (may be 000 if endpoint differs)."

echo
if [[ $FAILED -ne 0 ]]; then
  echo "SMOKE: Basic checks found potential issues. Manual verification still required for:"
  echo "- Upload → hash → sealed receipt flow"
  echo "- Visual verification: logo visible, disclaimer present"
  echo "- Browser console (mixed-content/CORS/JS errors)"
  echo
  echo "Exit code: 2"
  exit 2
else
  echo "SMOKE: Basic checks passed."
  exit 0
fi
