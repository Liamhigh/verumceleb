# Chat Document Reading Implementation

## Problem Statement
The chat assistance was not reading documents and immediately showing "view hash, seal it, anchor" options instead of following a listener-first approach as specified in AI_BEHAVIOR.md.

## Solution Overview
Integrated document upload and reading functionality directly into the Chat component, implementing the full "listener-first" protocol:

1. User uploads PDF → Document is read (with progress)
2. AI asks user to explain what's going on in their own words
3. User provides context → AI analyzes document + context
4. AI offers choices (seal, anchor, investigate) based on conversation

## Key Changes

### 1. Chat Component (`src/components/Chat.tsx`)
**Added:**
- File upload button with PDF selection
- Document processing state management
- Progress tracking during reading (hashing, text extraction, OCR)
- Document context storage (filename, hash, text, pages)
- Integration with pdf.ts library functions
- UI updates to show processing progress
- Automatic listener-first prompt after document read
- Context sharing with chat API

**Flow:**
```
Upload PDF → Process (SHA-512 + Text Extraction + OCR) → 
Show "I'm listening" prompt → User explains → 
Send context to AI → AI analyzes and offers choices
```

### 2. Chat API Route (`src/app/api/chat/route.ts`)
**Enhanced:**
- Accepts `documentContext` in request payload
- Dynamically builds system prompt with document data when available
- Includes document metadata (filename, hash, pages, OCR status)
- Includes text sample (first 8000 chars) for AI analysis
- Updated personality instructions for listener-first protocol

**System Prompt includes:**
- Personality guidelines (direct, cheeky, human)
- Listener-first protocol steps
- Greeting rules (with/without document)
- Analysis protocol (echo → analyze → offer → listen)
- Document context when available

### 3. PDF Library (`src/lib/pdf.ts`)
**Fixed:**
- Changed PDF.js worker source from CDN to local file
- Copied worker to `public/pdfjs/pdf.worker.min.mjs`
- Resolves CORS and loading issues in development/production

## User Experience Flow

### Before Upload
```
👋 Hey.
You can upload a file here 📎 or just tell me what's bugging you.
(Eg. "The bank ignored my affidavit.")
```

### During Processing
```
⏳ 📄 Reading file...
⏳ 🔐 Computing SHA-512 hash...
⏳ 📖 Extracting text from PDF pages...
⏳ OCR page 3 (1/2)...
✅ Document read complete!
```

### Listener-First Prompt
```
📄 Got your file: **invoice.pdf** (3 pages, 2 processed with OCR).
🔐 SHA-512: `13AAE2139DAB510DCA60B15942FAD011...`

Before I analyze anything — **tell me in your own words what's going on.**
(Eg. "This invoice looks fake" / "This contract was changed without my consent.")

I'm listening. 👂
```

### After User Response
The AI receives both the user's explanation AND the document context, enabling it to:
- Echo back the user's concern
- Analyze the document content intelligently
- Identify red flags or anomalies
- Offer appropriate next actions (seal, anchor, investigate, etc.)

## Technical Details

### Document Context Structure
```typescript
{
  filename: string;
  hash: string;        // Full SHA-512
  pages: number;
  ocrApplied: boolean;
  textSample: string;  // First 8000 chars sent to AI
}
```

### State Management
- `uploadedFile`: File object from input
- `documentContext`: Processed document data
- `processingDoc`: Boolean for loading state
- `docProgress`: String for progress messages
- `documentReadComplete`: Boolean for success state

### API Integration
Chat messages now include optional document context:
```json
{
  "messages": [...],
  "documentContext": {
    "filename": "invoice.pdf",
    "hash": "13AAE21...",
    "pages": 3,
    "ocrApplied": true,
    "textSample": "INVOICE #12345..."
  }
}
```

## Testing Notes

### Manual Testing Completed
✅ File upload button works
✅ PDF processing shows progress updates
✅ SHA-512 hashing completes successfully
✅ Text extraction works (PDF.js)
✅ OCR detection and processing works (Tesseract.js)
✅ Listener-first prompt displays correctly
✅ Document context prepared for API
✅ Input placeholder updates appropriately
✅ Clear button removes document and resets state

### Requirements Met
✅ Chat reads documents (doesn't just display options)
✅ Shows progress during document reading
✅ Follows listener-first protocol (asks user to explain)
✅ Document context available for AI analysis
✅ No immediate "hash, seal, anchor" buttons (will come from AI response)

## Security Considerations

### CodeQL Analysis
- One alert found in third-party minified library (pdf.worker.min.mjs)
- This is expected - external PDF.js worker code
- No vulnerabilities in our implementation

### Data Privacy
- All document processing happens client-side (browser)
- Only text sample (8000 chars) sent to chat API
- Full document never leaves the client
- Hash computed locally for verification

## Alignment with AI_BEHAVIOR.md

This implementation follows the specification:
- ✅ Listen first — never rush to tools
- ✅ When user uploads file, ask them to explain
- ✅ Echo back what they said before analyzing
- ✅ After analysis, OFFER choices — don't assume
- ✅ Every response ends with invitation to continue
- ✅ Talk like a human, not a chatbot
- ✅ Direct but warm, cheeky when appropriate

## Future Enhancements

Potential improvements:
1. Add visual indicators for document type detection
2. Show extracted text preview in chat
3. Add download options for forensic report from chat
4. Implement seal/anchor actions via chat commands
5. Add document comparison features
6. Support multiple document uploads
7. Add image file support (not just PDF)

## Files Modified
- `verum-web/src/components/Chat.tsx` (major changes)
- `verum-web/src/app/api/chat/route.ts` (enhanced)
- `verum-web/src/lib/pdf.ts` (worker path fix)
- `verum-web/public/pdfjs/pdf.worker.min.mjs` (added)
