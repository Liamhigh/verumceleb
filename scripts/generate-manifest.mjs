#!/usr/bin/env node
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the functions directory
const FUNCTIONS_DIR = join(__dirname, '..', 'verum-omnis-founders-gift-v5', 'verum-omnis-monorepo', 'functions');
const RULES_DIR = join(FUNCTIONS_DIR, 'assets', 'rules');
const TREATY_DIR = join(FUNCTIONS_DIR, 'assets', 'treaty');
const MANIFEST_PATH = join(RULES_DIR, 'manifest.json');

function calculateSHA512(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha512').update(content).digest('hex');
}

function getFileSize(filePath) {
  return statSync(filePath).size;
}

function generateManifest() {
  console.log('📝 Generating manifest.json...');
  
  const manifest = {
    pack: 'verum_rules_founders_release',
    version: new Date().toISOString().split('T')[0],
    files: []
  };

  // Process rules directory
  const rulesFiles = readdirSync(RULES_DIR).filter(f => 
    f !== 'manifest.json' && (f.endsWith('.json') || f.endsWith('.yaml') || f.endsWith('.md'))
  );

  for (const file of rulesFiles.sort()) {
    const filePath = join(RULES_DIR, file);
    manifest.files.push({
      name: file,
      sha512: calculateSHA512(filePath),
      size: getFileSize(filePath)
    });
  }

  // Process treaty directory
  if (existsSync(TREATY_DIR)) {
    const treatyFiles = readdirSync(TREATY_DIR);
    
    for (const file of treatyFiles.sort()) {
      const filePath = join(TREATY_DIR, file);
      manifest.files.push({
        name: `treaty/${file}`,
        sha512: calculateSHA512(filePath),
        size: getFileSize(filePath)
      });
    }
  }

  // Write manifest
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  
  console.log(`✅ Generated manifest with ${manifest.files.length} files`);
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Output: ${MANIFEST_PATH}`);
  
  return manifest;
}

// Run generator
generateManifest();
