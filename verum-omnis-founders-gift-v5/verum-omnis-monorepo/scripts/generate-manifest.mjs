import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const RULES_DIR = path.join(ROOT,'functions','assets','rules');
const TREATY_DIR = path.join(ROOT,'functions','assets','treaty');
const MANIFEST = path.join(RULES_DIR,'manifest.json');

function sha512(fp) {
  const h = crypto.createHash('sha512');
  h.update(fs.readFileSync(fp));
  return h.digest('hex');
}

const files = [];

// rules/*
for (const f of fs.readdirSync(RULES_DIR)) {
  if (f === 'manifest.json') continue;
  const fp = path.join(RULES_DIR, f);
  if (fs.statSync(fp).isFile()) {
    files.push({ name: f, sha512: sha512(fp), size: fs.statSync(fp).size });
  }
}

// treaty/* (if present)
if (fs.existsSync(TREATY_DIR)) {
  for (const f of fs.readdirSync(TREATY_DIR)) {
    const fp = path.join(TREATY_DIR, f);
    if (fs.statSync(fp).isFile()) {
      files.push({ name: `treaty/${f}`, sha512: sha512(fp), size: fs.statSync(fp).size });
    }
  }
}

const manifest = {
  pack: 'verum_rules_pack',
  version: new Date().toISOString().slice(0,10),
  files
};

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log('📝 manifest.json regenerated with', files.length, 'entries.');
