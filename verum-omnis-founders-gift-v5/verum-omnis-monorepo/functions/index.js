import functions from "firebase-functions";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({limit:"5mb"}));

app.get("/health", (_req, res) => res.status(200).send("OK"));

function isSha512(s) { return /^[a-f0-9]{128}$/i.test(s || ""); }

app.post("/echo-hash", (req, res) => {
  const { sha512 } = req.body || {};
  if (!sha512) return res.status(400).json({ error: "sha512 required" });
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 must be a 128-character hexadecimal string" });
  return res.json({ received: true, sha512 });
});

// Minimal stub endpoints so UI buttons don't 404.
// Copilot: expand these per /.github/copilot-instructions.md (triple-AI, sealing, anchoring).
app.post("/verify", (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex chars)" });
  return res.json({ ok: true, checked: true, sha512, findings: [] });
});

app.post("/seal", (req, res) => {
  const { sha512, filename } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex chars)" });
  // Placeholder PDF result (implement PDFKit+QR in follow-up PR)
  return res.json({ ok: true, sealed: true, sha512, filename: filename || null, pdf: "base64:TODO" });
});

app.post("/anchor", (req, res) => {
  const { sha512 } = req.body || {};
  if (!isSha512(sha512)) return res.status(400).json({ error: "sha512 required (128 hex chars)" });
  // Placeholder receipt
  return res.json({ ok: true, anchored: true, sha512, tx: "0xMOCK" });
});

export const api = functions.region("us-central1").https.onRequest(app);
