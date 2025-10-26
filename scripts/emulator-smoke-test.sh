#!/bin/bash
# Emulator smoke tests for Verum Omnis Functions

set -e

echo "🔥 Starting Firebase Emulator smoke tests..."

# Start emulator in background
cd "$(dirname "$0")/../verum-omnis-founders-gift-v5/verum-omnis-monorepo"

# Kill any existing emulators
pkill -f firebase-tools || true
sleep 2

# Build functions first
echo "📦 Building functions..."
cd functions
npm run build
cd ..

# Start emulator in background
echo "🚀 Starting emulator..."
firebase emulators:start --only functions &
EMULATOR_PID=$!

# Wait for emulator to start
echo "⏳ Waiting for emulator to start..."
sleep 15

# Set base URL for emulator
BASE_URL="http://localhost:5001/verumdone/us-central1/api"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local path=$2
  local data=$3
  local expected_status=$4
  local test_name=$5
  
  echo "Testing: $test_name"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$path")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo "✅ PASSED: $test_name (HTTP $http_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
  else
    echo "❌ FAILED: $test_name (Expected HTTP $expected_status, got $http_code)"
    echo "Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    return 1
  fi
}

# Run tests
echo ""
echo "🧪 Running smoke tests..."
echo ""

test_endpoint "GET" "/health" "" "200" "Health endpoint"
test_endpoint "GET" "/v1/health" "" "200" "V1 Health endpoint"
test_endpoint "GET" "/v1/verify" "" "200" "V1 Verify endpoint"
test_endpoint "POST" "/chat" '{"message":"Hello"}' "200" "Chat with message"
test_endpoint "POST" "/chat" '{}' "400" "Chat without message"
test_endpoint "POST" "/v1/assistant" '{"mode":"verify"}' "200" "Assistant verify mode"
test_endpoint "POST" "/v1/assistant" '{"mode":"policy"}' "200" "Assistant policy mode"
test_endpoint "POST" "/v1/assistant" '{"mode":"notice"}' "200" "Assistant notice mode"
test_endpoint "POST" "/v1/assistant" '{"mode":"anchor"}' "400" "Assistant anchor without hash"
test_endpoint "POST" "/v1/assistant" '{"mode":"anchor","hash":"testhash"}' "200" "Assistant anchor with hash"
test_endpoint "POST" "/v1/anchor" '{}' "400" "V1 Anchor without hash"

# Generate a valid SHA-512 hash for testing
VALID_HASH="a".$(printf '0%.0s' {1..127})

test_endpoint "POST" "/verify" "{\"sha512\":\"$VALID_HASH\"}" "200" "Verify with valid hash"
test_endpoint "POST" "/seal" "{\"sha512\":\"$VALID_HASH\",\"filename\":\"test.pdf\"}" "200" "Seal with valid hash"
test_endpoint "POST" "/anchor" "{\"sha512\":\"$VALID_HASH\"}" "200" "Anchor with valid hash"

# Kill emulator
echo ""
echo "🛑 Stopping emulator..."
kill $EMULATOR_PID 2>/dev/null || true
pkill -f firebase-tools || true

# Summary
echo ""
echo "📊 Test Summary:"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"

if [ $TESTS_FAILED -gt 0 ]; then
  echo ""
  echo "❌ Some tests failed!"
  exit 1
else
  echo ""
  echo "✅ All tests passed!"
  exit 0
fi
