import fs from 'fs';
import path from 'path';
import { makeSealedPdf } from './pdf/seal-template.js';

async function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

async function run() {
    const outDir = path.join('.', 'seals');
    await ensureDir(outDir);
    const items = [
        { hash: 'hash-1', title: 'Seal 1', notes: 'First', qr: 'vo://hash-1' },
        { hash: 'hash-2', title: 'Seal 2', notes: 'Second', qr: 'vo://hash-2' },
        { hash: 'hash-3', title: 'Seal 3', notes: 'Third', qr: 'vo://hash-3' }
    ];
    const forensics = [];
    for (const it of items) {
        const pdf = await makeSealedPdf({ hash: it.hash, title: it.title, notes: it.notes, qrPayload: it.qr });
        const fname = path.join(outDir, `${it.hash}.pdf`);
        const ws = fs.createWriteStream(fname);
        pdf.pipe(ws);
        await new Promise((res, rej) => ws.on('finish', res).on('error', rej));
        forensics.push({ hash: it.hash, file: fname, qr: it.qr });
    }
    fs.writeFileSync(path.join(outDir, 'forensics.json'), JSON.stringify(forensics, null, 2));
    console.log('Batch seals generated in', outDir);
}

run().catch(e => { console.error(e); process.exit(1); });
