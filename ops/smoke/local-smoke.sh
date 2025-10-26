#!/bin/bash
# Smoke tests for Verum Omnis Functions
# Tests all major endpoints locally or on deployed site

set -e

# Configuration
HOST="${SMOKE_HOST:-http://localhost:5001/verumdone/us-central1}"
TIMEOUT=10

echo "=================================="
echo "Verum Omnis Function Smoke Tests"
echo "=================================="
echo "Host: $HOST"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        if curl -fsS -m "$TIMEOUT" "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PASS${NC}"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAIL${NC}"
            ((FAILED++))
        fi
    else
        if [ -n "$data" ]; then
            if curl -fsS -m "$TIMEOUT" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" > /dev/null 2>&1; then
                echo -e "${GREEN}✓ PASS${NC}"
                ((PASSED++))
            else
                echo -e "${RED}✗ FAIL${NC}"
                ((FAILED++))
            fi
        else
            echo -e "${YELLOW}⊘ SKIP (no test data)${NC}"
        fi
    fi
}

# Run tests
echo "Running endpoint tests..."
echo ""

# 1. Health check
test_endpoint "Health endpoint" "$HOST/api/health" "GET"

# 2. Verify endpoint (POST with dummy data)
VERIFY_DATA='{"sha512":"abc123","filename":"test.pdf","mime":"application/pdf"}'
test_endpoint "Verify endpoint" "$HOST/api/verify" "POST" "$VERIFY_DATA"

# 3. Seal endpoint (POST)
SEAL_DATA='{"sha512":"abc123","filename":"test.pdf"}'
test_endpoint "Seal endpoint" "$HOST/api/seal" "POST" "$SEAL_DATA"

# 4. Contradict endpoint (POST with two statements)
CONTRADICT_DATA='{"statements":["The sky is blue","The sky is red"]}'
test_endpoint "Contradict endpoint" "$HOST/api/contradict" "POST" "$CONTRADICT_DATA"

# 5. Anchor endpoint (POST)
ANCHOR_DATA='{"sha512":"abc123","filename":"test.pdf"}'
test_endpoint "Anchor endpoint" "$HOST/api/anchor" "POST" "$ANCHOR_DATA"

# Summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
