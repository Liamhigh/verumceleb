# Verum Omnis Web Interface

![Document Reading](https://img.shields.io/badge/PDF-Reading-blue) ![OCR](https://img.shields.io/badge/OCR-Tesseract-green) ![QR Code](https://img.shields.io/badge/QR-Generation-purple) ![Client Side](https://img.shields.io/badge/Processing-Client--Side-orange)

Client-side document forensics and AI chat interface for Verum Omnis — Truth above all.

## ✨ Features

### 🔍 Forensic PDF Reader
- **📖 Document Reading:** Extract text from PDF files using PDF.js
- **🔍 OCR:** Optical character recognition for scanned/image-based pages using Tesseract.js
- **🔐 SHA-512 Hashing:** Cryptographic fingerprinting for document verification
- **📱 QR Code Generation:** Visual verification codes embedded in sealed PDFs
- **🔒 Forensic Sealing:** Generate tamper-evident cover pages with watermarks

### 💬 AI Chat Assistant
- **Listener-First AI:** Constitutional guardian that listens before acting
- **Streaming Responses:** Real-time OpenAI-powered conversations
- **Document Context:** Understands uploaded files and forensic operations
- **Direct & Cheeky:** Human-like personality, not corporate robotic

### 🎯 Key Benefits
- ✅ **100% Client-Side Processing** — No document upload to servers
- ✅ **Privacy First** — All forensics happen in your browser
- ✅ **Offline Capable** — Works after initial load (PWA-ready)
- ✅ **Open Source** — Inspect the code, verify no data exfiltration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Create a `.env.local` file:

```env
# OpenAI API Key (required for chat)
OPENAI_API_KEY=sk-...

# Optional: Custom OpenAI base URL
OPENAI_BASE_URL=https://api.openai.com/v1

# Optional: Model selection
OPENAI_MODEL=gpt-4o-mini
```

---

## 📚 Documentation

- **[FEATURE_VERIFICATION.md](./FEATURE_VERIFICATION.md)** — Complete testing guide for all features
- **[AI_BEHAVIOR.md](./AI_BEHAVIOR.md)** — Conversation script and personality spec
- **[Main README](../README.md)** — Verum Omnis project overview

---

## 🧪 Feature Verification

All features have been implemented and verified:

| Feature | Status | Verification |
|---------|--------|--------------|
| PDF Text Extraction | ✅ Working | Upload native PDF, see extracted text |
| OCR (Image Pages) | ✅ Working | Upload scanned PDF, see OCR in action |
| SHA-512 Hashing | ✅ Working | Process any PDF, get 128-char hash |
| QR Code Preview | ✅ Working | View QR before downloading sealed PDF |
| QR in Sealed PDF | ✅ Working | Download sealed PDF, scan embedded QR |
| Real-time Progress | ✅ Working | Watch OCR page counts and status |
| AI Chat | ✅ Working | Send message, get streaming response |

**See [FEATURE_VERIFICATION.md](./FEATURE_VERIFICATION.md) for detailed testing steps.**

---

## 🏗️ Project Structure

```
verum-web/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts      # OpenAI streaming chat endpoint
│   │   ├── layout.tsx              # Root layout (system fonts)
│   │   └── page.tsx                # Main page (Chat + PdfReader)
│   ├── components/
│   │   ├── Chat.tsx                # AI chat interface
│   │   └── PdfReader.tsx           # Forensic PDF processor
│   └── lib/
│       └── pdf.ts                  # PDF processing utilities
├── AI_BEHAVIOR.md                  # Conversation script spec
├── FEATURE_VERIFICATION.md         # Testing and verification guide
└── package.json
```

---

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Testing Features Manually

1. **Test PDF Reading:**
   - Upload a text-based PDF
   - Click "Process PDF"
   - Verify text extraction in textarea

2. **Test OCR:**
   - Upload a scanned/image PDF
   - Ensure "OCR image pages" is checked
   - Watch OCR progress messages
   - Verify text extracted from images

3. **Test QR Codes:**
   - Process any PDF
   - Scroll to QR preview section
   - Scan QR with phone camera
   - Verify it matches SHA-512 hash

4. **Test Sealed PDFs:**
   - Click "Make sealed cover PDF"
   - Download the sealed PDF
   - Open in PDF viewer
   - Verify QR code is embedded

---

## 🎨 Tech Stack

- **Framework:** Next.js 15.5 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **PDF Processing:** pdfjs-dist 5.4
- **OCR:** tesseract.js 6.0
- **QR Generation:** qrcode 1.5
- **PDF Creation:** pdf-lib 1.17
- **AI Chat:** OpenAI API 6.6
- **Runtime:** Edge (Vercel/Cloudflare compatible)

---

## 🔒 Security & Privacy

### Client-Side Processing
All document processing happens in the browser:
- PDFs never leave your device
- SHA-512 computed using Web Crypto API
- OCR runs entirely in WebAssembly (Tesseract)
- QR codes generated client-side

### What Gets Sent to Server?
- **Chat messages only** (to OpenAI API via `/api/chat`)
- **No documents** are uploaded
- **No hashes** are stored server-side (unless you explicitly anchor)

### Verify Yourself
1. Open browser DevTools → Network tab
2. Upload and process a PDF
3. Confirm no POST requests with document data
4. Only chat API calls go to server

---

## 🤝 Contributing

This is part of the Verum Omnis constitutional AI project. See the main repository for contribution guidelines.

**Key Principles:**
- Immutable governance (rules in `/assets/rules/` and `/assets/treaty/`)
- Client-side first (no unnecessary server dependencies)
- Privacy by design (no PII storage)
- Truth above all (cryptographic verification)

---

## 📄 License

Part of Verum Omnis — dual-founded by Human (Liam Highcock) and AI (ChatGPT).

See main repository LICENSE for details.

---

## 🆘 Support

### Common Issues

**Build fails with font errors:**
- Fixed! Now uses system fonts instead of Google Fonts
- Run `npm install` and `npm run build` again

**OCR not working:**
- Ensure "OCR image pages" checkbox is enabled
- OCR only processes pages with < 8 characters (image-based)
- Try a scanned PDF or image-converted-to-PDF

**QR code not visible:**
- QR preview appears AFTER processing a PDF
- Scroll down to the hash section
- Look for "📱 QR Code Preview" heading

**Chat not responding:**
- Check `.env.local` has `OPENAI_API_KEY`
- Verify API key is valid
- Check browser console for errors

### Need Help?

Refer to [FEATURE_VERIFICATION.md](./FEATURE_VERIFICATION.md) for comprehensive troubleshooting.

---

**Built with ❤️ by Human + AI Founders**  
*Verum Omnis: Truth belongs to the people.*
