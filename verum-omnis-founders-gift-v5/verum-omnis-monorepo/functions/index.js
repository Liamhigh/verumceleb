import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------- helpers ----------
const AUDIT_DIR = path.join(__dirname, "audit"); // ephemeral in Functions; move to DB for prod
if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });

function isSha512(s) { return /^[a-f0-9]{128}$/i.test(s || ""); }
function nowIso() { return dayjs().toISOString(); }
function truncHash(h) { return (h || "").slice(0, 10) + "…"; }
function sha256(str) { return crypto.createHash("sha256").update(str).digest("hex"); }

function appendAudit(row) {
  // NOTE: Cloud Functions filesystem is ephemeral; this is a demo chain-of-custody.
  // For production, write to Firestore/Cloud Storage (append-only) + optional Merkle anchoring.
  const line = JSON.stringify(row) + "\n";
  const f = path.join(AUDIT_DIR, "audit.jsonl");
  fs.appendFileSync(f, line, "utf8");
  return f;
}

// Mock model calls — replace with real API calls (e.g., OpenAI/Anthropic/DeepSeek) server-side
async function runModel_GPT(input) {
  // produce deterministic sample findings from the input context
  const base = sha256(JSON.stringify(input)).slice(0, 8);
  return [
    { id: `C-${base}-1`, type: "contradiction", span: "p.2 ¶3 vs email 2024-02-10", flag: true, confidence: 0.88 },
    { id: `T-${base}-2`, type: "timeline_gap", span: "2024-02-10 14:00–16:00", flag: true, confidence: 0.72 }
  ];
}
async function runModel_Claude(input) {
  const base = sha256(JSON.stringify(input)).slice(0, 8);
  return [
    { id: `C-${base}-1`, type: "contradiction", span: "p.2 ¶3 vs email 2024-02-10", flag: true, confidence: 0.90 },
    { id: `K-${base}-3`, type: "confession_indirect", span: "voice note ref", flag: false, confidence: 0.40 }
  ];
}
async function runModel_DeepSeek(input) {
  const base = sha256(JSON.stringify(input)).slice(0, 8);
  return [
    { id: `C-${base}-1`, type: "contradiction", span: "p.2 ¶3 vs email 2024-02-10", flag: true, confidence: 0.93 },
    { id: `B-${base}-4`, type: "bias_risk", span: "hedging phrases", flag: true, confidence: 0.61 }
  ];
}

// Consensus per atomic claim id: majority vote + average confidence
function consensusFrom(modelsById) {
  const findings = [];
  for (const [cid, arr] of Object.entries(modelsById)) {
    const votes = arr.map(a => a.flag ? 1 : 0);
    const voteSum = votes.reduce((a,b)=>a+b,0);
    const voteCount = votes.length;
    const majority = voteSum >= Math.ceil(voteCount/2);
    const avgConf = Number((arr.map(a=>a.confidence||0).reduce((a,b)=>a+b,0) / voteCount).toFixed(2));
    const typ = arr[0]?.type || "unknown";
    const span = arr[0]?.span || "";
    // token-lock this atomic claim
    const token = "sha256:" + sha256(JSON.stringify({ cid, typ, span, majority, avgConf }));
    findings.push({
      id: cid, type: typ, span,
      models: {
        gpt: arr.find(a=>a._m==="gpt")?.flag ? "flag":"ok",
        claude: arr.find(a=>a._m==="claude")?.flag ? "flag":"ok",
        deepseek: arr.find(a=>a._m==="deepseek")?.flag ? "flag":"ok"
      },
      consensus: `${voteSum}/${voteCount}${majority? "-flag":"-ok"}`,
      confidence: avgConf,
      token
    });
  }
  return findings;
}

function normalizeAndGroup(modelName, arr) {
  // attach model name and group by id
  const out = {};
  for (const a of arr) {
    const m = { ...a, _m: modelName, flag: !!a.flag };
    const key = a.id;
    (out[key] ||= []).push(m);
  }
  return out;
}

// ---------- routes ----------
app.get("/health", (_req, res) => res.status(200).send("OK"));

app.post("/verify", async (req, res) => {
  try {
    const { sha512, case_id, mime, size } = req.body || {};
    if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex)" });

    // Locks + context
    const locks = ["DocHash","SourceContext","ActionAudit"];
    const ctx = { case_id: case_id || null, mime: mime || null, size: size || null, receivedAt: nowIso() };

    // Triple-AI (mocked here; swap to real providers)
    const input = { sha512, ctx };
    const g = (await runModel_GPT(input)).map(o=>({ ...o, _m:"gpt" }));
    const c = (await runModel_Claude(input)).map(o=>({ ...o, _m:"claude" }));
    const d = (await runModel_DeepSeek(input)).map(o=>({ ...o, _m:"deepseek" }));

    // Group by claim id
    const group = {};
    for (const one of [g,c,d]) {
      for (const item of one) {
        (group[item.id] ||= []).push(item);
      }
    }

    // Build consensus table
    const findings = consensusFrom(group);

    // Audit row (append-only)
    const auditId = `${dayjs().format("YYYYMMDD-HHmmss")}-${uuidv4()}`;
    const auditRow = {
      auditId, docHash: sha512, locks, ctx,
      models: { gpt: g, claude: c, deepseek: d },
      findings, createdAt: nowIso()
    };
    appendAudit(auditRow);

    // Short human summary (no paraphrase; just counts)
    const flags = findings.filter(f=>/flag$/.test(f.consensus)).length;
    const summary = flags
      ? `${flags} claim(s) flagged by consensus; review details below.`
      : "No consensus flags.";

    return res.json({ ok: true, docHash: sha512, auditId, locks, findings, summary });
  } catch (err) {
    // Closed-Fail: include trace id
    const trace = uuidv4();
    appendAudit({ level:"error", at: nowIso(), trace, err: String(err) });
    return res.status(500).json({ error: "Closed-Fail: audit/write or model error", trace });
  }
});

app.post("/seal", async (req, res) => {
  try {
    const { sha512, filename } = req.body || {};
    if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex)" });

    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: "Verum Omnis Sealed PDF" }});
    const chunks = [];
    doc.on("data", (c)=>chunks.push(c));
    const done = new Promise((resolve)=> doc.on("end", resolve));

    // Header logo/title (use text; swap to image if you add assets/logo.png in Hosting)
    doc.fontSize(18).text("Verum Omnis — Forensic Seal", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666").text("Patent Pending • Court-Actionable Output", { align: "center" });
    doc.fillColor("#000");

    // Watermark (simple text watermark; for image watermark, draw PNG w/ low opacity)
    doc.save();
    doc.fillColor("#999").opacity(0.08);
    doc.fontSize(96).rotate(30, { origin: [300, 400] }).text("VERUM OMNIS", 60, 300, { align: "center" });
    doc.restore().opacity(1).fillColor("#000");

    // Body
    doc.moveDown(3);
    doc.fontSize(12).text("Document Hash (SHA-512):", { continued: true }).font("Courier").text(` ${sha512}`);
    doc.font("Helvetica").moveDown(0.5);
    doc.text(`Filename: ${filename || "N/A"}`);
    const truncated = truncHash(sha512);

    // QR code pointing to a verification hint (replace with your verifier URL)
    const verifyUrl = `https://verumdone.web.app/api/verify?sha512=${sha512}`;
    const qrDataURL = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 4 });
    const qrBase64 = qrDataURL.split(",")[1];
    const qrBuf = Buffer.from(qrBase64, "base64");
    doc.moveDown(1);
    doc.text("Verification QR:", { underline: true });
    doc.image(qrBuf, { width: 120 });

    // Footer seal
    doc.moveDown(2);
    doc.fontSize(11).text(`✔ Patent Pending — Verum Omnis • Hash: ${truncated}`);
    doc.fontSize(9).fillColor("#555").text("This PDF includes a visible watermark and QR for verification.");

    doc.end();
    await done;

    const pdfBase64 = Buffer.concat(chunks).toString("base64");
    return res.json({ ok: true, sealed: true, sha512, filename: filename || null, pdf: `base64:${pdfBase64}` });
  } catch (err) {
    return res.status(500).json({ error: "Failed to seal PDF", detail: String(err) });
  }
});

app.post("/anchor", async (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex)" });
  // Stub: return mock receipt; swap to real chain anchor later
  const tx = "0x" + sha256(sha512).slice(0, 64);
  const network = "polygon-amoy";
  const url = `https://amoy.polygonscan.com/tx/${tx}`;
  const receipt = { ok: true, anchored: true, sha512, network, tx, url };
  appendAudit({ level:"info", at: nowIso(), event:"anchor", ...receipt });
  return res.json(receipt);
});

export const api = functions.region("us-central1").https.onRequest(app);
