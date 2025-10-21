import { fileTypeFromBuffer } from "file-type";
import pdfParse from "pdf-parse";
import crypto from "node:crypto";
import { classifyByHeuristics } from "./lib/classify.js";
import { request } from "undici";

// Optional: OpenAI summary (if key present)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function analyzeFile(buf, { filenameGuess = "file" } = {}) {
  const type = await fileTypeFromBuffer(buf);
  const mime = type?.mime || "application/octet-stream";

  let text = "";
  let meta = {};
  let pdfa = "Not checked";
  let embedded = "Not analyzed";

  if (mime === "application/pdf" || filenameGuess.toLowerCase().endsWith(".pdf")) {
    try {
      const res = await pdfParse(buf);
      text = (res.text || "").trim();
      meta = res.info || {};
      // simple embedded objects check:
      embedded = res.metadata ? "Metadata present" : "No XMP metadata";
      // pdf/a heuristic (flag if the metadata contains pdfa keys)
      pdfa = /pdfa/i.test(JSON.stringify(res.metadata || {})) ? "Likely PDF/A" : "Not declared PDF/A";
    } catch (e) {
      text = "";
      meta = { error: "PDF parse failed: " + e.message };
    }
  }

  const filename = filenameGuess;
  const head = text.split(/\n+/).slice(0, 40).join("\n"); // first chunk for quick skim
  const classification = classifyByHeuristics({ filename, mime, textHead: head });

  // Optional LLM summary (fallback to rule-based if missing)
  const summary = await summarize({ filename, mime, text, meta, classification });

  return {
    filename,
    mime,
    meta,
    pdfaStatus: pdfa,
    embeddedSummary: embedded,
    textPreview: head.slice(0, 2000),
    classification,
    summary
  };
}

async function summarize(ctx) {
  // If no OpenAI key, do a compact heuristic summary
  if (!OPENAI_API_KEY) {
    return heuristicSummary(ctx);
  }
  try {
    // tiny, cost-controlled summarization; avoids style bloat
    const content = [
      "You are Verum Omnis. Explain in plain language what this file is and what it appears to do.",
      "Be concise (120-180 words), no fluff, then list 3–5 key points.",
      "If it looks like the wrong doc for a complaint (e.g., tech PDF instead of affidavit), say that politely.",
      "Do not offer sealing yet; we offer actions after the explanation.",
      "",
      `filename: ${ctx.filename}`,
      `mime: ${ctx.mime}`,
      `meta: ${JSON.stringify(ctx.meta).slice(0, 1200)}`,
      `classification: ${ctx.classification}`,
      `text sample: ${ctx.text?.slice(0, 4000) || ""}`
    ].join("\n");

    const { body } = await request("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content }],
        temperature: 0.2
      })
    });
    const data = await body.json();
    const msg = data?.choices?.[0]?.message?.content?.trim();
    return msg || heuristicSummary(ctx);
  } catch {
    return heuristicSummary(ctx);
  }
}

function heuristicSummary({ filename, mime, meta, text, classification }) {
  const points = [];
  if (/pdf/i.test(mime)) {
    if (meta?.Producer) points.push(`Producer: ${meta.Producer}`);
    if (meta?.Creator) points.push(`Creator: ${meta.Creator}`);
    if (meta?.CreationDate) points.push(`Created: ${meta.CreationDate}`);
    if (text) points.push(`Detected ${Math.min(text.length, 2000)} chars of text content`);
  }

  let para = "";
  switch (classification) {
    case "legal_affidavit":
      para = "This appears to be a legal affidavit or sworn statement, likely intended for court or a formal administrative process.";
      break;
    case "invoice_or_receipt":
      para = "This looks like a commercial invoice/receipt with line items, totals, or payment instructions.";
      break;
    case "technical_pdf":
      para = "This looks like a technical PDF (setup, config, or documentation) rather than a legal or financial filing.";
      break;
    default:
      para = "This appears to be a general PDF document. The visible content suggests a narrative or instructional format.";
  }

  return `${para}\n\nKey details:\n- ${points.join("\n- ") || "No obvious metadata fields extracted"}`;
}
