#!/bin/bash
# Verum Omnis Smoke Tests
# Usage: ./smoke-test.sh <hosting-domain>
# Example: ./smoke-test.sh gitverum.web.app

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <hosting-domain>"
  echo "Example: $0 gitverum.web.app"
  exit 1
fi

DOMAIN="$1"
BASE_URL="https://${DOMAIN}/api"
PASSED=0
FAILED=0

echo "🧪 Verum Omnis Smoke Tests"
echo "Domain: $DOMAIN"
echo "Base URL: $BASE_URL"
echo ""

# Helper function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected="$5"
  
  echo -n "Testing $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if echo "$body" | grep -q "$expected" && [ "$http_code" = "200" ]; then
    echo "✅ PASS"
    ((PASSED++))
  else
    echo "❌ FAIL (HTTP $http_code)"
    echo "   Response: $body"
    ((FAILED++))
  fi
}

# Test 1: Health endpoint
test_endpoint "Health" "GET" "${BASE_URL}/health" "" '"ok":true'

# Test 2: Verify endpoint
test_endpoint "Verify" "POST" "${BASE_URL}/v1/verify" "" '"ok":true'

# Test 3: Chat endpoint
test_endpoint "Chat" "POST" "${BASE_URL}/chat" '{"message":"Hello Verum"}' '"ok":true'

# Test 4: Anchor endpoint
test_endpoint "Anchor" "POST" "${BASE_URL}/v1/anchor" '{"hash":"smoke-test-'$(date +%s)'"}' '"ok":true'

# Test 5: Assistant verify mode
test_endpoint "Assistant Verify" "POST" "${BASE_URL}/v1/assistant" '{"mode":"verify"}' '"pack":"founders-release"'

# Test 6: Assistant policy mode
test_endpoint "Assistant Policy" "POST" "${BASE_URL}/v1/assistant" '{"mode":"policy"}' '"constitution"'

# Test 7: Assistant notice mode
test_endpoint "Assistant Notice" "POST" "${BASE_URL}/v1/assistant" '{"mode":"notice"}' '"Free forever"'

# Test 8: Notice endpoint
test_endpoint "Notice" "GET" "${BASE_URL}/v1/notice" "" '"citizen"'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed! Deployment successful."
  exit 0
else
  echo "❌ Some tests failed. Check the deployment."
  exit 1
fi
