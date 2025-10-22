#!/usr/bin/env node
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the functions directory (adjust based on where script is run from)
const FUNCTIONS_DIR = process.cwd();
const MANIFEST_PATH = join(FUNCTIONS_DIR, 'assets', 'rules', 'manifest.json');

function calculateSHA512(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('sha512').update(content).digest('hex');
  } catch (err) {
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

function verifyManifest() {
  console.log('🔍 Verifying Immutable Pack...');
  
  // Check if manifest exists
  if (!existsSync(MANIFEST_PATH)) {
    console.error('❌ FATAL: manifest.json not found!');
    process.exit(1);
  }

  // Load manifest
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`📦 Pack: ${manifest.pack} (version: ${manifest.version})`);
  
  let allPassed = true;
  let filesChecked = 0;

  // Verify each file in the manifest
  for (const fileEntry of manifest.files) {
    const filePath = fileEntry.name.startsWith('treaty/')
      ? join(FUNCTIONS_DIR, 'assets', fileEntry.name)
      : join(FUNCTIONS_DIR, 'assets', 'rules', fileEntry.name);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`❌ MISSING: ${fileEntry.name}`);
      allPassed = false;
      continue;
    }

    // Calculate hash
    const actualHash = calculateSHA512(filePath);
    const expectedHash = fileEntry.sha512;

    if (actualHash === expectedHash) {
      console.log(`✅ ${fileEntry.name}`);
      filesChecked++;
    } else {
      console.error(`❌ HASH MISMATCH: ${fileEntry.name}`);
      console.error(`   Expected: ${expectedHash}`);
      console.error(`   Actual:   ${actualHash}`);
      allPassed = false;
    }
  }

  console.log(`\n📊 Verified ${filesChecked}/${manifest.files.length} files`);

  if (!allPassed) {
    console.error('\n❌ VERIFICATION FAILED: Immutable pack integrity compromised!');
    console.error('   DO NOT DEPLOY. The immutable rules or treaty have been altered.');
    process.exit(1);
  }

  console.log('\n✅ SUCCESS: All immutable files verified!');
  return true;
}

// Run verification
verifyManifest();
