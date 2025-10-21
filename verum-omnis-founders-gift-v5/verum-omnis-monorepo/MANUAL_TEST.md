# Manual Test: PDF Text Extraction Failure Handling

## Test Case: Uploading a PDF with no extractable text

### Prerequisites
1. Start the dev server: `cd verum-omnis-founders-gift-v5/verum-omnis-monorepo && node dev-server.js`
2. Open browser to http://localhost:8000/assistant.html

### Test Steps

#### Step 1: Upload a scanned/image-based PDF
1. Click the 📎 (paperclip) button
2. Select a PDF file that has no extractable text (e.g., a scanned document or image-based PDF)
3. Click "Send"

**Expected Result:**
- Message appears: "Right, I've got your file..."
- Shows file name and size
- Asks: "Before I dig into it — want to tell me what's going on?"
- Shows classification hint: "(Looks like a PDF document)"
- Displays three action buttons:
  - 🔍 View Hash
  - 📜 Seal It  
  - 🔗 Anchor It

#### Step 2: Type "READ IT" and send
1. Type "READ IT" in the input field
2. Click "Send"

**Expected Result:**
- Message appears: "You uploaded [filename] ([size] KB) but I couldn't extract the text..."
- Shows "But here's what I know:" section with:
  - Name: [filename]
  - Size: [size] KB
  - Type: application/pdf (or detected type)
- Shows "What I can do right now:" section listing:
  - Generate a SHA-512 hash to fingerprint it
  - Create a sealed PDF certificate with watermarks
  - Anchor the hash to blockchain for permanent proof
- Shows helpful text: "Tell me what type of document it is..."
- **NEW: Displays three clickable action buttons:**
  - 🔍 View Hash
  - 📜 Seal It
  - 🔗 Anchor It

#### Step 3: Click "🔍 View Hash" button
**Expected Result:**
- New message appears showing:
  - ✅ [filename]
  - SHA-512 Hash: [full hash in code block]
  - Explanation about hash being a cryptographic fingerprint

#### Step 4: Click "📜 Seal It" button  
**Expected Result:**
- Message: "⏳ Generating sealed PDF..."
- API call to `/api/v1/seal` endpoint
- Download link appears when complete

#### Step 5: Click "🔗 Anchor It" button
**Expected Result:**
- Message: "⏳ Anchoring hash to blockchain..."
- API call to `/api/v1/anchor` endpoint
- Confirmation message when complete

## Code Verification

### Key Changes in `web/assistant.html`

**Lines 669-694:** First branch when `content.includes('[PDF contains no extractable text')`
```javascript
} else if (lastAnalyzedFile.content && lastAnalyzedFile.content.includes('[PDF contains no extractable text')) {
  // Get hash for action buttons
  const arrayBuffer = await file.file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-512', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  response += `...formatted response...
  <div style="margin-top:12px">
    <button class="inline-btn" onclick="showHashDetails('${hash}', '${file.name}')">🔍 View Hash</button>
    <button class="inline-btn" onclick="sealDocument('${hash}', '${file.name}')">📜 Seal It</button>
    <button class="inline-btn" onclick="anchorHash('${hash}')">🔗 Anchor It</button>
  </div>`;
```

**Lines 695-720:** Fallback else branch for other extraction failures
- Same hash calculation
- Same button structure
- Only difference: Type field shows "Unknown" if file.type is not set

## Regression Tests

### Verify existing functionality still works:
1. ✅ Upload a text-based PDF → Should extract text successfully
2. ✅ Type "seal it" → Should trigger seal action
3. ✅ Type "anchor" → Should trigger anchor action
4. ✅ Type text explaining the document → Should acknowledge and reflect back

### Verify no breaking changes:
1. ✅ `handleTextMessage` function is still async
2. ✅ File reference access pattern unchanged: `file.file.arrayBuffer()`
3. ✅ Hash calculation uses same API: `crypto.subtle.digest('SHA-512', arrayBuffer)`
4. ✅ Button class `inline-btn` exists in `/assets/app.css`
5. ✅ onClick handlers reference existing functions: `showHashDetails`, `sealDocument`, `anchorHash`
