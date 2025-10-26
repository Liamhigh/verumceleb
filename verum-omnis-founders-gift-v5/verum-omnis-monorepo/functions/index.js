import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({limit:"5mb"}));

// Helper: Validate SHA-512 hash
function isSha512(s) { return /^[a-f0-9]{128}$/i.test(s || ""); }

// In-memory receipt store (stateless - for demo only)
const receipts = new Map();

// Load governance files
let constitution = null;
let manifest = null;

try {
  const constitutionPath = join(__dirname, "assets/rules/01_constitution.json");
  const manifestPath = join(__dirname, "assets/rules/manifest.json");
  constitution = JSON.parse(readFileSync(constitutionPath, "utf8"));
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (err) {
  console.warn("Warning: Could not load governance files:", err.message);
}

// Health endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    status: "healthy",
    service: "verum-omnis-api"
  });
});

// V1 Verify endpoint (health check style)
app.get("/v1/verify", (_req, res) => {
  res.status(200).json({
    ok: true,
    pack: manifest?.pack || "unknown",
    version: manifest?.version || "unknown"
  });
});

// V1 Verify endpoint (POST - actual verification)
app.post("/v1/verify", (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) {
    return res.status(400).json({ ok: false, error: "sha512 required (128 hex chars)" });
  }
  return res.json({ ok: true, checked: true, sha512, findings: [] });
});

// V1 Seal endpoint
app.post("/v1/seal", (req, res) => {
  const { sha512, filename } = req.body || {};
  if (!isSha512(sha512)) {
    return res.status(400).json({ ok: false, error: "sha512 required (128 hex chars)" });
  }
  // Placeholder PDF result (implement PDFKit+QR in follow-up PR)
  return res.json({ ok: true, sealed: true, sha512, filename: filename || null, pdf: "base64:TODO" });
});

// V1 Contradict endpoint
app.post("/v1/contradict", (req, res) => {
  const { statements } = req.body || {};
  if (!Array.isArray(statements) || statements.length < 2) {
    return res.status(400).json({ ok: false, error: "statements array with at least 2 items required" });
  }
  
  // Simple contradiction detection (placeholder)
  const contradictions = [];
  // Check for location/time contradictions
  if (statements.some(s => s.includes("New York")) && statements.some(s => s.includes("London"))) {
    contradictions.push({
      severity: "HIGH",
      description: "Physical impossibility: cannot be in two locations simultaneously",
      statements: statements.filter(s => s.includes("New York") || s.includes("London"))
    });
  }
  
  return res.json({ 
    ok: true, 
    contradictions,
    count: contradictions.length
  });
});

// V1 Anchor endpoint
app.post("/v1/anchor", (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) {
    return res.status(400).json({ ok: false, error: "invalid_hash" });
  }
  
  const receipt = {
    hash: sha512,
    timestamp: new Date().toISOString(),
    tx: "0xMOCK_" + sha512.substring(0, 16)
  };
  
  receipts.set(sha512, receipt);
  
  return res.json({ ok: true, anchored: true, sha512, tx: receipt.tx });
});

// Chat endpoint
app.post("/chat", (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ ok: false, error: "missing_message" });
  }
  
  return res.json({
    ok: true,
    reply: `Echo: ${message}`,
    message
  });
});

// V1 Assistant endpoint (unified interface)
app.post("/v1/assistant", (req, res) => {
  const { mode, hash } = req.body || {};
  
  if (!mode) {
    return res.status(400).json({ ok: false, error: "mode_required" });
  }
  
  switch (mode) {
    case "verify":
      return res.json({
        ok: true,
        pack: "founders-release",
        version: manifest?.version || "unknown"
      });
      
    case "policy":
      return res.json({
        ok: true,
        constitution: constitution || { name: "Verum Omnis Constitution" },
        manifest: manifest || { version: "unknown" }
      });
      
    case "anchor":
      if (!hash) {
        return res.status(400).json({ ok: false, error: "hash_required_for_anchor" });
      }
      const anchorReceipt = {
        hash,
        timestamp: new Date().toISOString(),
        tx: "0xMOCK_" + hash.substring(0, 16)
      };
      receipts.set(hash, anchorReceipt);
      return res.json({ ok: true, hash, receipt: anchorReceipt });
      
    case "receipt":
      if (!hash) {
        return res.status(400).json({ ok: false, error: "hash_required_for_receipt" });
      }
      const storedReceipt = receipts.get(hash);
      if (!storedReceipt) {
        return res.status(404).json({ ok: false, error: "receipt_not_found" });
      }
      return res.json({ ok: true, receipt: storedReceipt });
      
    case "notice":
      return res.json({
        ok: true,
        notice: {
          citizen: "Free forever - Truth belongs to the people",
          institution: "20% of recovered fraud after trial, or licensing contract"
        }
      });
      
    default:
      return res.status(400).json({ ok: false, error: "invalid_mode" });
  }
});

// Legacy endpoints (backwards compatibility)
app.post("/echo-hash", (req, res) => {
  const { sha512 } = req.body || {};
  if (!sha512) return res.status(400).json({ error: "sha512 required" });
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 must be a 128-character hexadecimal string" });
  return res.json({ received: true, sha512 });
});

app.post("/verify", (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex chars)" });
  return res.json({ ok: true, checked: true, sha512, findings: [] });
});

app.post("/seal", (req, res) => {
  const { sha512, filename } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex chars)" });
  return res.json({ ok: true, sealed: true, sha512, filename: filename || null, pdf: "base64:TODO" });
});

app.post("/anchor", (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex chars)" });
  return res.json({ ok: true, anchored: true, sha512, tx: "0xMOCK" });
});

// Export for Firebase Functions v2
export const api = onRequest(app);

// Export app for testing
export { app };
