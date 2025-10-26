# Smoke Tests for Verum Omnis API

This directory contains smoke tests to validate the Verum Omnis API endpoints.

## Files

### `requests.http`
REST Client compatible HTTP request file for testing API endpoints in VS Code or similar editors.

**Usage with VS Code REST Client:**
1. Install the "REST Client" extension
2. Open `requests.http`
3. Click "Send Request" above any endpoint

**Variables:**
- `@baseUrl` - Local development URL (default: `http://localhost:8000/api`)
- `@host` - Production host (default: `gitverum.web.app`)

### `local-smoke.ps1`
PowerShell script for automated API testing with colored output.

**Usage:**
```powershell
# Test local server
.\local-smoke.ps1

# Test custom URL
.\local-smoke.ps1 -BaseUrl "https://gitverum.web.app/api"
```

**Features:**
- Colored pass/fail output
- Detailed error reporting
- Summary statistics
- Exit code 0 on success, 1 on failure

## Endpoints Tested

### Health Checks
- `GET /health` - Basic health check
- `GET /v1/verify` - Verify endpoint health check

### Chat
- `POST /chat` - Chat endpoint with message
- `POST /chat` - Chat endpoint without message (should fail)

### V1 Assistant
- `POST /v1/assistant` - Verify mode
- `POST /v1/assistant` - Policy mode
- `POST /v1/assistant` - Anchor mode (valid)
- `POST /v1/assistant` - Anchor mode (no hash, should fail)
- `POST /v1/assistant` - Receipt mode
- `POST /v1/assistant` - Notice mode
- `POST /v1/assistant` - Invalid mode (should fail)

### V1 Anchor
- `POST /v1/anchor` - Valid hash
- `POST /v1/anchor` - Invalid hash (should fail)

### Additional Endpoints
- `POST /v1/seal` - Seal endpoint
- `POST /v1/verify` - Verify with hash
- `POST /v1/contradict` - Contradiction detection

## Running Tests

### Prerequisites

**For local testing:**
1. Start the local server:
   ```bash
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions
   SKIP_IMMUTABLE_VERIFY=1 node serve.js
   ```

2. In another terminal, navigate to web directory and serve static files:
   ```bash
   cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/web
   python3 -m http.server 8000
   ```

### Run PowerShell Tests

```powershell
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/ops/smoke
.\local-smoke.ps1
```

### Run HTTP Requests

1. Open `requests.http` in VS Code with REST Client extension
2. Click "Send Request" above each endpoint

### Test Production

```powershell
.\local-smoke.ps1 -BaseUrl "https://gitverum.web.app/api"
```

## Expected Results

All tests should pass with status codes:
- `200` - Successful requests
- `400` - Bad requests (for invalid input tests)
- `404` - Not found (for non-existent resources)

**Sample Output:**
```
🧪 Verum Omnis API Smoke Tests
Testing against: http://localhost:8000/api

=== Health Checks ===
Testing: GET /health... ✅ PASS
Testing: GET /v1/verify... ✅ PASS

=== Chat Endpoint ===
Testing: POST /chat (valid)... ✅ PASS
Testing: POST /chat (invalid)... ✅ PASS

=== V1 Assistant Endpoint ===
Testing: Verify mode... ✅ PASS
Testing: Policy mode... ✅ PASS
Testing: Anchor mode (valid)... ✅ PASS
Testing: Anchor mode (no hash)... ✅ PASS
Testing: Receipt mode... ✅ PASS
Testing: Notice mode... ✅ PASS
Testing: Invalid mode... ✅ PASS

=== V1 Anchor Endpoint ===
Testing: Valid hash... ✅ PASS
Testing: Invalid hash... ✅ PASS

=== Summary ===
Passed: 13
Failed: 0

✅ All tests passed!
```

## Troubleshooting

### Connection Refused
- Ensure the local server is running on the correct port
- Check that firewall isn't blocking connections

### 404 Errors
- Verify API routes are correctly configured
- Check that Firebase Functions are deployed

### 500 Errors
- Check server logs for errors
- Verify environment variables are set
- Ensure dependencies are installed

## Integration with CI/CD

These smoke tests can be integrated into CI/CD pipelines:

```yaml
- name: Run smoke tests
  run: |
    cd ops/smoke
    pwsh -File local-smoke.ps1 -BaseUrl "https://gitverum.web.app/api"
```

## Adding New Tests

To add a new test to `local-smoke.ps1`:

```powershell
Test-Endpoint "Test name" "METHOD" "$BaseUrl/endpoint" -Body @{ key = "value" } -ExpectedStatus 200
```

To add a new test to `requests.http`:

```http
### Test Name
METHOD {{baseUrl}}/endpoint
Content-Type: application/json

{
  "key": "value"
}
```

## See Also

- Main test suite: `functions/test/index.test.js`
- Deployment guide: `DEPLOYMENT.md`
- API documentation: `README.md`
