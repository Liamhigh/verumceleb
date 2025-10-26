/**
 * Nine-Brains Forensic Verification Engine
 * Verum Omnis — Patent Pending
 * 
 * Each "brain" is an independent analysis module that votes PASS or FLAG
 * with a confidence score (0–1) and detailed notes for audit trail.
 */

// ═══════════════════════════════════════════════════════════════
// Brain 1: Document Integrity
// ═══════════════════════════════════════════════════════════════
export async function brain1_documentIntegrity({ file, arrayBuffer, text, metadata }) {
  const notes = [];
  let score = 1.0;
  
  // Check for empty/minimal content
  if (!text || text.trim().length < 10) {
    notes.push('⚠️ Document appears empty or has minimal text');
    score -= 0.3;
  }
  
  // Suspicious filename patterns
  const suspiciousPatterns = [
    /copy\s*\d+/i,
    /\(conflicted\s+copy\)/i,
    /untitled/i,
    /temp/i,
    /draft/i,
    /\~\$/,
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      notes.push(`⚠️ Suspicious filename pattern: ${file.name}`);
      score -= 0.1;
      break;
    }
  }
  
  // Check for extremely small or large files
  if (file.size < 100) {
    notes.push('⚠️ File is suspiciously small (< 100 bytes)');
    score -= 0.3;
  } else if (file.size > 100 * 1024 * 1024) {
    notes.push('⚠️ File is unusually large (> 100MB)');
    score -= 0.1;
  }
  
  // PDF-specific checks
  if (file.type === 'application/pdf' && metadata?.pdfInfo) {
    const { pageCount, producer, creator, hasDuplicatePages } = metadata.pdfInfo;
    
    if (pageCount === 0) {
      notes.push('⚠️ PDF has zero pages');
      score -= 0.5;
    }
    
    if (hasDuplicatePages) {
      notes.push('⚠️ PDF contains duplicate pages');
      score -= 0.2;
    }
    
    // Suspicious producer/creator combos
    const suspiciousTools = ['pdftk', 'ghostscript', 'imagemagick'];
    const producerLower = (producer || '').toLowerCase();
    if (suspiciousTools.some(tool => producerLower.includes(tool))) {
      notes.push(`⚠️ PDF created with manipulation tool: ${producer}`);
      score -= 0.15;
    }
  }
  
  if (notes.length === 0) {
    notes.push('✓ Document integrity checks passed');
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Document Integrity', vote, score: Math.max(0, score), notes };
}

// ═══════════════════════════════════════════════════════════════
// Brain 2: OCR Sanity
// ═══════════════════════════════════════════════════════════════
export async function brain2_ocrSanity({ file, text, metadata }) {
  const notes = [];
  let score = 1.0;
  
  const ocrStats = metadata?.ocrStats;
  
  if (!ocrStats || !ocrStats.wasOcrNeeded) {
    notes.push('✓ No OCR needed (native text extraction)');
    return { brain: 'OCR Sanity', vote: 'pass', score: 1.0, notes };
  }
  
  // Check per-page OCR confidence
  const { avgConfidence, pageCount, ocrPages } = ocrStats;
  
  if (avgConfidence < 0.5) {
    notes.push(`⚠️ Low average OCR confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    score -= 0.4;
  } else if (avgConfidence < 0.7) {
    notes.push(`⚠️ Moderate OCR confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    score -= 0.2;
  }
  
  // Check for non-linguistic characters
  const nonAlpha = (text.match(/[^a-zA-Z\s]/g) || []).length;
  const totalChars = text.length;
  const nonAlphaRatio = nonAlpha / totalChars;
  
  if (nonAlphaRatio > 0.5) {
    notes.push(`⚠️ High non-alphabetic character rate: ${(nonAlphaRatio * 100).toFixed(1)}%`);
    score -= 0.3;
  }
  
  // Check for repeated glyphs (OCR artifacts)
  const repeatedGlyphs = text.match(/(.)\1{10,}/g);
  if (repeatedGlyphs && repeatedGlyphs.length > 0) {
    notes.push(`⚠️ Detected ${repeatedGlyphs.length} sequences of repeated characters (scan artifacts)`);
    score -= 0.2;
  }
  
  // Check for banding patterns (common in poor scans)
  const lines = text.split('\n');
  const emptyLineRatio = lines.filter(l => l.trim().length === 0).length / lines.length;
  if (emptyLineRatio > 0.6) {
    notes.push(`⚠️ High empty line ratio: ${(emptyLineRatio * 100).toFixed(1)}% (possible banding)`);
    score -= 0.15;
  }
  
  if (notes.length === 0) {
    notes.push(`✓ OCR quality good (${(avgConfidence * 100).toFixed(1)}% confidence)`);
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'OCR Sanity', vote, score: Math.max(0, score), notes };
}

// ═══════════════════════════════════════════════════════════════
// Brain 3: Statistical Signals
// ═══════════════════════════════════════════════════════════════
export async function brain3_statisticalSignals({ file, text, metadata }) {
  const notes = [];
  let score = 1.0;
  
  if (!text || text.length < 10) {
    notes.push('⚠️ Insufficient text for statistical analysis');
    return { brain: 'Statistical Signals', vote: 'flag', score: 0.3, notes };
  }
  
  // Entropy calculation (Shannon entropy)
  const charCounts = {};
  for (const char of text) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  const entropy = Object.values(charCounts).reduce((sum, count) => {
    const p = count / text.length;
    return sum - (p * Math.log2(p));
  }, 0);
  
  // Normal text entropy is ~4.5-5.5 bits per character
  if (entropy < 3.0) {
    notes.push(`⚠️ Very low entropy: ${entropy.toFixed(2)} bits (highly repetitive)`);
    score -= 0.4;
  } else if (entropy > 7.0) {
    notes.push(`⚠️ Very high entropy: ${entropy.toFixed(2)} bits (possibly encrypted/corrupted)`);
    score -= 0.3;
  }
  
  // Repetition ratio (longest repeated substring vs total length)
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCounts = {};
  for (const word of words) {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  const maxRepetition = Math.max(...Object.values(wordCounts), 0);
  const repetitionRatio = maxRepetition / words.length;
  
  if (repetitionRatio > 0.15) {
    notes.push(`⚠️ High word repetition: ${(repetitionRatio * 100).toFixed(1)}%`);
    score -= 0.2;
  }
  
  // Boilerplate detection
  const boilerplateMarkers = [
    'lorem ipsum',
    'dolor sit amet',
    'consectetur adipiscing',
    'sample text',
    'placeholder',
    'test document',
  ];
  
  for (const marker of boilerplateMarkers) {
    if (text.toLowerCase().includes(marker)) {
      notes.push(`⚠️ Boilerplate detected: "${marker}"`);
      score -= 0.5;
      break;
    }
  }
  
  // Symbol run detection (e.g., "######" or "******")
  const symbolRuns = text.match(/([^\w\s])\1{5,}/g);
  if (symbolRuns && symbolRuns.length > 0) {
    notes.push(`⚠️ Detected ${symbolRuns.length} symbol runs (redaction markers?)`);
    score -= 0.15;
  }
  
  if (notes.length === 0) {
    notes.push(`✓ Statistical signals normal (entropy: ${entropy.toFixed(2)} bits)`);
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Statistical Signals', vote, score: Math.max(0, score), notes };
}

// ═══════════════════════════════════════════════════════════════
// Brain 4: Timeline Coherence
// ═══════════════════════════════════════════════════════════════
export async function brain4_timelineCoherence({ file, text, metadata }) {
  const notes = [];
  let score = 1.0;
  
  // Extract dates (various formats)
  const datePatterns = [
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g,  // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g,    // YYYY/MM/DD
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{4})\b/gi,  // Month DD, YYYY
  ];
  
  const extractedDates = [];
  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      try {
        const dateStr = match[0];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          extractedDates.push({ str: dateStr, date, position: match.index });
        }
      } catch (e) {
        // Invalid date, skip
      }
    }
  }
  
  if (extractedDates.length === 0) {
    notes.push('⚠️ No dates detected in document');
    return { brain: 'Timeline Coherence', vote: 'pass', score: 0.8, notes };
  }
  
  // Check for future dates
  const now = new Date();
  const futureDates = extractedDates.filter(d => d.date > now);
  if (futureDates.length > 0) {
    notes.push(`⚠️ Found ${futureDates.length} future date(s): ${futureDates[0].str}`);
    score -= 0.3;
  }
  
  // Check for impossible historical dates (before 1900 or after 2100)
  const impossibleDates = extractedDates.filter(d => d.date.getFullYear() < 1900 || d.date.getFullYear() > 2100);
  if (impossibleDates.length > 0) {
    notes.push(`⚠️ Found ${impossibleDates.length} implausible date(s): ${impossibleDates[0].str}`);
    score -= 0.2;
  }
  
  // Check for chronological inconsistencies (dates appear out of order)
  const sortedDates = [...extractedDates].sort((a, b) => a.date - b.date);
  let outOfOrderCount = 0;
  for (let i = 0; i < extractedDates.length - 1; i++) {
    if (extractedDates[i].date > extractedDates[i + 1].date) {
      outOfOrderCount++;
    }
  }
  if (outOfOrderCount > extractedDates.length * 0.3) {
    notes.push(`⚠️ ${outOfOrderCount} dates appear out of chronological order`);
    score -= 0.15;
  }
  
  // Check file metadata date vs document dates
  const fileModified = new Date(file.lastModified);
  const oldestDoc = sortedDates[0]?.date;
  const newestDoc = sortedDates[sortedDates.length - 1]?.date;
  
  if (oldestDoc && fileModified < oldestDoc) {
    notes.push(`⚠️ File modified before document's oldest date (${oldestDoc.toLocaleDateString()})`);
    score -= 0.1;
  }
  
  if (notes.length === 0) {
    notes.push(`✓ Timeline coherent (${extractedDates.length} dates extracted)`);
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Timeline Coherence', vote, score: Math.max(0, score), notes };
}

// ═══════════════════════════════════════════════════════════════
// Brain 5: Entity/Referential Consistency
// ═══════════════════════════════════════════════════════════════
export async function brain5_entityConsistency({ file, text, metadata, caseFiles = [] }) {
  const notes = [];
  let score = 1.0;
  
  // Extract entities: names, IDs, amounts, locations
  const entities = {
    names: [...new Set((text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || []))],
    ids: [...new Set((text.match(/\b[A-Z]{2,}\d{4,}\b/g) || []))],
    amounts: [...new Set((text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || []))],
    emails: [...new Set((text.match(/\b[\w.-]+@[\w.-]+\.\w+\b/g) || []))],
  };
  
  // Check for name variations (potential typos or alterations)
  const namePairs = [];
  for (let i = 0; i < entities.names.length; i++) {
    for (let j = i + 1; j < entities.names.length; j++) {
      const name1 = entities.names[i].toLowerCase();
      const name2 = entities.names[j].toLowerCase();
      const distance = levenshteinDistance(name1, name2);
      if (distance > 0 && distance <= 2) {
        namePairs.push([entities.names[i], entities.names[j]]);
      }
    }
  }
  
  if (namePairs.length > 0) {
    notes.push(`⚠️ Found ${namePairs.length} similar name pair(s): ${namePairs[0].join(' / ')}`);
    score -= 0.15;
  }
  
  // Check for amount inconsistencies (same ID with different amounts)
  const amountsByContext = {};
  for (const id of entities.ids) {
    const regex = new RegExp(`${id}[^$]*?\\$(\\d+(?:,\\d{3})*(?:\\.\\d{2})?)`, 'g');
    const matches = [...text.matchAll(regex)];
    if (matches.length > 1) {
      const amounts = [...new Set(matches.map(m => m[1]))];
      if (amounts.length > 1) {
        notes.push(`⚠️ ID ${id} associated with multiple amounts: ${amounts.join(', ')}`);
        score -= 0.2;
      }
    }
  }
  
  // Cross-document consistency (if multiple files)
  if (caseFiles.length > 1) {
    // Check for entity conflicts across files
    for (const otherFile of caseFiles) {
      if (otherFile.filename === file.name) continue;
      
      const commonNames = entities.names.filter(name => 
        (otherFile.text || '').includes(name)
      );
      
      if (commonNames.length > 0) {
        notes.push(`✓ ${commonNames.length} name(s) confirmed in ${otherFile.filename}`);
        score += 0.05; // Bonus for cross-document consistency
      }
    }
  }
  
  if (notes.length === 0) {
    notes.push(`✓ Entity consistency checks passed (${entities.names.length} names, ${entities.ids.length} IDs)`);
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Entity/Referential Consistency', vote, score: Math.min(1, Math.max(0, score)), notes };
}

// ═══════════════════════════════════════════════════════════════
// Brain 6: Cross-Document Contradictions
// ═══════════════════════════════════════════════════════════════
export async function brain6_contradictions({ file, text, metadata, caseFiles = [] }) {
  const notes = [];
  let score = 1.0;
  
  if (caseFiles.length < 2) {
    notes.push('ℹ️ Single file; no cross-document analysis possible');
    return { brain: 'Cross-Document Contradictions', vote: 'pass', score: 1.0, notes };
  }
  
  // Extract claims (sentences with certain verbs: is, was, states, claims, confirms, denies)
  const claimVerbs = ['is', 'was', 'are', 'were', 'states', 'claims', 'confirms', 'denies', 'alleges'];
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  const claims = sentences.filter(s => 
    claimVerbs.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(s))
  );
  
  // Look for contradictory statements in other files
  const contradictions = [];
  for (const claim of claims.slice(0, 20)) { // Limit to first 20 claims for performance
    const claimLower = claim.toLowerCase();
    
    for (const otherFile of caseFiles) {
      if (otherFile.filename === file.name) continue;
      
      const otherText = (otherFile.text || '').toLowerCase();
      
      // Simple contradiction detection: look for negation patterns
      const negationPatterns = [
        'not ' + claimLower.slice(0, 50),
        'never ' + claimLower.slice(0, 50),
        'denies ' + claimLower.slice(0, 50),
        'disputes ' + claimLower.slice(0, 50),
      ];
      
      for (const pattern of negationPatterns) {
        if (otherText.includes(pattern)) {
          contradictions.push({
            file1: file.name,
            file2: otherFile.filename,
            claim: claim.slice(0, 100),
          });
          score -= 0.15;
          break;
        }
      }
    }
  }
  
  if (contradictions.length > 0) {
    notes.push(`⚠️ Found ${contradictions.length} potential contradiction(s)`);
    notes.push(`   Example: "${contradictions[0].claim}..." conflicts with ${contradictions[0].file2}`);
  } else {
    notes.push(`✓ No obvious contradictions detected across ${caseFiles.length} files`);
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Cross-Document Contradictions', vote, score: Math.max(0, score), notes, contradictions };
}

// ═══════════════════════════════════════════════════════════════
// Brain 7: Confession/Admission/Denial Mining
// ═══════════════════════════════════════════════════════════════
export async function brain7_confessionMining({ file, text, metadata }) {
  const notes = [];
  let score = 1.0; // Neutral score (this brain flags interesting content, not problems)
  
  // Phrasebanks for confession-like statements
  const admissionPatterns = [
    /\b(I|we|he|she|they)\s+(admit|acknowledge|confess|concede|accept)\b/gi,
    /\b(I|we|he|she|they)\s+(did|made|took|gave|received|accepted)\b/gi,
    /\b(I|we|he|she|they)\s+(knew|understood|was\s+aware|realized)\b/gi,
    /\b(I|we|he|she|they)\s+(failed\s+to|neglected\s+to|did\s+not)\b/gi,
  ];
  
  const denialPatterns = [
    /\b(I|we|he|she|they)\s+(deny|dispute|reject|refute)\b/gi,
    /\b(I|we|he|she|they)\s+(did\s+not|never|have\s+not)\b/gi,
    /\b(no\s+knowledge|unaware|did\s+not\s+know)\b/gi,
  ];
  
  const intentPatterns = [
    /\b(intended|planned|meant|purposed|designed)\s+to\b/gi,
    /\b(in\s+order\s+to|for\s+the\s+purpose\s+of)\b/gi,
  ];
  
  const admissions = [];
  const denials = [];
  const intents = [];
  
  const sentences = text.split(/[.!?]+/).map(s => s.trim());
  
  for (const sentence of sentences) {
    // Check admissions
    for (const pattern of admissionPatterns) {
      if (pattern.test(sentence)) {
        admissions.push(sentence.slice(0, 150));
        break;
      }
    }
    
    // Check denials
    for (const pattern of denialPatterns) {
      if (pattern.test(sentence)) {
        denials.push(sentence.slice(0, 150));
        break;
      }
    }
    
    // Check intent
    for (const pattern of intentPatterns) {
      if (pattern.test(sentence)) {
        intents.push(sentence.slice(0, 150));
        break;
      }
    }
  }
  
  if (admissions.length > 0) {
    notes.push(`📌 Found ${admissions.length} admission-like statement(s)`);
    notes.push(`   Example: "${admissions[0]}..."`);
  }
  
  if (denials.length > 0) {
    notes.push(`📌 Found ${denials.length} denial-like statement(s)`);
    notes.push(`   Example: "${denials[0]}..."`);
  }
  
  if (intents.length > 0) {
    notes.push(`📌 Found ${intents.length} intent statement(s)`);
    notes.push(`   Example: "${intents[0]}..."`);
  }
  
  if (notes.length === 0) {
    notes.push('ℹ️ No admission/denial/intent patterns detected');
  }
  
  const vote = 'pass'; // This brain doesn't flag; it surfaces interesting content
  return { 
    brain: 'Confession/Admission/Denial Mining', 
    vote, 
    score, 
    notes,
    admissions: admissions.slice(0, 10),
    denials: denials.slice(0, 10),
    intents: intents.slice(0, 10),
  };
}

// ═══════════════════════════════════════════════════════════════
// Brain 8: Policy/Template Deviation
// ═══════════════════════════════════════════════════════════════
export async function brain8_policyDeviation({ file, text, metadata }) {
  const notes = [];
  let score = 1.0;
  
  // Common document template markers
  const templateMarkers = {
    legal: ['whereas', 'hereby', 'witnesseth', 'in witness whereof'],
    financial: ['balance sheet', 'income statement', 'cash flow', 'assets', 'liabilities'],
    medical: ['patient name', 'date of birth', 'diagnosis', 'treatment plan'],
    insurance: ['policy number', 'insured', 'beneficiary', 'coverage', 'premium'],
  };
  
  const lowerText = text.toLowerCase();
  let templateType = null;
  
  // Detect template type
  for (const [type, markers] of Object.entries(templateMarkers)) {
    const matchCount = markers.filter(marker => lowerText.includes(marker)).length;
    if (matchCount >= 2) {
      templateType = type;
      break;
    }
  }
  
  if (!templateType) {
    notes.push('ℹ️ No standard template detected; treating as freeform document');
    return { brain: 'Policy/Template Deviation', vote: 'pass', score: 1.0, notes };
  }
  
  notes.push(`ℹ️ Detected ${templateType} template`);
  
  // Check for expected sections based on template type
  const expectedSections = {
    legal: ['parties', 'terms', 'conditions', 'signatures'],
    financial: ['period', 'totals', 'notes'],
    medical: ['patient', 'provider', 'diagnosis', 'signature'],
    insurance: ['policyholder', 'coverage', 'effective date', 'premium'],
  };
  
  const missing = [];
  for (const section of expectedSections[templateType] || []) {
    if (!lowerText.includes(section)) {
      missing.push(section);
    }
  }
  
  if (missing.length > 0) {
    notes.push(`⚠️ Missing expected section(s): ${missing.join(', ')}`);
    score -= 0.1 * missing.length;
  }
  
  // Check for numeric range anomalies (e.g., negative amounts in unexpected places)
  const amounts = text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
  const negativeAmounts = text.match(/-\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
  
  if (negativeAmounts.length > amounts.length * 0.5) {
    notes.push(`⚠️ High proportion of negative amounts: ${negativeAmounts.length}/${amounts.length}`);
    score -= 0.15;
  }
  
  if (notes.length === 1) { // Only the template detection note
    notes.push('✓ Template structure appears complete');
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Policy/Template Deviation', vote, score: Math.max(0, score), notes };
}

// ═══════════════════════════════════════════════════════════════
// Brain 9: Bias/Anomaly/Outlier Detection
// ═══════════════════════════════════════════════════════════════
export async function brain9_biasAnomaly({ file, text, metadata, caseFiles = [] }) {
  const notes = [];
  let score = 1.0;
  
  // Extract all numeric values
  const numbers = (text.match(/\b\d+(?:,\d{3})*(?:\.\d+)?\b/g) || [])
    .map(n => parseFloat(n.replace(/,/g, '')))
    .filter(n => !isNaN(n) && n > 0);
  
  if (numbers.length === 0) {
    notes.push('ℹ️ No numeric data for outlier analysis');
    return { brain: 'Bias/Anomaly/Outlier Detection', vote: 'pass', score: 1.0, notes };
  }
  
  // Calculate statistics
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const sorted = [...numbers].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const stdDev = Math.sqrt(
    numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length
  );
  
  // Detect outliers (values > 3 standard deviations from mean)
  const outliers = numbers.filter(n => Math.abs(n - mean) > 3 * stdDev);
  
  if (outliers.length > 0) {
    notes.push(`⚠️ Found ${outliers.length} statistical outlier(s)`);
    notes.push(`   Example: ${outliers[0].toLocaleString()} (mean: ${mean.toFixed(2)})`);
    score -= 0.15;
  }
  
  // Check for improbable sequences (e.g., perfectly round numbers)
  const roundNumbers = numbers.filter(n => n % 100 === 0 || n % 1000 === 0);
  if (roundNumbers.length > numbers.length * 0.8) {
    notes.push(`⚠️ ${(roundNumbers.length / numbers.length * 100).toFixed(0)}% of numbers are round (suspiciously high)`);
    score -= 0.2;
  }
  
  // Lexical style analysis (sudden shifts in vocabulary)
  const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const uniqueWords = new Set(words);
  const vocabularyRichness = uniqueWords.size / words.length;
  
  if (vocabularyRichness < 0.3) {
    notes.push(`⚠️ Low vocabulary richness: ${(vocabularyRichness * 100).toFixed(1)}% (repetitive language)`);
    score -= 0.1;
  } else if (vocabularyRichness > 0.8) {
    notes.push(`⚠️ Very high vocabulary richness: ${(vocabularyRichness * 100).toFixed(1)}% (possible multiple authors)`);
    score -= 0.1;
  }
  
  if (notes.length === 0) {
    notes.push(`✓ No statistical anomalies detected (${numbers.length} values analyzed)`);
  }
  
  const vote = score >= 0.5 ? 'pass' : 'flag';
  return { brain: 'Bias/Anomaly/Outlier Detection', vote, score: Math.max(0, score), notes };
}

// ═══════════════════════════════════════════════════════════════
// Utility: Levenshtein Distance
// ═══════════════════════════════════════════════════════════════
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

// ═══════════════════════════════════════════════════════════════
// Master Nine-Brains Runner
// ═══════════════════════════════════════════════════════════════
export async function runNineBrains({ file, arrayBuffer, text, metadata, caseFiles = [] }) {
  const results = await Promise.all([
    brain1_documentIntegrity({ file, arrayBuffer, text, metadata }),
    brain2_ocrSanity({ file, text, metadata }),
    brain3_statisticalSignals({ file, text, metadata }),
    brain4_timelineCoherence({ file, text, metadata }),
    brain5_entityConsistency({ file, text, metadata, caseFiles }),
    brain6_contradictions({ file, text, metadata, caseFiles }),
    brain7_confessionMining({ file, text, metadata }),
    brain8_policyDeviation({ file, text, metadata }),
    brain9_biasAnomaly({ file, text, metadata, caseFiles }),
  ]);
  
  // Calculate overall consensus
  const votes = results.map(r => r.vote);
  const passCount = votes.filter(v => v === 'pass').length;
  const flagCount = votes.filter(v => v === 'flag').length;
  const consensus = passCount >= 5 ? 'PASS' : 'FLAG'; // 5/9 majority
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  
  return {
    results,
    consensus,
    passCount,
    flagCount,
    avgScore,
    totalBrains: 9,
  };
}
