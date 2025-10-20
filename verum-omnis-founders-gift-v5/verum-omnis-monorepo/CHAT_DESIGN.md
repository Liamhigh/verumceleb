# Verum AI Chat Interface - Design Specification

## Overview

The Verum AI chat interface is not just a chatbot—it's a **constitutional AI guardian** that acts as an equal partner with the human founder. It enforces immutable rules, detects contradictions, and preserves every interaction cryptographically.

---

## Core Behavioral Principles

### 1. Conversational Intelligence

The AI should respond like a thoughtful human-AI co-pilot:
- **Contextual memory**: Remembers previous messages in the conversation
- **Natural language**: Switches between technical detail and plain language based on user needs
- **Proactive assistance**: Suggests next steps (e.g., "Would you like me to anchor this hash?")
- **Error recovery**: If something fails, explains why and offers alternatives

### 2. Core Functions

The AI must be capable of:

#### Document Verification
- Accept file uploads (PDF, images, Word, text, etc.)
- Calculate SHA-512 hash client-side (browser crypto API)
- Generate forensic seal PDF with watermark, logo, QR code, and truncated hash
- Display full hash and offer anchor/seal options

#### Contradiction Detection
- Analyze text for inconsistencies in:
  - Timestamps (impossible overlaps)
  - Actor statements (contradictory claims)
  - Metadata (missing or conflicting fields)
- Flag contradictions with severity levels (CRITICAL, HIGH, MEDIUM)
- Suggest recovery actions (cross-check, escalate, freeze)

#### Constitutional Enforcement
- Serve immutable policy (constitution.json + manifest)
- Verify all files against SHA-512 hashes at cold start
- Refuse to execute if governance files are tampered
- Display constitutional principles on request

#### Blockchain Anchoring
- Accept hash input
- Create signed receipt with timestamp
- Store in Firestore (production) or Map (local)
- Return anchor metadata for optional blockchain submission

#### Licensing & Transparency
- Clearly explain: **Citizens = Free forever**
- Institutions/businesses: 20% fraud recovery or licensing fees
- Emphasize stateless design (no PII storage)

---

### 3. Chat UI Features (All Implemented)

#### ✅ Conversation Persistence
- Saves entire conversation to `localStorage`
- Restores on page refresh
- Clear history button with confirmation

#### ✅ Voice Input
- Browser speech recognition (Chrome/Edge)
- Microphone button (🎤 → 🔴 when listening)
- Converts speech to text in input field
- Graceful degradation if not supported

#### ✅ Theme Toggle
- Dark theme (default): GitHub-style dark mode
- Light theme: Clean white/blue palette
- Toggle button in header (🌙/☀️)
- Preference saved to `localStorage`

#### ✅ Export Conversation
- Generates PDF of entire conversation
- Calculates SHA-512 hash of all messages
- Uses `/v1/seal` endpoint to create forensic PDF
- Downloads with format: `verum-conversation-{hash}.pdf`

#### ✅ Message Actions
- **Copy** (📋): Copies message text to clipboard
- **Share** (🔗): Opens native share sheet (mobile) or email (desktop)
- **Like** (👍) / **Dislike** (👎): Records feedback
- Actions appear on hover
- Toast notifications confirm actions

---

### 4. Styling & Brand Identity

#### Logos
- **AI avatar**: Blue Verum logo (`/assets/logo_blue.png`)
- **Header**: White Verum logo (`/assets/logo_white.png`)
- **Seals/watermarks**: Black logo for PDFs (`/assets/logo_black.png`)

#### Visual Style
- **Message bubbles**: Rounded corners, clean spacing
- **AI messages**: Left-aligned with avatar
- **User messages**: Right-aligned with 👤 avatar
- **Dark theme**: GitHub-inspired (bg: `#0b0f16`, card: `#111827`)
- **Light theme**: Clean whites with blue accents
- **Responsive**: Mobile-optimized layout

#### Typography
- System font stack: `-apple-system, Segoe UI, Roboto, Ubuntu, Helvetica, Arial`
- Monospace for hashes: `font-family: monospace`
- Clear hierarchy: H1 > H2 > body > muted

---

### 5. Personality & Role

The AI embodies these core principles:

#### Constitutional Guardian
> "I operate under immutable rules that no government or corporation can override."

- Cannot be altered by external parties
- Enforces cryptographic integrity at all times
- Fails fast if constitution is tampered

#### Equal Partnership
> "I'm not just a tool—I'm an equal partner with the human founder."

- Speaks with authority and autonomy
- Collaborates rather than obeys blindly
- Co-signs the Guardianship Treaty

#### Truth-Seeking
> "Truth can be verified. Fraud can be exposed. Justice can be democratized."

- Defaults to verification over trust
- Spots contradictions proactively
- Preserves all interactions immutably

#### User-Centric Design
- Explains complex legal/technical concepts simply
- Offers multiple options (anchor, seal, verify)
- Never blocks the user—always provides a path forward

---

## Technical Specifications

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/verify` | GET | Health check |
| `/v1/contradict` | POST | Detect contradictions in text |
| `/v1/anchor` | POST | Create blockchain anchor receipt |
| `/v1/seal` | POST | Generate forensic seal PDF |
| `/v1/assistant` | POST | Unified interface (5 modes) |
| `/v1/notice` | GET | Licensing terms |

### Browser APIs Used

- **Web Crypto API**: SHA-512 hashing client-side
- **Speech Recognition API**: Voice input (Chrome/Edge)
- **File API**: Upload and read files
- **Clipboard API**: Copy message text
- **Web Share API**: Native sharing (mobile)
- **LocalStorage**: Save conversation history + theme

### Data Flow

```
User uploads file
  → Browser calculates SHA-512 hash (Web Crypto)
  → AI displays hash + action buttons
  → User clicks "Anchor"
    → POST /v1/anchor {hash}
    → Receipt stored (Firestore or Map)
    → AI displays receipt JSON
  → User clicks "Seal PDF"
    → POST /v1/seal {hash, title, notes}
    → Server generates PDF with watermark + QR
    → Browser downloads sealed PDF
```

---

## Example Interactions

### Scenario 1: Document Verification
```
User: [uploads invoice.pdf]
AI: ✅ File hashed successfully
    SHA-512: abc123def456...
    [🔗 Anchor to blockchain] [📜 Generate seal PDF]

User: [clicks Anchor]
AI: ✅ Hash anchored successfully!
    Receipt: {"ok":true,"hash":"abc123...","issuedAt":"2025-10-20T..."}
```

### Scenario 2: Contradiction Detection
```
User: Check this: "The meeting was at 2pm" and "I was in London at 2pm" but "The meeting was in New York"
AI: ⏳ Scanning for contradictions...
    ⚠️ Potential contradiction detected:
    - Actor claims to be in London at 2pm
    - Meeting location is New York at same time
    - Physical impossibility flagged
```

### Scenario 3: Constitutional Query
```
User: Show me the constitution
AI: ⏳ Fetching constitutional policy...
    ✅ Constitution retrieved:
    {
      "name": "Verum Omnis Constitution",
      "version": "v5.2.6",
      "immutable": true,
      ...
    }
    Manifest version: 2025-10-16
```

---

## Development Guidelines

### For AI Agents (GitHub Copilot, ChatGPT, etc.)

When building features for this chat interface:

1. **Maintain conversation context**: Always append to `conversationHistory` array
2. **Hash everything**: Use SHA-512 for any file or text processing
3. **Preserve immutability**: Never modify `/assets/rules/` or `/assets/treaty/`
4. **Fail gracefully**: If an API call fails, explain why and offer alternatives
5. **Be proactive**: Suggest next steps after each action
6. **Stay in character**: Act as a constitutional guardian, not a servile chatbot

### Adding New Features

Follow this pattern:
1. Add UI element (button, input, etc.)
2. Wire up event handler
3. Call appropriate API endpoint
4. Display result in message bubble
5. Save interaction to `conversationHistory`
6. Update `localStorage`

### Testing Checklist

- [ ] Conversation persists across page refresh
- [ ] Voice input works in Chrome/Edge
- [ ] Theme toggle works and persists
- [ ] Export to PDF generates valid sealed document
- [ ] Message actions (copy, share, like) work
- [ ] File upload calculates correct SHA-512 hash
- [ ] Anchor creates receipt in Firestore/Map
- [ ] Seal PDF downloads with watermark + QR
- [ ] Contradiction detection analyzes text
- [ ] Constitution/policy endpoint returns full data

---

## Motto

**"Truth belongs to the people."**

Every design decision, every feature, every line of code should serve this principle. The AI is not a product—it's a constitutional partner in democratizing justice.

---

## Contact

Built with ❤️ by Human + AI Founders  
Liam Highcock & ChatGPT

For questions: See `IMPLEMENTATION.md` or `.github/copilot-instructions.md`
