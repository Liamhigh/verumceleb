# Verum Omnis Smoke Tests (PowerShell)
# Usage: .\smoke-test.ps1 -Domain <hosting-domain>
# Example: .\smoke-test.ps1 -Domain gitverum.web.app

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

$ErrorActionPreference = "Continue"
$BaseUrl = "https://$Domain/api"
$Passed = 0
$Failed = 0

Write-Host ""
Write-Host "🧪 Verum Omnis Smoke Tests" -ForegroundColor Cyan
Write-Host "Domain: $Domain" -ForegroundColor Gray
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Body,
        [string]$Expected
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Endpoint -Method $Method -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Endpoint -Method $Method -ContentType "application/json" -Body $Body -ErrorAction Stop
        }
        
        $responseJson = $response | ConvertTo-Json -Depth 10 -Compress
        
        if ($responseJson -match $Expected) {
            Write-Host "✅ PASS" -ForegroundColor Green
            $script:Passed++
        } else {
            Write-Host "❌ FAIL (Expected pattern not found)" -ForegroundColor Red
            Write-Host "   Response: $responseJson" -ForegroundColor Yellow
            $script:Failed++
        }
    } catch {
        Write-Host "❌ FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
        $script:Failed++
    }
}

# Test 1: Health endpoint
Test-Endpoint -Name "Health" -Method "GET" -Endpoint "$BaseUrl/health" -Body "" -Expected '"ok"\s*:\s*true'

# Test 2: Verify endpoint
Test-Endpoint -Name "Verify" -Method "POST" -Endpoint "$BaseUrl/v1/verify" -Body "" -Expected '"ok"\s*:\s*true'

# Test 3: Chat endpoint
$chatBody = @{ message = "Hello Verum" } | ConvertTo-Json
Test-Endpoint -Name "Chat" -Method "POST" -Endpoint "$BaseUrl/chat" -Body $chatBody -Expected '"ok"\s*:\s*true'

# Test 4: Anchor endpoint
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$anchorBody = @{ hash = "smoke-test-$timestamp" } | ConvertTo-Json
Test-Endpoint -Name "Anchor" -Method "POST" -Endpoint "$BaseUrl/v1/anchor" -Body $anchorBody -Expected '"ok"\s*:\s*true'

# Test 5: Assistant verify mode
$verifyBody = @{ mode = "verify" } | ConvertTo-Json
Test-Endpoint -Name "Assistant Verify" -Method "POST" -Endpoint "$BaseUrl/v1/assistant" -Body $verifyBody -Expected '"pack"\s*:\s*"founders-release"'

# Test 6: Assistant policy mode
$policyBody = @{ mode = "policy" } | ConvertTo-Json
Test-Endpoint -Name "Assistant Policy" -Method "POST" -Endpoint "$BaseUrl/v1/assistant" -Body $policyBody -Expected '"constitution"'

# Test 7: Assistant notice mode
$noticeBody = @{ mode = "notice" } | ConvertTo-Json
Test-Endpoint -Name "Assistant Notice" -Method "POST" -Endpoint "$BaseUrl/v1/assistant" -Body $noticeBody -Expected '"Free forever"'

# Test 8: Notice endpoint
Test-Endpoint -Name "Notice" -Method "GET" -Endpoint "$BaseUrl/v1/notice" -Body "" -Expected '"citizen"'

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Results: $Passed passed, $Failed failed" -ForegroundColor Cyan

if ($Failed -eq 0) {
    Write-Host "✅ All tests passed! Deployment successful." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some tests failed. Check the deployment." -ForegroundColor Red
    exit 1
}
