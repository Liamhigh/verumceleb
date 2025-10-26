# Verum Omnis - Local Smoke Test Script
# Tests all Firebase Functions endpoints locally

param(
    [string]$BaseUrl = "http://127.0.0.1:5001/verumdone/us-central1/api",
    [string]$ProjectId = "verumdone"
)

$ErrorActionPreference = "Continue"
$SuccessCount = 0
$FailCount = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verum Omnis Functions - Smoke Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n" -ForegroundColor Gray

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Path,
        [hashtable]$Body = $null,
        [string]$ExpectedStatus = "200"
    )
    
    $StartTime = Get-Date
    $Url = "$BaseUrl$Path"
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Compress)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $Duration = ((Get-Date) - $StartTime).TotalMilliseconds
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✓ " -NoNewline -ForegroundColor Green
            Write-Host "$Name " -NoNewline
            Write-Host "($([int]$Duration)ms)" -ForegroundColor Gray
            $script:SuccessCount++
            return $true
        } else {
            Write-Host "✗ " -NoNewline -ForegroundColor Red
            Write-Host "$Name - Expected $ExpectedStatus, got $($response.StatusCode)" -ForegroundColor Red
            $script:FailCount++
            return $false
        }
    }
    catch {
        $Duration = ((Get-Date) - $StartTime).TotalMilliseconds
        Write-Host "✗ " -NoNewline -ForegroundColor Red
        Write-Host "$Name - $($_.Exception.Message) " -NoNewline -ForegroundColor Red
        Write-Host "($([int]$Duration)ms)" -ForegroundColor Gray
        $script:FailCount++
        return $false
    }
}

# Health check
Test-Endpoint -Name "Health Check" -Path "/health"

# Chat endpoint
Test-Endpoint -Name "Chat (valid message)" -Method POST -Path "/chat" -Body @{ message = "Hello" }
Test-Endpoint -Name "Chat (missing message)" -Method POST -Path "/chat" -Body @{} -ExpectedStatus "400"

# V1 API endpoints
Test-Endpoint -Name "V1 Verify (GET)" -Path "/v1/verify"

$testHash = "a" * 128
Test-Endpoint -Name "V1 Verify (POST)" -Method POST -Path "/v1/verify" -Body @{ sha512 = $testHash }

Test-Endpoint -Name "V1 Seal" -Method POST -Path "/v1/seal" -Body @{ 
    sha512 = $testHash
    filename = "test.pdf"
    title = "Test Document"
}

Test-Endpoint -Name "V1 Contradict" -Method POST -Path "/v1/contradict" -Body @{
    items = @("Statement A", "Statement B", "Statement C")
}

Test-Endpoint -Name "V1 Anchor (valid)" -Method POST -Path "/v1/anchor" -Body @{ 
    sha512 = $testHash
}

Test-Endpoint -Name "V1 Anchor (missing hash)" -Method POST -Path "/v1/anchor" -Body @{} -ExpectedStatus "400"

# Assistant endpoints
Test-Endpoint -Name "Assistant (verify mode)" -Method POST -Path "/v1/assistant" -Body @{ mode = "verify" }
Test-Endpoint -Name "Assistant (policy mode)" -Method POST -Path "/v1/assistant" -Body @{ mode = "policy" }
Test-Endpoint -Name "Assistant (notice mode)" -Method POST -Path "/v1/assistant" -Body @{ mode = "notice" }

Test-Endpoint -Name "Assistant (anchor mode)" -Method POST -Path "/v1/assistant" -Body @{ 
    mode = "anchor"
    hash = "testhash123"
}

Test-Endpoint -Name "Assistant (receipt mode)" -Method POST -Path "/v1/assistant" -Body @{ 
    mode = "receipt"
    hash = "testhash123"
}

Test-Endpoint -Name "Assistant (invalid mode)" -Method POST -Path "/v1/assistant" -Body @{ mode = "invalid" } -ExpectedStatus "400"

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Passed: $SuccessCount" -ForegroundColor Green
Write-Host "  Failed: $FailCount" -ForegroundColor $(if ($FailCount -eq 0) { "Green" } else { "Red" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($FailCount -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed! ✗" -ForegroundColor Red
    exit 1
}
