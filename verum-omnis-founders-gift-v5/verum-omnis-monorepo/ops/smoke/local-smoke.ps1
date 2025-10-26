# Verum Omnis Local Smoke Tests (PowerShell)
# Usage: .\local-smoke.ps1 [-BaseUrl "http://localhost:8000/api"]

param(
    [string]$BaseUrl = "http://localhost:8000/api"
)

Write-Host "🧪 Verum Omnis API Smoke Tests" -ForegroundColor Cyan
Write-Host "Testing against: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host " ❌ FAIL (Got $($response.StatusCode), expected $ExpectedStatus)" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host " ❌ FAIL (Got $statusCode, expected $ExpectedStatus)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
            $script:failed++
        }
    }
}

# Test Suite
Write-Host "=== Health Checks ===" -ForegroundColor Magenta
Test-Endpoint "GET /health" "GET" "$BaseUrl/health" -ExpectedStatus 200
Test-Endpoint "GET /v1/verify" "GET" "$BaseUrl/v1/verify" -ExpectedStatus 200

Write-Host ""
Write-Host "=== Chat Endpoint ===" -ForegroundColor Magenta
Test-Endpoint "POST /chat (valid)" "POST" "$BaseUrl/chat" -Body @{ message = "Hello" } -ExpectedStatus 200
Test-Endpoint "POST /chat (invalid)" "POST" "$BaseUrl/chat" -Body @{} -ExpectedStatus 400

Write-Host ""
Write-Host "=== V1 Assistant Endpoint ===" -ForegroundColor Magenta
Test-Endpoint "Verify mode" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "verify" } -ExpectedStatus 200
Test-Endpoint "Policy mode" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "policy" } -ExpectedStatus 200
Test-Endpoint "Anchor mode (valid)" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "anchor"; hash = ("a" * 128) } -ExpectedStatus 200
Test-Endpoint "Anchor mode (no hash)" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "anchor" } -ExpectedStatus 400
Test-Endpoint "Receipt mode" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "receipt"; hash = ("a" * 128) } -ExpectedStatus 200
Test-Endpoint "Notice mode" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "notice" } -ExpectedStatus 200
Test-Endpoint "Invalid mode" "POST" "$BaseUrl/v1/assistant" -Body @{ mode = "invalid" } -ExpectedStatus 400

Write-Host ""
Write-Host "=== V1 Anchor Endpoint ===" -ForegroundColor Magenta
Test-Endpoint "Valid hash" "POST" "$BaseUrl/v1/anchor" -Body @{ sha512 = ("a" * 128) } -ExpectedStatus 200
Test-Endpoint "Invalid hash" "POST" "$BaseUrl/v1/anchor" -Body @{} -ExpectedStatus 400

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    exit 1
}
