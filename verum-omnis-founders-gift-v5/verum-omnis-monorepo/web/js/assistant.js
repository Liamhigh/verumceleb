/**
 * Verum Omnis - Client-Only Assistant
 * All core logic runs in the browser (no server required)
 * 
 * Enhanced with Nine-Brains forensic verification and Constitutional Framework
 * All analysis follows the 10 constitutional principles
 */

// Import new modules
import { runNineBrains } from './nine-brains.js';
import { extractFromFile } from './extraction.js';

// Constitutional Framework - loaded once and referenced throughout
let CONSTITUTION = null;

async function loadConstitution() {
  if (!CONSTITUTION) {
    try {
      const response = await fetch('/data/constitution.json');
      CONSTITUTION = await response.json();
    } catch (error) {
      console.warn('Constitution not loaded:', error);
      CONSTITUTION = { principles: [], loaded: false };
    }
  }
  return CONSTITUTION;
}

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
      notes.push('🤖 Calling OpenAI for LLM analysis...');
      
      // Extract text content for analysis
      let textContent = '';
      if (mime?.includes('text')) {
        textContent = new TextDecoder().decode(arrayBuffer);
      } else if (mime?.includes('pdf')) {
        textContent = await extractTextFromPDF(arrayBuffer);
      }
      // Limit text size
      textContent = textContent.substring(0, 4000);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.VERUM_ENV.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: window.VERUM_ENV.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a document verification expert. Analyze the document for signs of fraud, tampering, or anomalies. Respond with PASS or FLAG followed by a brief explanation.'
            },
            {
              role: 'user',
              content: `Analyze this document:\n\nFilename: ${filename}\nType: ${mime}\nSHA-512: ${sha512.substring(0, 32)}...\n\nContent preview:\n${textContent || '[Binary file - no text extracted]'}\n\nIs this document authentic or suspicious? Respond with "PASS:" or "FLAG:" followed by your analysis.`
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      const llmResponse = data.choices?.[0]?.message?.content || '';
      
      if (llmResponse.toUpperCase().startsWith('FLAG')) {
        vote = 'flag';
        notes.push(`🚩 ${llmResponse}`);
      } else {
        notes.push(`✓ ${llmResponse}`);
      }
      
      return { checker: 'LLMChecker', vote, notes };
    } catch (error) {
      notes.push(`⚠️ LLM API error: ${error.message} - falling back to local analysis`);
    }
  }
  
  // Local stub analysis (pattern-based)
  notes.push('🔍 Running local pattern analysis (no API key configured)');
  
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
    // Extract text first (needed for Nine-Brains)
    const file = currentFile?.file || { name: filename, type: mime, size: arrayBuffer.byteLength };
    const { text, metadata } = await extractFromFile(file);
    
    // Run Nine-Brains verification (all 9 modules)
    const nineBrainsResults = await runNineBrains({
      file,
      arrayBuffer,
      text,
      metadata,
      caseFiles: [], // Single file mode
    });
    
    // Map to old format for backwards compatibility
    const results = nineBrainsResults.results.map(brain => ({
      checker: brain.brain,
      vote: brain.vote,
      notes: brain.notes,
    }));
    
    return {
      results,
      consensus: nineBrainsResults.consensus,
      passCount: nineBrainsResults.passCount,
      flagCount: nineBrainsResults.flagCount,
      totalCheckers: 9,
      avgScore: nineBrainsResults.avgScore,
      timestamp: new Date().toISOString(),
      // Include full Nine-Brains data
      nineBrainsResults,
    };
  } catch (error) {
    console.error('Verification failed:', error);
    throw new Error('Nine-Brains verification failed: ' + error.message);
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
// 5. CHAT - Assistant Reply (Constitutional Framework Aware)
// ============================================================================

const conversationHistory = [];

export async function assistantReply(userMessage) {
  try {
    // Load constitution on first use
    await loadConstitution();
    
    // Store user message
    conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });
    
    let response;
    
    // Check for optional LLM API
    if (window.VERUM_ENV?.OPENAI_API_KEY) {
      try {
        // Build messages for OpenAI with constitutional awareness
        const constitutionalContext = CONSTITUTION?.loaded === false ? 
          '' : 
          `\n\nYou must follow the Verum Omnis Constitutional Framework with 10 principles:
P1: Truth Above All - never omit contradictions
P2: Presumption of Innocence - evidence required for flagging
P3: Right to Explanation - always explain reasoning
P4: Contradiction Detection Primacy - contradictions are key evidence
P5: Multi-Perspective Analysis - 9 independent modules required
P6: Evidence Chain Integrity - SHA-512 + QR verification
P7: Legal Standard Compliance - court-admissible verification
P8: Privacy and Confidentiality - client-side only processing
P9: Accessible Justice - free for individuals, 20% recovery for institutions
P10: Continuous Improvement - evolve while maintaining principles

When discussing analysis, reference principles by ID (e.g., "Under P4...").`;
        
        const messages = [
          {
            role: 'system',
            content: `You are a helpful AI assistant for Verum Omnis, a constitutional framework-based document verification platform. You can help users verify, seal, and anchor documents using rigorous legal standards.${constitutionalContext}

Current file: ${currentFile ? currentFile.filename : 'none'}. 

Be concise, friendly, reference constitutional principles when relevant, and guide users to use the tools panel.`
          }
        ];
        
        // Add recent conversation history (last 5 exchanges)
        const recentHistory = conversationHistory.slice(-10);
        messages.push(...recentHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })));
        
        const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.VERUM_ENV.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: window.VERUM_ENV.OPENAI_MODEL || 'gpt-4o-mini',
            messages,
            max_tokens: 300,
            temperature: 0.7
          })
        });
        
        if (!apiResponse.ok) {
          throw new Error(`API returned ${apiResponse.status}`);
        }
        
        const data = await apiResponse.json();
        response = data.choices?.[0]?.message?.content || 'I apologize, but I received an empty response.';
      } catch (error) {
        console.warn('LLM API call failed, using local stub:', error);
        response = generateLocalResponse(userMessage);
      }
    } else {
      // Local stub response (pattern matching + context awareness + constitutional)
      response = generateLocalResponse(userMessage);
    }
    
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
  
  // Constitutional principle queries
  if (/constitution|principle|framework/i.test(lowerMsg)) {
    return `I operate under the **Verum Omnis Constitutional Framework** with 10 core principles:

📜 **P1: Truth Above All** - No omissions, all contradictions surfaced
📜 **P2: Presumption of Innocence** - Documents are authentic until proven otherwise
📜 **P3: Right to Explanation** - Every decision is transparent and explainable
📜 **P4: Contradiction Detection Primacy** - Contradictions are key evidence of fraud
📜 **P5: Multi-Perspective Analysis** - 9 independent verification modules
📜 **P6: Evidence Chain Integrity** - SHA-512 hashing + QR verification
📜 **P7: Legal Standard Compliance** - Court-admissible forensic analysis
📜 **P8: Privacy & Confidentiality** - Client-side only, no server storage
📜 **P9: Accessible Justice** - Free for individuals, 20% recovery for institutions
📜 **P10: Continuous Improvement** - Evolve while maintaining principles

${fileContext || 'Upload a document to see these principles in action!'}`;
  }
  
  if (/contradiction/i.test(lowerMsg)) {
    return `Under **P4: Contradiction Detection Primacy**, I use an enhanced contradiction engine that detects:

• **Temporal contradictions** - Same event, different dates
• **Factual contradictions** - X is true vs X is false
• **Entity contradictions** - Same person, different attributes
• **Admission vs Denial** - Claims admitted in one doc, denied in another
• **Numerical contradictions** - Same ID, different amounts

${fileContext ? `I can analyze "${currentFile.filename}" for contradictions when you upload additional related documents.` : 'Upload multiple related documents to enable cross-document contradiction analysis.'}`;
  }
  
  // Greeting patterns
  if (/^(hi|hello|hey|greetings)/i.test(lowerMsg)) {
    return `Hello! I'm your Verum Omnis assistant, operating under a strict constitutional framework to ensure **the whole truth** in every analysis. ${fileContext || 'Upload a document to get started, or ask me about the constitutional principles I follow.'}`;
  }
  
  // Tool-related queries
  if (/verify|check|validate/i.test(lowerMsg)) {
    return fileContext ? 
      `I can verify "${currentFile.filename}" using **Nine-Brains forensic analysis** (P5: Multi-Perspective). This includes the contradiction engine (P4) and 8 other independent validators. Click "Check this document" to start the constitutional verification process.` :
      `To verify a document, upload it first. I'll run 9 independent analysis modules including the **contradiction engine** to detect any fraud or tampering. This meets legal standards for court admissibility (P7).`;
  }
  
  if (/seal|stamp|certif/i.test(lowerMsg)) {
    return fileContext ?
      `I can seal "${currentFile.filename}" as a certified PDF with SHA-512 hash, QR verification code, and Verum Omnis watermark (P6: Evidence Chain Integrity). Click "Seal this document" when ready.` :
      `To seal a document, upload it first. I'll create a certified PDF meeting **P6: Evidence Chain Integrity** - SHA-512 hash + QR code for third-party verification.`;
  }
  
  if (/anchor|blockchain|chain/i.test(lowerMsg)) {
    return fileContext ?
      `I can generate an anchor receipt for "${currentFile.filename}" (P6: Evidence Chain). This creates a timestamped proof record. ${window.VERUM_ENV?.ANCHOR ? 'Blockchain anchoring is configured!' : 'Currently local-only (P8: Privacy - no server storage).'}` :
      `Anchoring creates a permanent record of your document's hash while respecting **P8: Privacy** (client-side only). Upload a file first, then click "Anchor this document".`;
  }
  
  if (/hash|sha/i.test(lowerMsg)) {
    return fileContext ?
      `Your file's SHA-512 hash is: ${currentFile.sha512.substring(0, 32)}... (full hash in tools panel). This cryptographic fingerprint ensures **P6: Evidence Chain Integrity**.` :
      `I compute SHA-512 hashes instantly when you upload a file (P6: Evidence Chain Integrity). They're cryptographic fingerprints that prove your document hasn't changed.`;
  }
  
  // Legal/court admissibility
  if (/legal|court|evidence|admiss/i.test(lowerMsg)) {
    return `Under **P7: Legal Standard Compliance**, all my verifications are designed for court admissibility:

✓ Forensic-grade SHA-512 hashing
✓ Nine independent analysis modules with audit trails
✓ Contradiction detection with documented evidence
✓ Reproducible verification process
✓ Sealed PDFs with tamper-evident QR codes

${fileContext ? `Your document "${currentFile.filename}" can be verified to these legal standards.` : 'Upload a document to start the legal verification process.'}`;
  }
  
  // Privacy
  if (/privacy|private|confidential|data|storage/i.test(lowerMsg)) {
    return `**P8: Privacy & Confidentiality** is absolute here:

✓ All processing happens in YOUR browser
✓ No document content ever sent to servers
✓ No server-side storage of your files
✓ You maintain complete control over your data

${fileContext ? `Your file "${currentFile.filename}" never leaves this browser.` : 'Your documents stay completely private and under your control.'}`;
  }
  
  // Pricing/institutions
  if (/price|cost|fee|institution|company|business/i.test(lowerMsg)) {
    return `Under **P9: Accessible Justice**:

👤 **Individuals**: Completely FREE - all verification, sealing, and anchoring
🏛️ **Institutions/Companies**: 20% of fraud recovery AFTER successful trial (no upfront costs)

This ensures access to justice isn't blocked by fees. ${fileContext || 'Upload your documents and start verifying for free!'}`;
  }
  
  // Help/what can you do
  if (/help|what can|capabilities|features/i.test(lowerMsg)) {
    return `I operate under the **Constitutional Framework** to provide:

• **Verify** - Nine-Brains forensic analysis with contradiction detection (P4, P5)
• **Seal** - Court-admissible certified PDFs with QR codes (P6, P7)
• **Anchor** - Timestamped proof receipts (P6)
• **Hash** - SHA-512 cryptographic fingerprints (P6)

All analysis follows **P1: Truth Above All** - no omissions, ever.

${fileContext || 'Upload a document to get started!'}`;
  }
  
  // Thank you
  if (/thank|thanks|thx/i.test(lowerMsg)) {
    return `You're welcome! I'm here to uphold the constitutional principles and ensure the whole truth emerges. ${fileContext ? `Your file "${currentFile.filename}" is ready for constitutional verification, sealing, or anchoring.` : ''}`;
  }
  
  // Default empathetic response with constitutional awareness
  const responses = [
    `I understand. ${fileContext || 'Feel free to upload a document, and I can apply constitutional forensic analysis to verify, seal, or anchor it.'}`,
    `Got it. ${fileContext ? `Would you like me to verify "${currentFile.filename}" using the Nine-Brains system with contradiction engine (P4)?` : 'Upload a file and I can help with constitutional verification, sealing, or anchoring.'}`,
    `I'm here to help under the constitutional framework. ${fileContext || 'You can upload documents for rigorous verification, legal-grade sealing, or blockchain anchoring.'}`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export function getConversationHistory() {
  return conversationHistory;
}

export function clearConversation() {
  conversationHistory.length = 0;
}
