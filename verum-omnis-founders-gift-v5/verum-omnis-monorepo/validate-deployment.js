#!/usr/bin/env node

/**
 * Deployment Validation Script
 * 
 * Tests deployment readiness and validates the deployment after it's live.
 * 
 * Usage:
 *   node validate-deployment.js [--local|--production]
 */

const https = require('https');
const http = require('http');

const mode = process.argv[2] || '--local';

const config = {
  '--local': {
    baseUrl: 'http://localhost:5000',
    apiUrl: 'http://localhost:5001/api2',
    protocol: http
  },
  '--production': {
    baseUrl: 'https://gitverum.web.app',
    apiUrl: 'https://us-central1-gitverum.cloudfunctions.net/api2',
    protocol: https
  }
};

const settings = config[mode];

if (!settings) {
  console.error('❌ Invalid mode. Use --local or --production');
  process.exit(1);
}

console.log(`\n🔍 Validating deployment in ${mode} mode...\n`);

const tests = [];

/**
 * Make HTTP/HTTPS request
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

/**
 * Test 1: API Health Check
 */
async function testApiHealth() {
  try {
    const res = await request(`${settings.apiUrl}/v1/verify`);
    if (res.status === 200) {
      const data = JSON.parse(res.data);
      if (data.status === 'ok') {
        console.log('✅ API Health Check: OK');
        return true;
      }
    }
    console.log('❌ API Health Check: Failed (wrong response)');
    return false;
  } catch (err) {
    console.log(`❌ API Health Check: Failed - ${err.message}`);
    return false;
  }
}

/**
 * Test 2: Hash Anchoring
 */
async function testHashAnchoring() {
  try {
    const testData = JSON.stringify({
      hash: 'test-' + Date.now(),
      metadata: { type: 'validation-test' }
    });
    
    const res = await request(`${settings.apiUrl}/v1/anchor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
      },
      body: testData
    });
    
    if (res.status === 200) {
      const data = JSON.parse(res.data);
      if (data.receipt) {
        console.log('✅ Hash Anchoring: OK');
        return true;
      }
    }
    console.log('❌ Hash Anchoring: Failed');
    return false;
  } catch (err) {
    console.log(`❌ Hash Anchoring: Failed - ${err.message}`);
    return false;
  }
}

/**
 * Test 3: CORS Headers
 */
async function testCorsHeaders() {
  try {
    const res = await request(`${settings.apiUrl}/v1/verify`, {
      headers: {
        'Origin': 'https://example.com'
      }
    });
    
    const corsHeader = res.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log('✅ CORS Headers: OK');
      return true;
    }
    console.log('❌ CORS Headers: Missing');
    return false;
  } catch (err) {
    console.log(`❌ CORS Headers: Failed - ${err.message}`);
    return false;
  }
}

/**
 * Test 4: Web Pages (if in local or production mode)
 */
async function testWebPages() {
  const pages = ['/', '/verify.html', '/legal.html'];
  let allPassed = true;
  
  for (const page of pages) {
    try {
      const res = await request(`${settings.baseUrl}${page}`);
      if (res.status === 200 && res.data.includes('Verum Omnis')) {
        console.log(`✅ Web Page ${page}: OK`);
      } else {
        console.log(`❌ Web Page ${page}: Failed (status ${res.status})`);
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ Web Page ${page}: Failed - ${err.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Test 5: Security Headers
 */
async function testSecurityHeaders() {
  try {
    const res = await request(`${settings.apiUrl}/v1/verify`);
    
    const expectedHeaders = [
      'x-content-type-options',
      'x-frame-options'
    ];
    
    let allPresent = true;
    for (const header of expectedHeaders) {
      if (!res.headers[header]) {
        console.log(`⚠️  Security Header Missing: ${header}`);
        allPresent = false;
      }
    }
    
    if (allPresent) {
      console.log('✅ Security Headers: OK');
      return true;
    }
    console.log('⚠️  Security Headers: Some missing (non-critical)');
    return true; // Non-critical
  } catch (err) {
    console.log(`❌ Security Headers: Failed - ${err.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('Testing API endpoints...\n');
  
  const results = [];
  
  results.push(await testApiHealth());
  results.push(await testHashAnchoring());
  results.push(await testCorsHeaders());
  results.push(await testSecurityHeaders());
  
  if (mode === '--local') {
    console.log('\nTesting web pages...\n');
    results.push(await testWebPages());
  }
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    console.log('✅ All tests passed! Deployment is ready.\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
}

// Run validation
runTests().catch(err => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
