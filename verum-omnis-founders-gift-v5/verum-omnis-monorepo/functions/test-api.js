#!/usr/bin/env node
/**
 * Comprehensive test script for Verum Omnis API endpoints
 * Tests core functionality without requiring Firebase deployment
 */

import { readFileSync } from 'fs';
import path from 'path';

console.log('🧪 Testing Verum Omnis API Functions\n');

// Test 1: Import and verify immutable pack
console.log('Test 1: Immutable Pack Verification');
try {
  await import('./index.js');
  console.log('✅ Immutable pack verification passed\n');
} catch (error) {
  console.error('❌ Immutable pack verification failed:', error.message);
  process.exit(1);
}

// Test 2: Verify manifest.json structure
console.log('Test 2: Manifest Structure');
try {
  const manifestPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'assets', 'rules', 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  
  if (!manifest.files || !Array.isArray(manifest.files)) {
    throw new Error('Manifest missing files array');
  }
  
  console.log(`✅ Manifest contains ${manifest.files.length} files`);
  
  // Verify each file has required fields
  for (const file of manifest.files) {
    if (!file.name || !file.sha512) {
      throw new Error(`Invalid file entry: ${JSON.stringify(file)}`);
    }
  }
  console.log('✅ All manifest entries have required fields\n');
} catch (error) {
  console.error('❌ Manifest verification failed:', error.message);
  process.exit(1);
}

// Test 3: Verify PDF sealing function
console.log('Test 3: PDF Sealing Function');
try {
  const { makeSealedPdf } = await import('./pdf/seal-template.js');
  
  const testHash = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
  const pdf = await makeSealedPdf({
    hash: testHash,
    title: 'Test Document Seal',
    notes: 'Automated test seal',
    qrPayload: `vo://${testHash}`
  });
  
  if (!pdf || typeof pdf.pipe !== 'function') {
    throw new Error('PDF generation did not return a valid stream');
  }
  
  console.log('✅ PDF sealing function works correctly\n');
} catch (error) {
  console.error('❌ PDF sealing failed:', error.message);
  process.exit(1);
}

// Test 4: Verify receipt storage functions
console.log('Test 4: Receipt Storage Functions');
try {
  const { putReceipt, getReceipt } = await import('./receipts-kv.js');
  
  const testHash = 'test-hash-' + Date.now();
  const testReceipt = {
    ok: true,
    hash: testHash,
    issuedAt: new Date().toISOString()
  };
  
  await putReceipt(testHash, testReceipt);
  console.log('✅ Receipt stored successfully');
  
  const retrieved = await getReceipt(testHash);
  if (JSON.stringify(retrieved) !== JSON.stringify(testReceipt)) {
    throw new Error('Retrieved receipt does not match stored receipt');
  }
  console.log('✅ Receipt retrieved successfully\n');
} catch (error) {
  console.error('❌ Receipt storage failed:', error.message);
  process.exit(1);
}

// Test 5: Verify video config
console.log('Test 5: Video Configuration');
try {
  const videoConfigPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'config.video.json');
  const videoCfg = JSON.parse(readFileSync(videoConfigPath, 'utf8'));
  
  console.log(`✅ Video features are ${videoCfg.enabled ? 'enabled' : 'disabled (as expected)'}\n`);
} catch (error) {
  console.error('❌ Video config check failed:', error.message);
  process.exit(1);
}

// Test 6: Verify critical assets exist
console.log('Test 6: Critical Assets Verification');
try {
  const assetsToCheck = [
    '../web/assets/logo.png',
    '../web/assets/logo_black.png',
    'assets/rules/manifest.json',
    'assets/rules/01_constitution.json',
    'assets/rules/gift_rules_v5.json',
    'assets/treaty/Guardianship_Treaty_Verum_Omnis_Founders.pdf'
  ];
  
  const { existsSync } = await import('fs');
  for (const assetPath of assetsToCheck) {
    const fullPath = path.join(path.dirname(new URL(import.meta.url).pathname), assetPath);
    if (!existsSync(fullPath)) {
      throw new Error(`Missing critical asset: ${assetPath}`);
    }
  }
  console.log('✅ All critical assets present\n');
} catch (error) {
  console.error('❌ Asset verification failed:', error.message);
  process.exit(1);
}

console.log('🎉 All tests passed! API is ready for deployment.\n');
