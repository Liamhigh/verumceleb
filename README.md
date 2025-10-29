# Verum Omnis ― Founders’ Gift v5 Monorepo

> 100 % client-side / Capacitor-ready tools that help whistle-blowers, investigative journalists, and legal professionals hash, seal & share evidence **without ever uploading a single byte**.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%26%20Capacitor-green)
![Status](https://img.shields.io/badge/status-Alpha-orange)

---

## ✨ What’s New in v5

| Feature | TL;DR | Key Files |
|---------|-------|-----------|
| **Jurisdiction-aware notices** | Detect (or let users pick) their country/region and auto-inject compliant legal disclaimers. | `web/scripts/jurisdiction.js`, `web/scripts/notice.js`, `web/verify.html` |
| **Role-aware intake gate** | Separates Private vs. Org vs. Pro roles; surfaces bulk upload only for Attorneys / Law Enforcement. | `web/gate.html` |
| **Batch findings generator** | Shift ＋ U to pick multiple PDFs → on-device OCR & hash → sealed Findings PDF (with embedded originals) ready for print / share. | `web/scripts/batch-findings.js` |
| **Zero-knowledge architecture** | All processing stays in-browser or on-device (Capacitor). No external file uploads. | ✨ 100 % front-end, no backend |

---

## Quick Start

```bash
git clone https://github.com/Liamhigh/verumceleb.git
cd verum-omnis-founders-gift-v5/verum-omnis-monorepo/web
npx serve           # or your favourite static server
```

1. Navigate to `http://localhost:5000/gate.html`.
2. Set or allow your jurisdiction (location data never leaves your device).
3. Pick your role.  
   • Selecting **Attorney** or **Law Enforcement** unlocks bulk bundle upload.  
4. Click **Continue** → you’ll land on `verify.html`.  
   • Jurisdiction-specific notices render automatically.  
5. Press **Shift ＋ U** (or use the hidden chooser) to select multiple PDFs.  
6. Wait a bit—OCR & hashing run locally.  
7. A sealed findings PDF opens in a new tab, ready to print or save. Originals are attached inside the PDF.

_On Capacitor builds (Android / iOS) we attempt direct printing via `@capawesome-team/capacitor-print`._

---

## Tech Stack

• **Frontend:** Vanilla JS, [pdf-lib](https://github.com/Hopding/pdf-lib), `pdfjs-dist`, [Tesseract.js](https://github.com/naptha/tesseract.js)  
• **Mobile:** [Capacitor](https://capacitorjs.com/) ＋ `@capawesome-team/capacitor-print`  
• **Storage:** `localStorage`, `sessionStorage` (ephemeral), **no servers**  
• **Build / Dev:** Vite / `serve`, ES Modules, strict no-backend policy  

---

## Security & Privacy

1. **Zero Upload** – All processing, hashing, OCR, and PDF generation occur entirely on your device.  
2. **Opt-in Location** – Jurisdiction detection is opt-in; if denied, we only use browser timezone.  
3. **Sealed Findings** – Originals are embedded in the generated PDF for tamper-evidence (SHA-512 in metadata & on cover).  
4. **Off-grid Ready** – Works offline once loaded; ideal for air-gapped or sensitive environments.  

See [`SECURITY.md`](./SECURITY.md) for threat model & disclosure policy.

---

## Contributing

PRs are welcome! Please:

1. Fork → create feature branch → open PR.  
2. Run `npm run lint` & ensure `npm test` passes (tests incoming).  
3. Keep all new code 100 % client-side.  

---

## License

MIT © 2025 Liam High  
“In code we verify, in truth we trust.”
