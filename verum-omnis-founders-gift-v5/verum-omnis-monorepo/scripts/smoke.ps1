# PowerShell smoke tests for verumdone.web.app
$host = 'verumdone.web.app'

Write-Host '== Verify endpoint =='
Invoke-RestMethod -Uri "https://$host/api/v1/verify"

Write-Host "`n== Assistant (verify mode) =="
Invoke-RestMethod -Uri "https://$host/api/v1/assistant" -Method Post -ContentType 'application/json' -Body (@{ mode = 'verify' } | ConvertTo-Json)

Write-Host "`n== Anchor (dummy hash) =="
Invoke-RestMethod -Uri "https://$host/api/v1/anchor" -Method Post -ContentType 'application/json' -Body (@{ hash = 'test-123' } | ConvertTo-Json)

Write-Host "`n== Health =="
Invoke-RestMethod -Uri "https://$host/health"
