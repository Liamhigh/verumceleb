import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RULES_DIR = path.join('functions','assets','rules');
const MANIFEST = path.join(RULES_DIR,'manifest.json');

function sha512(fp) {
  const h = crypto.createHash('sha512');
  h.update(fs.readFileSync(fp));
  return h.digest('hex');
}

if (!fs.existsSync(MANIFEST)) {
  console.error('❌ Missing manifest.json');
  process.exit(1);
}

const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const listed = new Set(m.files.map(f => f.name));

for (const f of fs.readdirSync(RULES_DIR)) {
  if (f === 'manifest.json') continue;
  if (!listed.has(f)) {
    console.error('❌ Unexpected file in rules/:', f);
    process.exit(1);
  }
}

for (const {name, sha512: expected} of m.files) {
  const fp = name.startsWith('treaty/')
    ? path.join('functions','assets', name)
    : path.join(RULES_DIR, name);
  if (!fs.existsSync(fp)) {
    console.error('❌ Listed artifact missing:', name);
    process.exit(1);
  }
  const actual = sha512(fp);
  if (actual !== expected) {
    console.error(`❌ Hash mismatch for ${name}\nExpected: ${expected}\nActual:   ${actual}`);
    process.exit(1);
  }
}

console.log('✅ Immutable pack verified locally');
