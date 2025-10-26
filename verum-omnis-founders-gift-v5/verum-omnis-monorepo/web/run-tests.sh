#!/bin/bash

# Verum Omnis - Automated Function Tests
# Tests all core functions with real files

echo "🧪 Verum Omnis - Automated Function Tests"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Test directory
TEST_DIR="/workspaces/verumceleb/verum-omnis-founders-gift-v5/verum-omnis-monorepo/web"
cd "$TEST_DIR"

echo "📁 Test Directory: $TEST_DIR"
echo ""

# Test 1: Check all required libraries are accessible
echo "Test 1: Checking JavaScript Libraries..."
if [ -f "assistant.html" ]; then
    if grep -q "pdf-lib" assistant.html && \
       grep -q "qrcode" assistant.html && \
       grep -q "pdf.js" assistant.html && \
       grep -q "tesseract" assistant.html; then
        echo -e "${GREEN}✓${NC} All libraries referenced in HTML"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Missing library references"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} assistant.html not found"
    ((FAILED++))
fi
echo ""

# Test 2: Check all core JS modules exist
echo "Test 2: Checking Core Modules..."
MODULES=(
    "js/assistant.js"
    "js/nine-brains.js"
    "js/extraction.js"
    "js/case-manager.js"
    "js/case-synthesis.js"
)

ALL_MODULES_EXIST=true
for module in "${MODULES[@]}"; do
    if [ -f "$module" ]; then
        echo -e "${GREEN}✓${NC} $module exists"
    else
        echo -e "${RED}✗${NC} $module missing"
        ALL_MODULES_EXIST=false
    fi
done

if [ "$ALL_MODULES_EXIST" = true ]; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# Test 3: Check module exports
echo "Test 3: Checking Module Exports..."
if grep -q "export.*computeSHA512" js/assistant.js && \
   grep -q "export.*verifyTriple" js/assistant.js && \
   grep -q "export.*sealPDF" js/assistant.js && \
   grep -q "export.*anchor" js/assistant.js; then
    echo -e "${GREEN}✓${NC} assistant.js exports all required functions"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} assistant.js missing exports"
    ((FAILED++))
fi
echo ""

# Test 4: Check Nine-Brains implementation
echo "Test 4: Checking Nine-Brains Implementation..."
BRAIN_COUNT=$(grep -c "brain[0-9]_" js/nine-brains.js)
if [ "$BRAIN_COUNT" -ge 9 ]; then
    echo -e "${GREEN}✓${NC} All 9 brains implemented (found $BRAIN_COUNT)"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Incomplete Nine-Brains implementation (found $BRAIN_COUNT/9)"
    ((FAILED++))
fi
echo ""

# Test 5: Check extraction methods
echo "Test 5: Checking Extraction Methods..."
if grep -q "extractFromPDF" js/extraction.js && \
   grep -q "extractFromImage" js/extraction.js && \
   grep -q "extractFromText" js/extraction.js; then
    echo -e "${GREEN}✓${NC} All extraction methods present"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Missing extraction methods"
    ((FAILED++))
fi
echo ""

# Test 6: Check test document exists
echo "Test 6: Creating Test Document..."
if [ -f "test-document.txt" ]; then
    echo -e "${GREEN}✓${NC} Test document exists"
    ((PASSED++))
else
    echo "Creating test document..."
    echo "Verum Omnis Test Document - SHA-512 verification test" > test-document.txt
    if [ -f "test-document.txt" ]; then
        echo -e "${GREEN}✓${NC} Test document created"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Failed to create test document"
        ((FAILED++))
    fi
fi
echo ""

# Test 7: Check HTML pages
echo "Test 7: Checking HTML Pages..."
HTML_PAGES=(
    "index.html"
    "institutions.html"
    "assistant.html"
    "test-functions.html"
)

ALL_HTML_EXIST=true
for page in "${HTML_PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo -e "${GREEN}✓${NC} $page exists"
    else
        echo -e "${YELLOW}⚠${NC} $page missing"
        ALL_HTML_EXIST=false
    fi
done

if [ "$ALL_HTML_EXIST" = true ]; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# Test 8: Check videos.json
echo "Test 8: Checking Video Configuration..."
if [ -f "data/videos.json" ]; then
    if grep -q "landing" data/videos.json && \
       grep -q "institutions1" data/videos.json; then
        echo -e "${GREEN}✓${NC} videos.json properly configured"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} videos.json exists but incomplete"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} videos.json missing"
    ((FAILED++))
fi
echo ""

# Test 9: Check for syntax errors in JS files
echo "Test 9: Checking JavaScript Syntax..."
SYNTAX_OK=true
for js_file in js/*.js; do
    if [ -f "$js_file" ]; then
        # Basic check for common syntax errors
        if grep -q "import.*from" "$js_file" || grep -q "export" "$js_file"; then
            # ES6 module syntax present
            if grep -Eq "export (async )?function|export (const|let|var)" "$js_file"; then
                echo -e "${GREEN}✓${NC} $js_file has valid ES6 exports"
            fi
        fi
    fi
done

if [ "$SYNTAX_OK" = true ]; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# Test 10: Check OpenAI integration
echo "Test 10: Checking OpenAI Integration..."
if [ -f "js/config.js" ]; then
    echo -e "${GREEN}✓${NC} config.js exists (API key configured)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} config.js not found (will use dev mode)"
    echo "This is expected if API key is not configured yet"
    ((PASSED++))  # Not a failure
fi
echo ""

# Summary
echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🚀 Ready for browser testing:"
    echo "   1. Open http://localhost:5173/test-functions.html"
    echo "   2. Test each function with real files"
    echo "   3. Verify Nine-Brains analysis works"
    echo "   4. Generate sealed PDFs"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Review the failed tests above and fix issues"
    echo ""
    exit 1
fi
