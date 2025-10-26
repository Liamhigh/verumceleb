# Verum Omnis Function Smoke Tests (PowerShell)
# Run with: .\local-smoke.ps1

param(
    [string]$Host = "http://localhost:5001/verumdone/us-central1",
    [int]$Timeout = 10
)

Write-Host "=================================="  -ForegroundColor Cyan
Write-Host "Verum Omnis Function Smoke Tests" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Host: $Host"
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = $Timeout
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ PASS" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "✗ FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:failed++
        }
    }
    catch {
        Write-Host "✗ FAIL ($_)" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "Running endpoint tests..."
Write-Host ""

# 1. Health check
Test-Endpoint -Name "Health endpoint" -Url "$Host/api/health"

# 2. Verify endpoint
$verifyData = @{
    sha512 = "abc123"
    filename = "test.pdf"
    mime = "application/pdf"
}
Test-Endpoint -Name "Verify endpoint" -Url "$Host/api/verify" -Method "POST" -Body $verifyData

# 3. Seal endpoint
$sealData = @{
    sha512 = "abc123"
    filename = "test.pdf"
}
Test-Endpoint -Name "Seal endpoint" -Url "$Host/api/seal" -Method "POST" -Body $sealData

# 4. Contradict endpoint
$contradictData = @{
    statements = @("The sky is blue", "The sky is red")
}
Test-Endpoint -Name "Contradict endpoint" -Url "$Host/api/contradict" -Method "POST" -Body $contradictData

# 5. Anchor endpoint
$anchorData = @{
    sha512 = "abc123"
    filename = "test.pdf"
}
Test-Endpoint -Name "Anchor endpoint" -Url "$Host/api/anchor" -Method "POST" -Body $anchorData

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Passed: " -NoNewline
Write-Host "$passed" -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host "$failed" -ForegroundColor Red
Write-Host "Total:  $($passed + $failed)"
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
    exit 1
}
