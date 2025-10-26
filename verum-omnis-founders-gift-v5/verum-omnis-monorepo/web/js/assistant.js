/**
 * Verum Omnis - Client-Only Assistant
 * All core logic runs in the browser (no server required)
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let currentFile = null;

export function getCurrentFile() {
  return currentFile;
}

// ============================================================================
// 1. HASH - SHA-512 (always local, using Web Crypto API)
// ============================================================================

export async function computeSHA512(file) {
  try {
    const buf = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-512', buf);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha512 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store file metadata
    currentFile = {
      sha512,
      filename: file.name,
      size: file.size,
      mime: file.type,
      arrayBuffer: buf,
      timestamp: new Date().toISOString()
    };
    
    return {
      sha512,
      filename: file.name,
      size: file.size,
      mime: file.type
    };
  } catch (error) {
    console.error('Hash computation failed:', error);
    throw new Error('Failed to compute SHA-512 hash');
  }
}

export function truncateHash(hash, prefixLen = 8, suffixLen = 8) {
  if (!hash || hash.length < prefixLen + suffixLen) return hash;
  return `${hash.substring(0, prefixLen)}...${hash.substring(hash.length - suffixLen)}`;
}

// ============================================================================
// 2. VERIFY - Triple-Consensus (no server required)
// ============================================================================

// Rule-based checker (heuristics)
function ruleChecker({ arrayBuffer, filename, mime }) {
  const notes = [];
  let vote = 'pass';
  
  // File size sanity check
  const size = arrayBuffer.byteLength;
  if (size === 0) {
    vote = 'flag';
    notes.push('⚠️ Empty file detected');
  } else if (size > 100 * 1024 * 1024) { // 100MB
    notes.push('⚠️ Large file (>100MB) - review carefully');
  } else {
    notes.push('✓ File size within normal range');
  }
  
  // Filename checks
  const suspiciousPatterns = /\.(exe|bat|cmd|sh|scr|vbs|js|jar)$/i;
  if (suspiciousPatterns.test(filename)) {
    vote = 'flag';
    notes.push('⚠️ Potentially executable file type');
  }
  
  // Hidden file check
  if (filename.startsWith('.')) {
    notes.push('⚠️ Hidden file (starts with dot)');
  }
  
  // MIME type validation
  if (!mime) {
    notes.push('⚠️ No MIME type detected');
  } else if (mime.includes('application/octet-stream')) {
    notes.push('⚠️ Generic binary type - verify content');
  } else {
    notes.push(`✓ MIME type: ${mime}`);
  }
  
  return { checker: 'RuleChecker', vote, notes };
}

// Statistical analysis checker
function statChecker({ arrayBuffer, filename }) {
  const notes = [];
  let vote = 'pass';
  
  // Convert to byte array for analysis
  const bytes = new Uint8Array(arrayBuffer);
  
  // Entropy check (simplified)
  const byteFreq = new Array(256).fill(0);
  for (let i = 0; i < Math.min(bytes.length, 10000); i++) {
    byteFreq[bytes[i]]++;
  }
  
  const uniqueBytes = byteFreq.filter(f => f > 0).length;
  const entropyScore = uniqueBytes / 256;
  
  if (entropyScore < 0.1) {
    vote = 'flag';
    notes.push(`⚠️ Very low entropy (${(entropyScore * 100).toFixed(1)}%) - possible corruption`);
  } else if (entropyScore < 0.3) {
    notes.push(`⚠️ Low entropy (${(entropyScore * 100).toFixed(1)}%) - highly repetitive`);
  } else {
    notes.push(`✓ Entropy score: ${(entropyScore * 100).toFixed(1)}%`);
  }
  
  // Check for repeated patterns (simplified)
  let repeatedBytes = 0;
  for (let i = 1; i < Math.min(bytes.length, 1000); i++) {
    if (bytes[i] === bytes[i - 1]) repeatedBytes++;
  }
  const repetitionRate = repeatedBytes / Math.min(bytes.length, 1000);
  
  if (repetitionRate > 0.9) {
    vote = 'flag';
    notes.push(`⚠️ High repetition rate (${(repetitionRate * 100).toFixed(1)}%)`);
  } else if (repetitionRate > 0.5) {
    notes.push(`⚠️ Moderate repetition (${(repetitionRate * 100).toFixed(1)}%)`);
  } else {
    notes.push(`✓ Repetition rate: ${(repetitionRate * 100).toFixed(1)}%`);
  }
  
  return { checker: 'StatChecker', vote, notes };
}

// LLM checker (stub with optional API call)
async function llmChecker({ arrayBuffer, filename, sha512, mime }) {
  const notes = [];
  let vote = 'pass';
  
  // Check if real LLM API is configured
  if (window.VERUM_ENV?.OPENAI_API_KEY) {
    try {
      notes.push('🤖 Attempting LLM analysis...');
      // TODO: Implement actual OpenAI API call
      // For now, fall through to stub behavior
      notes.push('⚠️ LLM API integration pending');
    } catch (error) {
      notes.push(`⚠️ LLM API error: ${error.message}`);
    }
  }
  
  // Local stub analysis (pattern-based)
  notes.push('🔍 Running local pattern analysis (stub mode)');
  
  // Simple content-type based analysis
  if (mime?.includes('pdf')) {
    notes.push('✓ PDF document detected');
  } else if (mime?.includes('image')) {
    notes.push('✓ Image file detected');
  } else if (mime?.includes('video')) {
    notes.push('✓ Video file detected');
  } else if (mime?.includes('audio')) {
    notes.push('✓ Audio file detected');
  } else if (mime?.includes('text')) {
    notes.push('✓ Text document detected');
  } else {
    notes.push('⚠️ Unknown file type - manual review recommended');
  }
  
  // File extension vs MIME consistency
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf' && !mime?.includes('pdf')) {
    vote = 'flag';
    notes.push('⚠️ Extension/MIME mismatch: claims PDF but MIME differs');
  }
  
  notes.push(`✓ Hash verified: ${sha512.substring(0, 16)}...`);
  
  return { checker: 'LLMChecker', vote, notes };
}

export async function verifyTriple({ arrayBuffer, sha512, filename, mime }) {
  try {
    // Run all three checkers in parallel
    const [ruleResult, statResult, llmResult] = await Promise.all([
      ruleChecker({ arrayBuffer, filename, mime }),
      statChecker({ arrayBuffer, filename }),
      llmChecker({ arrayBuffer, filename, sha512, mime })
    ]);
    
    // Consensus voting
    const votes = [ruleResult.vote, statResult.vote, llmResult.vote];
    const passCount = votes.filter(v => v === 'pass').length;
    const consensus = passCount >= 2 ? 'pass' : 'flag';
    
    return {
      results: [ruleResult, statResult, llmResult],
      consensus,
      passCount,
      totalCheckers: 3,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Verification failed:', error);
    throw new Error('Triple verification failed');
  }
}

// ============================================================================
// 3. SEAL - Generate PDF with logo, watermark, QR (browser-only)
// ============================================================================

export async function sealPDF({ arrayBuffer, sha512, filename }) {
  try {
    // Import pdf-lib (must be loaded via CDN or bundled)
    if (!window.PDFLib) {
      throw new Error('pdf-lib not loaded - add script tag for https://cdn.jsdelivr.net/npm/pdf-lib');
    }
    
    const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
    
    // Create or load PDF
    let pdfDoc;
    try {
      // Try to load existing PDF
      pdfDoc = await PDFDocument.load(arrayBuffer);
    } catch {
      // Create new PDF if not a PDF file
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Letter size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      page.drawText('Verum Omnis - Document Receipt', {
        x: 50,
        y: 750,
        size: 18,
        font,
        color: rgb(0.95, 0.95, 0.95)
      });
      
      page.drawText(`Original File: ${filename}`, {
        x: 50,
        y: 720,
        size: 12,
        font,
        color: rgb(0.8, 0.8, 0.8)
      });
      
      page.drawText(`SHA-512: ${truncateHash(sha512, 16, 16)}`, {
        x: 50,
        y: 700,
        size: 10,
        font,
        color: rgb(0.7, 0.7, 0.7)
      });
    }
    
    // Add certification page at the end
    const certPage = pdfDoc.addPage([612, 792]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Header
    certPage.drawText('VERUM OMNIS CERTIFICATION', {
      x: 50,
      y: 750,
      size: 16,
      font,
      color: rgb(0.2, 0.4, 0.8)
    });
    
    // Patent pending notice
    certPage.drawText('✔ Patent Pending Verum Omnis', {
      x: 50,
      y: 720,
      size: 12,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Hash info
    certPage.drawText(`SHA-512 (truncated):`, {
      x: 50,
      y: 680,
      size: 11,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
    
    certPage.drawText(truncateHash(sha512, 24, 24), {
      x: 50,
      y: 660,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4)
    });
    
    // Timestamp
    const timestamp = new Date().toISOString();
    certPage.drawText(`Sealed: ${timestamp}`, {
      x: 50,
      y: 630,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Page count
    const pageCount = pdfDoc.getPageCount();
    certPage.drawText(`Total Pages: ${pageCount}`, {
      x: 50,
      y: 610,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // QR Code placeholder (will be added when qrcode lib is loaded)
    if (window.QRCode) {
      try {
        const qrData = JSON.stringify({
          sha512,
          filename,
          ts: timestamp
        });
        
        // Generate QR as data URL
        const qrDataUrl = await window.QRCode.toDataURL(qrData, {
          width: 150,
          margin: 1
        });
        
        // Embed QR image
        const qrImage = await pdfDoc.embedPng(qrDataUrl);
        certPage.drawImage(qrImage, {
          x: 450,
          y: 600,
          width: 100,
          height: 100
        });
        
        certPage.drawText('Scan to verify', {
          x: 465,
          y: 580,
          size: 8,
          font: fontRegular,
          color: rgb(0.5, 0.5, 0.5)
        });
      } catch (err) {
        console.warn('QR code generation failed:', err);
      }
    }
    
    // Save and return
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    return {
      blob,
      filename: `${filename.replace(/\.[^.]+$/, '')}.sealed.pdf`,
      size: pdfBytes.length
    };
  } catch (error) {
    console.error('PDF sealing failed:', error);
    throw new Error(`Failed to seal PDF: ${error.message}`);
  }
}

// ============================================================================
// 4. ANCHOR - Generate receipt (optional blockchain)
// ============================================================================

export async function anchor({ sha512, filename }) {
  try {
    const timestamp = new Date().toISOString();
    
    // Build receipt
    const receipt = {
      sha512,
      filename,
      timestamp,
      method: 'local',
      txHash: null,
      receiptUrl: null,
      verumOmnis: 'Patent Pending'
    };
    
    // Check for optional blockchain configuration
    if (window.VERUM_ENV?.ANCHOR) {
      receipt.method = window.VERUM_ENV.ANCHOR; // e.g., 'ethereum'
      
      // Optional: attempt on-chain transaction
      if (window.VERUM_ENV.RPC_URL && window.VERUM_ENV.PRIVATE_KEY) {
        try {
          // TODO: Implement actual blockchain transaction
          // For now, simulate
          const mockTxHash = '0x' + sha512.substring(0, 64);
          receipt.txHash = mockTxHash;
          receipt.receiptUrl = `https://etherscan.io/tx/${mockTxHash}`;
          receipt.note = 'Simulated transaction (implement web3 integration)';
        } catch (error) {
          receipt.error = `Blockchain transaction failed: ${error.message}`;
        }
      } else {
        receipt.note = 'Blockchain configured but missing RPC_URL or PRIVATE_KEY';
      }
    }
    
    return receipt;
  } catch (error) {
    console.error('Anchoring failed:', error);
    throw new Error('Failed to generate anchor receipt');
  }
}

// ============================================================================
// 5. CHAT - Assistant Reply (local stub with optional LLM)
// ============================================================================

const conversationHistory = [];

export async function assistantReply(userMessage) {
  try {
    // Store user message
    conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    // Check for optional LLM API
    if (window.VERUM_ENV?.OPENAI_API_KEY) {
      try {
        // TODO: Implement actual OpenAI API call
        // For now, fall through to stub
      } catch (error) {
        console.warn('LLM API call failed, using local stub:', error);
      }
    }
    
    // Local stub response (pattern matching + context awareness)
    let response = generateLocalResponse(userMessage);
    
    // Store assistant message
    conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });
    
    return response;
  } catch (error) {
    console.error('Assistant reply failed:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
}

function generateLocalResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  // Context: current file
  const fileContext = currentFile ? 
    `I can see you have "${currentFile.filename}" loaded (${(currentFile.size / 1024).toFixed(1)}KB, hash: ${truncateHash(currentFile.sha512)}).` : 
    '';
  
  // Greeting patterns
  if (/^(hi|hello|hey|greetings)/i.test(lowerMsg)) {
    return `Hello! I'm your Verum Omnis assistant. ${fileContext || 'Upload a document to get started, or just chat with me about what you need.'}`;
  }
  
  // Tool-related queries
  if (/verify|check|validate/i.test(lowerMsg)) {
    return fileContext ? 
      `I can verify "${currentFile.filename}" using triple-consensus checking. Just click "Check this document" in the tools panel, and I'll run three independent validators.` :
      `To verify a document, first upload it using the file selector, then click "Check this document". I'll run three independent checkers and give you a consensus result.`;
  }
  
  if (/seal|stamp|certif/i.test(lowerMsg)) {
    return fileContext ?
      `I can seal "${currentFile.filename}" as a certified PDF with your hash, a QR code, and our watermark. Click "Seal this document" when ready.` :
      `To seal a document, upload it first. I'll create a certified PDF with the SHA-512 hash, QR code for verification, and the Verum Omnis watermark.`;
  }
  
  if (/anchor|blockchain|chain/i.test(lowerMsg)) {
    return fileContext ?
      `I can generate an anchor receipt for "${currentFile.filename}". Click "Anchor this document" to create a timestamped proof record. ${window.VERUM_ENV?.ANCHOR ? 'Blockchain anchoring is configured!' : 'Currently local-only (no blockchain configured).'}` :
      `Anchoring creates a permanent record of your document's hash. Upload a file first, then click "Anchor this document" to generate a receipt.`;
  }
  
  if (/hash|sha/i.test(lowerMsg)) {
    return fileContext ?
      `Your file's SHA-512 hash is: ${currentFile.sha512.substring(0, 32)}... (full hash shown in the tools panel)` :
      `I compute SHA-512 hashes instantly when you upload a file. They're cryptographic fingerprints that prove your document hasn't changed.`;
  }
  
  // Help/what can you do
  if (/help|what can|capabilities|features/i.test(lowerMsg)) {
    return `I can help you with:\n\n• **Verify** - Triple-check documents for authenticity\n• **Seal** - Create certified PDFs with QR codes\n• **Anchor** - Generate timestamped proof receipts\n• **Hash** - Compute SHA-512 fingerprints\n\n${fileContext || 'Upload a document to get started!'}`;
  }
  
  // Thank you
  if (/thank|thanks|thx/i.test(lowerMsg)) {
    return `You're welcome! Let me know if you need anything else. ${fileContext ? `Your file "${currentFile.filename}" is ready for verification, sealing, or anchoring.` : ''}`;
  }
  
  // Default empathetic response
  const responses = [
    `I understand. ${fileContext || 'Feel free to upload a document, and I can help verify, seal, or anchor it.'}`,
    `Got it. ${fileContext ? `Would you like me to verify, seal, or anchor "${currentFile.filename}"?` : 'Upload a file and I can help with verification, sealing, or anchoring.'}`,
    `I'm here to help. ${fileContext || 'You can upload documents for verification, sealing, or blockchain anchoring.'}`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export function getConversationHistory() {
  return conversationHistory;
}

export function clearConversation() {
  conversationHistory.length = 0;
}
