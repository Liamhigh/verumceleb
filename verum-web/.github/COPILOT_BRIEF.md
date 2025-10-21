# Copilot Brief — Verum Web (MVP)

## Goals
- Build a Next.js 14 App Router site with:
  1) **Chat** that behaves like ChatGPT (streaming, markdown, code blocks).
  2) **PDF Reader**: client-side text extraction via PDF.js and optional OCR via Tesseract.js.
  3) **Forensic bits**: SHA-512 hash of raw file bytes, JSON report, optional "sealed cover" PDF with hash + timestamp + QR (pdf-lib).
  4) Simple, clean UI using Tailwind; responsive; dark mode friendly.

## Constraints
- No server required for PDF parsing; do it in the browser.
- Chat hits OpenAI-compatible API via a Next.js route (`/api/chat`) with streaming (SSE).
- Keep components small and testable. TypeScript everywhere.
- Add basic e2e acceptance checklist and a smoke test page.

## Pages & Components
- `/` → Home with two tabs: **Chat** and **Forensics**.
- `components/Chat.tsx` → chat UI (streaming, role bubbles).
- `components/PdfReader.tsx` → dropzone + preview + buttons (hash/report/cover).
- `lib/pdf.ts` → helpers: extract text (PDF.js), optional OCR for image pages (Tesseract).
- `lib/forensic.ts` → SHA-512, sealed cover PDF, QR.
- `app/api/chat/route.ts` → POST handler using OpenAI-compatible API; stream back tokens.

## Acceptance
- Upload any real PDF: text appears; SHA-512 displayed; JSON + cover PDF downloadable.
- Chat accepts a prompt and streams tokens in < 2s on a warm run.
- Lighthouse: no major accessibility errors.
- Mobile layout works.

## Style
- Minimal, modern; Tailwind; no CSS frameworks beyond Tailwind.
- Error states and loading spinners included.

## Nice-to-have
- Toggle OCR on/off.
- Model selector in chat (env-driven).
- Simple telemetry console.log; no PII.

## Deliverables
- Compiles with `npm run dev`.
- `npm run build` passes.
- Deployed to Cloudflare Pages or Vercel.
