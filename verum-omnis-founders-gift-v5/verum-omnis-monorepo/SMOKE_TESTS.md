# Smoke Tests

Post-deployment validation scripts for Verum Omnis API.

## Usage

### Linux / Mac

```bash
chmod +x smoke-test.sh
./smoke-test.sh <your-hosting-domain>
```

Example:
```bash
./smoke-test.sh gitverum.web.app
```

### Windows PowerShell

```powershell
.\smoke-test.ps1 -Domain <your-hosting-domain>
```

Example:
```powershell
.\smoke-test.ps1 -Domain gitverum.web.app
```

## What Gets Tested

The smoke tests validate all critical API endpoints:

1. **Health Check** - `GET /api/health`
2. **Verify** - `POST /api/v1/verify`
3. **Chat** - `POST /api/chat`
4. **Anchor** - `POST /api/v1/anchor`
5. **Assistant Verify** - `POST /api/v1/assistant` (mode=verify)
6. **Assistant Policy** - `POST /api/v1/assistant` (mode=policy)
7. **Assistant Notice** - `POST /api/v1/assistant` (mode=notice)
8. **Notice** - `GET /api/v1/notice`

## Expected Output

```
🧪 Verum Omnis Smoke Tests
Domain: gitverum.web.app
Base URL: https://gitverum.web.app/api

Testing Health... ✅ PASS
Testing Verify... ✅ PASS
Testing Chat... ✅ PASS
Testing Anchor... ✅ PASS
Testing Assistant Verify... ✅ PASS
Testing Assistant Policy... ✅ PASS
Testing Assistant Notice... ✅ PASS
Testing Notice... ✅ PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results: 8 passed, 0 failed
✅ All tests passed! Deployment successful.
```

## Exit Codes

- **0** - All tests passed
- **1** - One or more tests failed

## When to Run

Run smoke tests:
- After every deployment
- When updating API endpoints
- Before promoting to production
- As part of CI/CD pipeline

## Troubleshooting

### "Connection refused"
- Verify the hosting domain is correct
- Ensure Firebase deployment completed successfully
- Check `firebase use` shows the correct project

### "Function does not exist"
- Redeploy functions: `firebase deploy --only functions`
- Verify `firebase.json` rewrites are correct

### "CORS error"
- This shouldn't happen (API has `cors({ origin: true })`)
- If it does, check that requests include proper headers
- Verify API is deployed and accessible

## Manual Testing Alternative

If you prefer manual testing, use curl:

```bash
# Health check
curl https://gitverum.web.app/api/health

# Chat test
curl -X POST https://gitverum.web.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Verify test
curl -X POST https://gitverum.web.app/api/v1/verify \
  -H "Content-Type: application/json"
```

Or PowerShell:

```powershell
# Health check
Invoke-RestMethod https://gitverum.web.app/api/health

# Chat test
Invoke-RestMethod https://gitverum.web.app/api/chat `
  -Method Post -ContentType "application/json" `
  -Body (@{ message = "Hello" } | ConvertTo-Json)
```
