export function makeReply({ filename, sizeHuman, sha512, shaShort, analysis }) {
  const metaLine = summarizeMeta(analysis.meta);
  const firstLook = toFirstLook(analysis.classification);

  return [
    "## 📎 Verum Omnis — Document Received",
    "",
    `**File:** \`${filename}\` • **Size:** ${sizeHuman} • **Type:** ${analysis.mime}`,
    `**Hash (SHA-512 first 16):** \`${shaShort}\``,
    "",
    "### 🧭 First look",
    `${firstLook}`,
    metaLine ? `- ${metaLine}` : "",
    analysis.pdfaStatus ? `- PDF/A check: ${analysis.pdfaStatus}` : "",
    analysis.embeddedSummary ? `- Embedded objects: ${analysis.embeddedSummary}` : "",
    "",
    "### 🗣️ Tell me what's going on",
    "Before I do anything else, tell me in your own words why you uploaded this. I'm listening.",
    "",
    "### 🧠 Plain-language explanation",
    (analysis.summary || "_(No summary)_"),
    "",
    "### 🔎 At-a-glance",
    "```",
    (analysis.textPreview || "(no text extracted)").slice(0, 1000),
    "```",
    "",
    "### ➡️ What I can do next (pick one or more)",
    "- **Explain deeper** — say: `summarize`",
    "- **Investigate** (contradictions, anomalies, metadata) — say: `scan`",
    "- **Compare** with another doc — say: `compare <other>`",
    "- **Timeline** correlation — say: `timeline`",
    "- **Seal** (PDF/A-3B + watermark + QR + SHA-512) — say: `seal`",
    "- **Anchor** on-chain — say: `anchor`",
    "",
    "_I won't alter your source file. Seals are tamper-evident._"
  ].filter(Boolean).join("\n");
}

function toFirstLook(classification) {
  switch (classification) {
    case "legal_affidavit":
      return "This appears to be a **legal affidavit** or sworn statement.";
    case "invoice_or_receipt":
      return "This appears to be a **commercial invoice/receipt**.";
    case "technical_pdf":
      return "This appears to be a **technical PDF** (setup/config/instructions).";
    case "legal_contract":
      return "This appears to be a **legal contract/terms document**.";
    default:
      return "This appears to be a **general PDF**.";
  }
}

function summarizeMeta(meta = {}) {
  const bits = [];
  if (meta.Producer) bits.push(`Producer: ${meta.Producer}`);
  if (meta.Creator) bits.push(`Creator: ${meta.Creator}`);
  if (meta.CreationDate) bits.push(`Created: ${meta.CreationDate}`);
  return bits.join(" • ");
}
