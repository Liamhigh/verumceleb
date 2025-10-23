import express from 'express'; import { onRequest } from 'firebase-functions/v2/https'; import cors from 'cors'; import helmet from 'helmet';
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import pino from 'pino';
import { makeSealedPdf } from './pdf/seal-template.js'; import { getReceipt, putReceipt } from './receipts-kv.js';

// ---------- ENV & HARDENING ----------
const log = pino({ level: 'info' });
const NODE_ENV = process.env.NODE_ENV || 'development';
// Set your actual hosting domain via PROJECT_HOST env var or replace the default below
const PROJECT_HOST = process.env.PROJECT_HOST || 'https://verumdone.web.app';
const ALLOWED_ORIGINS = [
  PROJECT_HOST,
  PROJECT_HOST.replace('.web.app', '.firebaseapp.com')
];

// In production, never skip immutable verification
if (NODE_ENV === 'production' && process.env.SKIP_IMMUTABLE_VERIFY) {
  throw new Error('SKIP_IMMUTABLE_VERIFY must not be set in production');
}

// Allow tests/dev to skip immutable verification via env var
const skipImmutable = process.env.SKIP_IMMUTABLE_VERIFY === '1';

export const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(helmet({ contentSecurityPolicy: false }));

// Strict CORS in production, permissive in dev to allow local testing
const corsOptions = NODE_ENV === 'production'
  ? {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // allow curl/postman
        const ok = ALLOWED_ORIGINS.includes(origin);
        cb(ok ? null : new Error('CORS blocked'), ok);
      },
      credentials: false,
    }
  : { origin: true };

app.use(cors(corsOptions));

// Small security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'microphone=(), camera=()');
  next();
});

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
app.get('/health', (_req,res)=>{ res.json({ ok:true, status:'healthy', service:'verum-omnis-api', version:'1.0.0', time:new Date().toISOString() }); });
app.post('/chat', async (req,res)=>{ const { message }=req.body||{}; if(!message) return res.status(400).json({ok:false,error:'missing_message'}); res.json({ ok:true, reply:`You said: "${message}". Verum Omnis Chat is ready.`, timestamp:new Date().toISOString() }); });
app.get('/v1/verify', (_req,res)=>{ res.json({ ok:true, pack:'founders-release', time:new Date().toISOString() }); });
app.post('/v1/contradict', async (req,res)=>{ const { text }=req.body||{}; if(!text) return res.status(400).json({ok:false,error:'missing_text'}); res.json({ ok:true, result:{ findings:[], score:{contradiction:0} } }); });
app.post('/v1/anchor', async (req,res)=>{ const { hash }=req.body||{}; if(!hash) return res.status(400).json({ok:false,error:'invalid_hash'}); const r={ ok:true, hash, issuedAt:new Date().toISOString() }; try{ await putReceipt(hash,r); res.json(r); }catch(e){ res.status(500).json({ok:false,error:'receipt_failed'}); } });
app.post('/v1/seal', async (req,res)=>{ const { hash, title, notes }=req.body||{}; if(!hash) return res.status(400).json({ok:false,error:'invalid_hash'});
  const logoPath = path.join(path.dirname(new URL(import.meta.url).pathname),'..','web','assets','logo.png');
  const pdf = await makeSealedPdf({ hash, title, notes, logoPath }); const tmp='/tmp/vo.pdf'; const ws=fs.createWriteStream(tmp); pdf.pipe(ws); ws.on('finish',()=>{ res.setHeader('Content-Type','application/pdf'); res.sendFile(tmp,()=>fs.unlinkSync(tmp)); }); });

// ---- Assistant Endpoint (unified interface) ----
app.post('/v1/assistant', async (req,res)=>{
  const { mode, hash }=req.body||{};
  if(!mode) return res.status(400).json({ok:false,error:'missing_mode'});
  
  switch(mode){
    case 'verify':
      return res.json({ ok:true, pack:'founders-release', time:new Date().toISOString(), model_hash:'sha512-placeholder', rule_hash:'sha512-placeholder' });
    
    case 'policy':
      const manifestPath = path.join(path.dirname(new URL(import.meta.url).pathname),'assets','rules','manifest.json');
      const constitutionPath = path.join(path.dirname(new URL(import.meta.url).pathname),'assets','rules','01_constitution.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
      const constitution = JSON.parse(fs.readFileSync(constitutionPath,'utf8'));
      return res.json({ ok:true, constitution, manifest });
    
    case 'anchor':
      if(!hash) return res.status(400).json({ok:false,error:'hash_required_for_anchor'});
      const anchorReceipt={ ok:true, hash, issuedAt:new Date().toISOString(), anchor_request:'pending', txid:null };
      try{ await putReceipt(hash,anchorReceipt); return res.json(anchorReceipt); }catch(e){ return res.status(500).json({ok:false,error:'anchor_failed'}); }
    
    case 'receipt':
      if(!hash) return res.status(400).json({ok:false,error:'hash_required_for_receipt'});
      const receipt = await getReceipt(hash);
      if(!receipt) return res.status(404).json({ok:false,error:'receipt_not_found'});
      return res.json({ ok:true, receipt });
    
    case 'notice':
      return res.json({ ok:true, notice:{ citizen:'Free forever. Truth belongs to the people.', institution:'Free trial. Licensing fees: 20% fraud recovery or contract terms.' } });
    
    default:
      return res.status(400).json({ok:false,error:'invalid_mode',valid_modes:['verify','policy','anchor','receipt','notice']});
  }
});

app.get('/v1/notice', (_req,res)=>{ res.json({ ok:true, notice:{ citizen:'Free forever. Truth belongs to the people.', institution:'Free trial. Licensing fees: 20% fraud recovery or contract terms.' } }); });

export const api = onRequest({ region:'us-central1' }, app);


// ---- Video endpoints (present but disabled by default) ----
import { handleVideoUpload } from './video/video-ingest.js';
import { transcribe } from './video/transcription.js';
import { detectThreats } from './video/threat-detect.js';

const videoCfg = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname),'config.video.json'),'utf8'));
app.get('/v1/video/status', (_req,res)=>{ res.json({ ok:true, status: videoCfg }); });
app.post('/v1/video/upload', (_req,res)=>{ res.status(501).json({ ok:false, error:'VIDEO_DISABLED' }); });
app.post('/v1/video/transcribe', (_req,res)=>{ res.status(501).json({ ok:false, error:'TRANSCRIBE_DISABLED' }); });
app.post('/v1/video/analyze', (_req,res)=>{ res.status(501).json({ ok:false, error:'THREAT_DETECT_DISABLED' }); });
