#!/bin/bash
# Verum Omnis - Local Smoke Test Script
# Tests all Firebase Functions endpoints locally

BASE_URL="${1:-http://127.0.0.1:5001/verumdone/us-central1/api}"
SUCCESS_COUNT=0
FAIL_COUNT=0

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "========================================"
echo "Verum Omnis Functions - Smoke Tests"
echo "========================================"
echo -e "${NC}"
echo -e "${GRAY}Base URL: $BASE_URL${NC}\n"

test_endpoint() {
    local name="$1"
    local method="$2"
    local path="$3"
    local body="$4"
    local expected_status="${5:-200}"
    
    local url="${BASE_URL}${path}"
    local start_time=$(date +%s%3N)
    
    if [ -z "$body" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$body" 2>&1)
    fi
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    local status=$(echo "$response" | tail -n1)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $name ${GRAY}(${duration}ms)${NC}"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo -e "${RED}✗${NC} $name - Expected $expected_status, got $status ${GRAY}(${duration}ms)${NC}"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Test hash (128 hex characters)
TEST_HASH=$(printf 'a%.0s' {1..128})

# Health check
test_endpoint "Health Check" "GET" "/health"

# Chat endpoint
test_endpoint "Chat (valid message)" "POST" "/chat" '{"message":"Hello"}'
test_endpoint "Chat (missing message)" "POST" "/chat" '{}' "400"

# V1 API endpoints
test_endpoint "V1 Verify (GET)" "GET" "/v1/verify"
test_endpoint "V1 Verify (POST)" "POST" "/v1/verify" "{\"sha512\":\"$TEST_HASH\"}"
test_endpoint "V1 Seal" "POST" "/v1/seal" "{\"sha512\":\"$TEST_HASH\",\"filename\":\"test.pdf\",\"title\":\"Test Document\"}"
test_endpoint "V1 Contradict" "POST" "/v1/contradict" '{"items":["Statement A","Statement B","Statement C"]}'
test_endpoint "V1 Anchor (valid)" "POST" "/v1/anchor" "{\"sha512\":\"$TEST_HASH\"}"
test_endpoint "V1 Anchor (missing hash)" "POST" "/v1/anchor" '{}' "400"

# Assistant endpoints
test_endpoint "Assistant (verify mode)" "POST" "/v1/assistant" '{"mode":"verify"}'
test_endpoint "Assistant (policy mode)" "POST" "/v1/assistant" '{"mode":"policy"}'
test_endpoint "Assistant (notice mode)" "POST" "/v1/assistant" '{"mode":"notice"}'
test_endpoint "Assistant (anchor mode)" "POST" "/v1/assistant" '{"mode":"anchor","hash":"testhash123"}'
test_endpoint "Assistant (receipt mode)" "POST" "/v1/assistant" '{"mode":"receipt","hash":"testhash123"}'
test_endpoint "Assistant (invalid mode)" "POST" "/v1/assistant" '{"mode":"invalid"}' "400"

# Summary
echo -e "\n${CYAN}========================================${NC}"
echo -e "${CYAN}Results:${NC}"
echo -e "  ${GREEN}Passed: $SUCCESS_COUNT${NC}"
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "  ${GREEN}Failed: $FAIL_COUNT${NC}"
else
    echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"
fi
echo -e "${CYAN}========================================${NC}\n"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi
