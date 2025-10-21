# Verum Omnis GitHub Bot

**Listening First. Analyzing Second. Sealing Last.**

---

## What This Does

This GitHub Actions bot embodies the **Verum Omnis personality** — it listens first, explains what it sees, then offers forensic tools.

When someone uploads a PDF to a GitHub issue/comment:

1. **Acknowledges** receipt + computes SHA-512 hash
2. **Classifies** the document (affidavit, invoice, technical PDF, etc.)
3. **Invites their story**: "Tell me what's going on. I'm listening."
4. **Provides plain-language summary** of the content
5. **Shows first 1000 chars** of extracted text
6. **Offers forensic actions** (seal, anchor, scan, compare) — AFTER listening

---

## Setup

### 1. Add GitHub Secrets (optional)

- `OPENAI_API_KEY` — For smarter document summaries (uses `gpt-4o-mini`)
- If missing, bot falls back to rule-based heuristics

### 2. Workflow Permissions

Already configured in `.github/workflows/verum-commands.yml`:
- `issues: write` (to post comments)
- `contents: read` (to checkout repo)

### 3. Deploy

Just commit and push. The workflow triggers on:
- New issue comments
- New issues
- Edited issues

---

## Example Flow

**User uploads `invoice.pdf` to an issue:**

Bot replies:

```markdown
## 📎 Verum Omnis — Document Received

**File:** `invoice.pdf` • **Size:** 243.5 KB • **Type:** application/pdf
**Hash (SHA-512 first 16):** `a3f5c2e8d1b9...`

### 🧭 First look
This appears to be a **commercial invoice/receipt**.
- Producer: Adobe PDF Library 15.0
- Creator: Microsoft Word
- Created: D:20231015143022Z

### 🗣️ Tell me what's going on
Before I do anything else, tell me in your own words why you uploaded this. I'm listening.

### 🧠 Plain-language explanation
This is a commercial invoice with line items, totals, and payment instructions...

### 🔎 At-a-glance
```
INVOICE #12345
Date: October 15, 2023
Bill To: John Doe
...
```

### ➡️ What I can do next
- **Explain deeper** — say: `summarize`
- **Investigate** — say: `scan`
- **Seal** — say: `seal`
- **Anchor** — say: `anchor`

_I won't alter your source file. Seals are tamper-evident._
```

---

## Personality Rules

Based on `functions/assets/ai-personality.json` (v2):

- ✅ **Listening First** — Invites user story before offering tools
- ✅ **Direct & Conversational** — No corporate jargon
- ✅ **Plain Language** — "This looks dodgy" not "anomaly detected"
- ✅ **Cheeky but Respectful** — Calls out fraud bluntly, supports victims warmly

---

## Dependencies

- `file-type` — Magic byte detection
- `pdf-parse` — Extract text + metadata from PDFs
- `undici` — Fast HTTP client for GitHub API + OpenAI

---

## Future Enhancements

- [ ] `/seal` command → Calls Firebase function to generate sealed PDF
- [ ] `/anchor` command → Calls blockchain anchoring endpoint
- [ ] `/compare` command → Multi-document contradiction detection
- [ ] `/timeline` command → Cross-reference dates across documents
- [ ] Support DOCX, XLSX, images with OCR

---

## Philosophy

**This bot is not a receipt machine.**

It's a forensic listener that:
1. Hears your complaint
2. Reads the document
3. Explains what it sees
4. Offers tamper-proof sealing with consent

Just like Liam would handle it. 🎯
