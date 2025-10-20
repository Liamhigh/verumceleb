import express from 'express'; import { onRequest } from 'firebase-functions/v2/https'; import cors from 'cors'; import helmet from 'helmet';
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import pino from 'pino';
import { makeSealedPdf } from './pdf/seal-template.js'; import { getReceipt, putReceipt } from './receipts-kv.js';
const log=pino({level:'info'}); const skipImmutable=process.env.SKIP_IMMUTABLE_VERIFY==='1'; export const app=express(); app.use(express.json({limit:'4mb'})); app.use(helmet({contentSecurityPolicy:false})); app.use(cors({ origin: true }));

// ---- Immutable Rules & Treaty Guard (cold start) ----
function sha512File(fp){ const h=crypto.createHash('sha512'); h.update(fs.readFileSync(fp)); return h.digest('hex'); }
if(!skipImmutable){
  (function verifyImmutablePack(){
    const rulesDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'assets', 'rules');
    const treatyDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'assets', 'treaty');
    const manifestPath = path.join(rulesDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) throw new Error('Rules manifest missing');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const listed = new Set(manifest.files.map(f => f.name));
    for (const { name, sha512 } of manifest.files){
      const isRule = !name.toLowerCase().includes('treaty/');
      const baseDir = isRule ? rulesDir : path.join(path.dirname(new URL(import.meta.url).pathname));
      const fp = name.toLowerCase().includes('treaty/') ? path.join(baseDir, name) : path.join(rulesDir, name);
      if (!fs.existsSync(fp)) throw new Error('Missing immutable artifact: '+name);
      const calc = sha512File(fp);
      if (calc !== sha512) throw new Error('Immutable artifact tampered: '+name+' expected='+sha512+' actual='+calc);
    }
    for (const f of fs.readdirSync(rulesDir)){
      if (f === 'manifest.json') continue;
      if (!listed.has(f)) throw new Error('Unexpected file in rules: '+f);
    }
    log.info('Immutable pack OK');
  })();
}else{
  log.warn('Immutable pack verification skipped');
}

// ---- API ----
app.get('/v1/verify', (_req,res)=>{ res.json({ ok:true, pack:'founders-release', time:new Date().toISOString() }); });
app.post('/v1/contradict', async (req,res)=>{ const { text }=req.body||{}; if(!text) return res.status(400).json({ok:false,error:'missing_text'}); res.json({ ok:true, result:{ findings:[], score:{contradiction:0} } }); });
app.post('/v1/anchor', async (req,res)=>{ const { hash }=req.body||{}; if(!hash) return res.status(400).json({ok:false,error:'invalid_hash'}); const r={ ok:true, hash, issuedAt:new Date().toISOString() }; try{ await putReceipt(hash,r); res.json(r); }catch(e){ res.status(500).json({ok:false,error:'receipt_failed'}); } });
app.post('/v1/seal', async (req,res)=>{ const { hash, title, notes }=req.body||{}; if(!hash) return res.status(400).json({ok:false,error:'invalid_hash'});
  const logoPath = path.join(path.dirname(new URL(import.meta.url).pathname),'..','web','assets','logo.png');
  const pdf = await makeSealedPdf({ hash, title, notes, logoPath }); const tmp='/tmp/vo.pdf'; const ws=fs.createWriteStream(tmp); pdf.pipe(ws); ws.on('finish',()=>{ res.setHeader('Content-Type','application/pdf'); res.sendFile(tmp,()=>fs.unlinkSync(tmp)); }); });

export const api2 = onRequest({ region:'us-central1' }, app);


// ---- Video endpoints (present but disabled by default) ----
import { handleVideoUpload } from './video/video-ingest.js';
import { transcribe } from './video/transcription.js';
import { detectThreats } from './video/threat-detect.js';

const videoCfg = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname),'config.video.json'),'utf8'));
app.get('/v1/video/status', (_req,res)=>{ res.json({ ok:true, status: videoCfg }); });
app.post('/v1/video/upload', (_req,res)=>{ res.status(501).json({ ok:false, error:'VIDEO_DISABLED' }); });
app.post('/v1/video/transcribe', (_req,res)=>{ res.status(501).json({ ok:false, error:'TRANSCRIBE_DISABLED' }); });
app.post('/v1/video/analyze', (_req,res)=>{ res.status(501).json({ ok:false, error:'THREAT_DETECT_DISABLED' }); });
