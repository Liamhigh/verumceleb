import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({limit:"5mb"}));

// ============================================================================
// DATA STORES
// ============================================================================

// In-memory receipt store (would be Firestore in production)
const receipts = new Map();

// Load constitution and manifest
let constitution = null;
let manifest = null;

try {
  // Try to load constitution from web/data
  const constitutionPath = join(__dirname, '../web/data/constitution.json');
  constitution = JSON.parse(readFileSync(constitutionPath, 'utf8'));
} catch (error) {
  console.warn('Could not load constitution.json:', error.message);
  constitution = { 
    title: "Verum Omnis Constitutional Framework",
    principles: [],
    loaded: false 
  };
}

try {
  // Try to load manifest from functions/assets/rules
  const manifestPath = join(__dirname, 'assets/rules/manifest.json');
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.warn('Could not load manifest.json:', error.message);
  manifest = { 
    pack: "founders-release",
    version: "unknown",
    files: [],
    loaded: false 
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function isSha512(s) { 
  return /^[a-f0-9]{128}$/i.test(s || ""); 
}

// ============================================================================
// ROUTES
// ============================================================================

// Health endpoint with service info
app.get("/health", (_req, res) => {
  return res.status(200).json({
    ok: true,
    status: 'healthy',
    service: 'verum-omnis-api'
  });
});

// Chat endpoint - conversational interface
app.post("/chat", (req, res) => {
  const { message } = req.body || {};
  
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ 
      ok: false, 
      error: 'missing_message' 
    });
  }
  
  // Simple echo with conversational wrapper
  // In production, this would call LLM or have more sophisticated responses
  const reply = `I received your message: "${message}". How can I help you with document verification, sealing, or anchoring?`;
  
  return res.json({ 
    ok: true, 
    reply,
    timestamp: new Date().toISOString()
  });
});

// /v1/verify endpoint - simple verification check
app.get("/v1/verify", (_req, res) => {
  return res.json({ 
    ok: true,
    status: 'ready',
    service: 'verum-omnis-verification'
  });
});

// /v1/anchor endpoint - simplified anchoring
app.post("/v1/anchor", (req, res) => {
  const { hash, sha512 } = req.body || {};
  const hashToUse = hash || sha512;
  
  if (!hashToUse) {
    return res.status(400).json({ 
      ok: false, 
      error: 'invalid_hash',
      message: 'hash or sha512 required'
    });
  }
  
  // Create receipt
  const receipt = {
    hash: hashToUse,
    timestamp: new Date().toISOString(),
    method: 'client-anchor',
    txHash: null,
    note: 'Anchored in local storage'
  };
  
  // Store receipt
  receipts.set(hashToUse, receipt);
  
  return res.json({ 
    ok: true,
    anchored: true,
    hash: hashToUse,
    receipt,
    tx: '0xMOCK'
  });
});

// /v1/contradict endpoint - fraud/contradiction detection
app.post("/v1/contradict", (req, res) => {
  const { text, documents, sha512 } = req.body || {};
  
  if (!text && !documents) {
    return res.status(400).json({
      ok: false,
      error: 'missing_content',
      message: 'text or documents array required'
    });
  }
  
  // Simple contradiction analysis (would be more sophisticated in production)
  const contradictions = [];
  const riskScore = 0.15; // Low risk by default
  
  // Check for basic red flags
  const content = text || JSON.stringify(documents);
  const redFlags = [
    { pattern: /fraud/i, type: 'fraud_mention', severity: 'medium' },
    { pattern: /fake/i, type: 'authenticity_question', severity: 'medium' },
    { pattern: /forged/i, type: 'forgery_concern', severity: 'high' },
    { pattern: /tampered/i, type: 'tampering_concern', severity: 'high' }
  ];
  
  for (const flag of redFlags) {
    if (flag.pattern.test(content)) {
      contradictions.push({
        type: flag.type,
        severity: flag.severity,
        evidence: 'Pattern detected in content',
        location: 'document_content'
      });
    }
  }
  
  const finalRiskScore = contradictions.length > 0 
    ? Math.min(0.15 + (contradictions.length * 0.2), 1.0)
    : riskScore;
  
  return res.json({
    ok: true,
    riskScore: finalRiskScore,
    contradictions,
    analysis: {
      totalDocuments: documents ? documents.length : 1,
      contradictionsFound: contradictions.length,
      recommendation: contradictions.length === 0 
        ? 'Document appears consistent' 
        : 'Review flagged items carefully'
    },
    timestamp: new Date().toISOString()
  });
});

// /v1/assistant endpoint - mode-based routing with legal brain
app.post("/v1/assistant", (req, res) => {
  const { mode, hash, sha512 } = req.body || {};
  
  const hashToUse = hash || sha512;
  
  // Validate mode
  const validModes = ['verify', 'policy', 'anchor', 'receipt', 'notice', 'chat'];
  if (!mode || !validModes.includes(mode)) {
    return res.status(400).json({ 
      ok: false, 
      error: 'invalid_mode',
      message: `mode must be one of: ${validModes.join(', ')}`
    });
  }
  
  // Route based on mode
  switch (mode) {
    case 'verify':
      // Return pack information
      return res.json({
        ok: true,
        pack: 'founders-release',
        version: manifest?.version || '1.0.0',
        constitution: constitution?.title || 'Verum Omnis Constitutional Framework'
      });
      
    case 'policy':
      // Return constitution and manifest
      return res.json({
        ok: true,
        constitution: constitution || { loaded: false },
        manifest: manifest || { loaded: false },
        timestamp: new Date().toISOString()
      });
      
    case 'anchor':
      // Anchor mode requires hash
      if (!hashToUse) {
        return res.status(400).json({ 
          ok: false, 
          error: 'hash_required_for_anchor',
          message: 'hash field is required for anchor mode'
        });
      }
      
      // Create and store receipt
      const anchorReceipt = {
        hash: hashToUse,
        timestamp: new Date().toISOString(),
        method: 'assistant-anchor',
        txHash: null,
        note: 'Client-side anchor via assistant'
      };
      
      receipts.set(hashToUse, anchorReceipt);
      
      return res.json({
        ok: true,
        mode: 'anchor',
        hash: hashToUse,
        receipt: anchorReceipt,
        message: 'Hash anchored successfully'
      });
      
    case 'receipt':
      // Receipt mode retrieves stored receipt
      if (!hashToUse) {
        return res.status(400).json({ 
          ok: false, 
          error: 'hash_required_for_receipt',
          message: 'hash field is required for receipt mode'
        });
      }
      
      const storedReceipt = receipts.get(hashToUse);
      if (!storedReceipt) {
        return res.status(404).json({
          ok: false,
          error: 'receipt_not_found',
          message: `No receipt found for hash: ${hashToUse.substring(0, 16)}...`
        });
      }
      
      return res.json({
        ok: true,
        mode: 'receipt',
        hash: hashToUse,
        receipt: storedReceipt
      });
      
    case 'notice':
      // Return licensing terms
      return res.json({
        ok: true,
        mode: 'notice',
        notice: {
          citizen: 'Free forever - Individual citizens never pay for document verification',
          institution: 'Institutions and companies: 20% of fraud recovery after successful trial',
          timestamp: new Date().toISOString()
        }
      });
      
    case 'chat':
      // Chat mode for conversational interface
      const { message } = req.body;
      return res.json({
        ok: true,
        mode: 'chat',
        reply: message ? `Received: ${message}` : 'How can I assist you?',
        timestamp: new Date().toISOString()
      });
      
    default:
      return res.status(400).json({ 
        ok: false, 
        error: 'invalid_mode' 
      });
  }
});

// Legacy endpoints for backwards compatibility
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
  const receipt = {
    sha512,
    timestamp: new Date().toISOString(),
    method: 'legacy-anchor'
  };
  receipts.set(sha512, receipt);
  return res.json({ ok: true, anchored: true, sha512, tx: "0xMOCK" });
});

// Export for Firebase Functions v2
export const api = onRequest(app);

// Export app for testing
export { app };
