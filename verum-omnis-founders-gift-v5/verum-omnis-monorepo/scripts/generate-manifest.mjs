#!/usr/bin/env node

import { readFile, readdir, stat, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function computeHash(filepath) {
  const content = await readFile(filepath);
  return createHash('sha512').update(content).digest('hex');
}

async function getFileSize(filepath) {
  const stats = await stat(filepath);
  return stats.size;
}

async function generateManifest() {
  const functionsDir = join(__dirname, '..', 'functions');
  const rulesDir = join(functionsDir, 'assets', 'rules');
  const treatyDir = join(functionsDir, 'assets', 'treaty');
  const manifestPath = join(rulesDir, 'manifest.json');

  log('📝 Generating manifest for immutable rules and treaties...', 'cyan');
  log('');

  const files = [];

  // Process rules directory
  log('🔍 Scanning rules directory...', 'blue');
  const rulesFiles = await readdir(rulesDir);
  
  for (const filename of rulesFiles) {
    // Skip manifest.json and CHANGELOG
    if (filename === 'manifest.json' || filename === 'gift_rules_CHANGELOG.md') {
      continue;
    }

    const filepath = join(rulesDir, filename);
    const stats = await stat(filepath);
    
    // Only process files, not directories
    if (stats.isFile()) {
      const hash = await computeHash(filepath);
      const size = stats.size;
      
      files.push({
        name: filename,
        sha512: hash,
        size: size
      });
      
      log(`  ✓ ${filename}`, 'green');
    }
  }

  // Process treaty directory if it exists
  log('🔍 Scanning treaty directory...', 'blue');
  try {
    const treatyFiles = await readdir(treatyDir);
    
    for (const filename of treatyFiles) {
      const filepath = join(treatyDir, filename);
      const stats = await stat(filepath);
      
      // Only process files, not directories
      if (stats.isFile()) {
        const hash = await computeHash(filepath);
        const size = stats.size;
        
        files.push({
          name: `treaty/${filename}`,
          sha512: hash,
          size: size
        });
        
        log(`  ✓ treaty/${filename}`, 'green');
      }
    }
  } catch (error) {
    log('  ℹ️  No treaty directory found (this is okay)', 'yellow');
  }

  // Sort files by name for consistent ordering
  files.sort((a, b) => a.name.localeCompare(b.name));

  // Create manifest object
  const manifest = {
    pack: 'verum_rules_founders_release',
    version: new Date().toISOString().split('T')[0],
    files: files
  };

  // Write manifest
  const manifestJson = JSON.stringify(manifest, null, 2);
  await writeFile(manifestPath, manifestJson + '\n', 'utf-8');

  log('');
  log(`✅ Manifest generated successfully with ${files.length} files!`, 'green');
  log(`📄 Manifest written to: ${manifestPath}`, 'green');
  log('');
  log('⚠️  IMPORTANT: Remember to commit the updated manifest.json', 'yellow');
}

// Run generation
generateManifest().catch(error => {
  log('❌ Error generating manifest: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});
