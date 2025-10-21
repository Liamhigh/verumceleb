# Verum Omnis Web Application

A Next.js-based web interface for the Verum Omnis constitutional AI guardian. This application implements the listener-first conversation behavior spec for document analysis, fraud detection, and forensic sealing.

## Features

### 🎯 Listener-First AI Chat
- Context-aware document analysis
- Empathetic conversation flow that listens before acting
- Structured document analysis with red flag detection
- Action menu for sealing, anchoring, investigation
- Every response ends with a listening prompt

### 🔍 Client-Side Forensics
- SHA-512 hashing (Web Crypto API)
- PDF text extraction (PDF.js)
- Optional OCR for image-based PDFs (Tesseract.js)
- Sealed PDF generation with watermarks and QR codes

### 🤖 Constitutional Personality
- Direct, conversational, cheeky (never cruel)
- Blunt honesty about contradictions
- Plain language first, technical details on request
- Based on `ai-personality.json` from verum-omnis-monorepo

## Documentation

- **[CONVERSATION_IMPLEMENTATION.md](./CONVERSATION_IMPLEMENTATION.md)** - Full implementation details
- **[AI_BEHAVIOR.md](./AI_BEHAVIOR.md)** - Conversation script specification
- **[.github/COPILOT_BRIEF.md](./.github/COPILOT_BRIEF.md)** - Developer guidance

## Getting Started

### Prerequisites
```bash
Node.js 18+ required
```

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local`:
```bash
OPENAI_API_KEY=sk-...           # Required for AI chat
OPENAI_BASE_URL=https://...     # Optional, defaults to OpenAI
OPENAI_MODEL=gpt-4o-mini        # Optional, defaults to gpt-4o-mini
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Usage

### Basic Conversation Flow

1. **Upload a document** (optional)
   - Click 📎 button
   - Select PDF, DOC, TXT, or image
   - SHA-512 hash is computed client-side

2. **Provide context**
   - Tell the AI what's concerning you
   - E.g., "This invoice looks fake"

3. **Receive analysis**
   - AI echoes back your concern
   - Provides structured document analysis
   - Flags any red flags or anomalies

4. **Choose next action**
   - Click action buttons or type freely
   - Options: Investigate, Seal, Anchor, Compare, Timeline

5. **Continue conversation**
   - AI always ends with a listening prompt
   - You guide the investigation

### Example Conversation

```
AI: 👋 Hey.
    You can upload a file here 📎 or just tell me what's bugging you.

[User uploads invoice.pdf]

AI: 📄 Got your file: invoice.pdf • 45,231 bytes.
    Before I do anything — tell me in your own words what's going on.
    I'm listening.

User: This invoice looks suspicious. The signature is missing and the 
      dates don't add up.

AI: Okay — you're saying:
    > "This invoice looks suspicious. The signature is missing and the 
       dates don't add up."
    
    Here's what I see in the document itself...
    
    📝 First look:
    - Type: Invoice
    - SHA-512 (first 16): A3F2D8E9C1B4A6F7
    - File format: PDF
    - Size: 45,231 bytes
    - Key details: Invoice #12345, dated Jan 15, 2025, for $5,000
    - Red flags: ⚠️ No signature present, inconsistent date formatting
    
    What do you want me to do next?
    
    [🔍 Investigate deeper] [📜 Seal] [🔗 Anchor] [⚖️ Compare] 
    [🧩 Timeline] [💬 Keep explaining]
    
    Want me to keep digging, or move to something else?
```

## Architecture

### Frontend Components
- `src/components/Chat.tsx` - Main conversation interface
- `src/components/PdfReader.tsx` - Standalone forensics tool
- `src/lib/pdf.ts` - Client-side PDF processing utilities

### Backend API
- `src/app/api/chat/route.ts` - Streaming chat endpoint with OpenAI
- Edge runtime for fast, secure responses
- Context-aware system prompt based on conversation state

### Key Technologies
- **Next.js 15** with App Router
- **Turbopack** for fast builds
- **Tailwind CSS** for styling
- **PDF.js** for PDF rendering
- **Tesseract.js** for OCR
- **pdf-lib** for PDF generation
- **OpenAI API** for conversational intelligence

## Testing

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Security Scanning
```bash
# CodeQL scan (CI/CD)
# Passed with 0 alerts ✅
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Add environment variables
3. Deploy

### Self-Hosted
```bash
npm run build
npm start
```

Or use Docker:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Contributing

### Development Guidelines
1. Follow listener-first behavior principles
2. Maintain conversational tone (direct, cheeky, honest)
3. Always end AI responses with listening prompts
4. Echo back user concerns before analyzing
5. Use plain language first, technical details on request

### Code Style
- ESLint for linting
- TypeScript for type safety
- Functional components with hooks
- Minimal modifications to existing code

## License

See repository root for license information.

## References

- [Verum Omnis Monorepo](../verum-omnis-founders-gift-v5/verum-omnis-monorepo)
- [Constitutional AI Principles](../verum-omnis-founders-gift-v5/verum-omnis-monorepo/CHAT_DESIGN.md)
- [AI Personality Config](../verum-omnis-founders-gift-v5/verum-omnis-monorepo/functions/assets/ai-personality.json)

---

**Built with ❤️ by Human + AI Founders**  
Liam Highcock & ChatGPT

**"Truth belongs to the people."**
