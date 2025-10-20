import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(__dirname, 'assets', 'rules', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log(`Checking ${manifest.files.length} files...`);
let errors = 0;

for (const {name, sha512: expected, size} of manifest.files) {
  const isTreaty = name.includes('treaty/');
  const fp = isTreaty 
    ? path.join(__dirname, name)
    : path.join(__dirname, 'assets', 'rules', name);
  
  if (!fs.existsSync(fp)) {
    console.error(`❌ MISSING: ${name}`);
    errors++;
    continue;
  }
  
  const actual = crypto.createHash('sha512').update(fs.readFileSync(fp)).digest('hex');
  const match = actual === expected;
  
  if (!match) {
    console.error(`❌ HASH MISMATCH: ${name}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
    errors++;
  } else {
    console.log(`✓ ${name}`);
  }
}

console.log(`\n${errors === 0 ? '✅ All files verified' : `❌ ${errors} errors found`}`);
process.exit(errors > 0 ? 1 : 0);
