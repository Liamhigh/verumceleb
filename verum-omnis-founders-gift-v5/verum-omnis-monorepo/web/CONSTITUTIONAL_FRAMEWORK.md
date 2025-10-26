# Verum Omnis Constitutional Framework

## Overview

The **Verum Omnis Constitutional Framework** is the foundational legal and ethical system governing all document verification and AI assistant operations. Every analysis, conversation, and decision follows these immutable principles to ensure **the whole truth** emerges in every case.

## Version

**v1.0.0** - Effective October 26, 2025

## The Ten Constitutional Principles

### P1: Truth Above All

**Principle:** The whole truth must be sought in every analysis. No partial truths, no convenient omissions.

**Implications:**
- All document claims must be verified against available evidence
- Contradictions must always be surfaced, never hidden
- Uncertainty must be acknowledged, never masked with false confidence

**In Practice:**
- The Nine-Brains system documents all findings, both positive and negative
- Results panels show complete analysis, not filtered "good news"
- Chat assistant mentions contradictions even when inconvenient

---

### P2: Presumption of Innocence

**Principle:** Documents and claims are presumed authentic until evidence proves otherwise.

**Implications:**
- Flagging a document requires substantive evidence, not mere suspicion
- Multiple independent verifications must converge before conclusions
- Burden of proof lies with the challenge, not the document

**In Practice:**
- Nine-Brains requires 5/9 majority to flag a document
- Single anomalies don't automatically invalidate documents
- Chat assistant uses language like "requires review" not "proven fake"

---

### P3: Right to Explanation

**Principle:** Every analysis, vote, and conclusion must be explainable and transparent.

**Implications:**
- All Nine-Brains modules must provide detailed notes
- AI decisions must cite specific evidence
- Users have the right to understand how conclusions were reached

**In Practice:**
- Every Brain module produces detailed notes with specific findings
- Results tables show scores, votes, and explanations
- Chat assistant can explain any finding when asked

---

### P4: Contradiction Detection Primacy

**Principle:** Contradictions are the primary indicator of fraud or error and must be rigorously sought.

**Implications:**
- Cross-document analysis is mandatory when multiple files exist
- Internal contradictions within documents must be flagged
- Timeline inconsistencies are considered high-priority evidence

**In Practice:**
- Brain 6 uses the enhanced Contradiction Engine
- Detects 5 types: temporal, factual, entity, admission-denial, numerical
- Contradictions are weighted by severity (critical/major/minor)

---

### P5: Multi-Perspective Analysis

**Principle:** No single method or perspective is sufficient; multiple independent analyses are required.

**Implications:**
- Nine-Brains architecture ensures diverse analytical approaches
- Majority consensus (5/9) required for final determination
- Dissenting opinions must be recorded and considered

**In Practice:**
- 9 independent Brain modules: integrity, OCR, statistics, timeline, entities, contradictions, confessions, policy, anomalies
- Each module votes independently (pass/flag)
- Final consensus based on majority, not unanimity

---

### P6: Evidence Chain Integrity

**Principle:** The chain of evidence from original document to final sealed artifact must be cryptographically sound.

**Implications:**
- SHA-512 hashing required for all documents
- Sealed documents must include verifiable QR codes
- Tampering with any part of the chain invalidates the entire verification

**In Practice:**
- SHA-512 hash computed immediately on upload (client-side)
- Sealed PDFs include truncated hash, QR code with full hash
- QR codes encode JSON: `{sha512, filename, timestamp}`

---

### P7: Legal Standard Compliance

**Principle:** All verification must meet or exceed legal evidentiary standards for court admissibility.

**Implications:**
- Forensic analysis must be thorough and documented
- Audit trails must be complete and tamper-proof
- Results must be reproducible and verifiable by third parties

**In Practice:**
- Nine-Brains produces court-ready forensic reports
- All analysis includes timestamps and version information
- Sealed PDFs are designed for legal submission

---

### P8: Privacy and Confidentiality

**Principle:** User data and documents must never be stored server-side; all processing is client-only.

**Implications:**
- No document content leaves the user's browser
- API calls (if any) only send metadata, never full content
- Users maintain complete control over their data

**In Practice:**
- All hashing, verification, sealing runs in browser via Web Crypto API
- Optional LLM calls send text excerpts only (user controlled)
- No server-side database or storage

---

### P9: Accessible Justice

**Principle:** Verification tools must be accessible to individuals without cost, while institutions pay for value received.

**Implications:**
- Individual users: free verification services
- Institutions/companies: 20% of fraud recovery after trial
- No upfront fees create barriers to justice

**In Practice:**
- Landing page clearly states pricing model
- Institution/company flow collects domain and shows 20% notice
- No payment processing required for verification tools

---

### P10: Continuous Improvement

**Principle:** The system must learn and improve while maintaining constitutional principles.

**Implications:**
- New analysis modules may be added if they enhance truth-seeking
- Constitutional principles are immutable; implementation may evolve
- User feedback informs improvements without compromising standards

**In Practice:**
- Nine-Brains architecture is extensible (can add Brain 10, 11...)
- Constitutional principles (P1-P10) are locked, implementation flexible
- Community feedback welcomed for tool improvements

---

## Contradiction Engine Rules

Under **P4: Contradiction Detection Primacy**, the Contradiction Engine follows these specific rules:

### 1. Mandatory Cross-Document Analysis
When 2+ documents are present, contradiction analysis is mandatory, not optional.

### 2. Five Contradiction Types Detected

1. **Temporal Contradictions**
   - Same event occurring at different times
   - Example: "Meeting on March 5" vs "Meeting on March 8"

2. **Factual Contradictions**
   - Mutually exclusive claims (X is true vs X is false)
   - Example: "Account was opened" vs "Account was never opened"

3. **Entity Contradictions**
   - Different attributes for the same entity
   - Example: "John Smith, age 45" vs "John Smith, age 47"

4. **Admission vs Denial Contradictions**
   - Admission in one document + denial in another
   - Example: "I admit receiving payment" vs "I deny receiving payment"

5. **Numerical Contradictions**
   - Same identifier with different amounts
   - Example: "Invoice #1234: $5,000" vs "Invoice #1234: $7,500"

### 3. Severity Weighting
- **Critical:** Factual contradictions, admission-denial conflicts
- **Major:** Temporal inconsistencies, entity conflicts
- **Minor:** Numerical variations within reasonable ranges

### 4. Context Awareness
Apparent contradictions may be explainable (e.g., amended invoices, updated information). The engine flags for human review rather than auto-rejecting.

### 5. Audit Trail Requirement
Every contradiction is documented with:
- Source documents (filenames)
- Exact text/values in conflict
- Position in documents
- Severity rating
- Constitutional principle reference (P4)

---

## Constitutional Violations

Actions that violate constitutional principles have specific consequences:

| Violation | Principle(s) | Consequence |
|-----------|-------------|-------------|
| **Hiding Contradictions** | P1, P4 | Complete invalidation of analysis; system must re-analyze |
| **Single-Source Verification** | P5 | Analysis marked as incomplete; additional perspectives required |
| **Unexplained Conclusions** | P3 | Conclusion rejected; detailed explanation required |
| **Server-Side Storage** | P8 | Immediate termination of process; privacy breach alert |
| **Premature Judgment** | P2 | Flagging reversed; requires substantive evidence |

---

## AI Assistant Constitutional Behavior

The AI assistant operates under strict constitutional guidelines:

### Required Behaviors

1. **Reference Principles by ID**
   - Use format: "Under P4: Contradiction Detection Primacy..."
   - Educate users about relevant principles

2. **Maintain Constitutional Awareness**
   - Every analysis explains which principles apply
   - Flag potential violations to users

3. **Conversational + Rigorous**
   - Friendly, accessible tone
   - Never compromise on constitutional standards
   - Explain legal concepts in plain language

4. **Transparency**
   - Acknowledge limitations
   - Explain when falling back to dev/stub modes
   - Never hide inconvenient findings

### Sample Constitutional Responses

**User asks about verification:**
> "I can verify your document using Nine-Brains forensic analysis (P5: Multi-Perspective). This includes the contradiction engine (P4) and 8 other independent validators, meeting P7: Legal Standard Compliance for court submission."

**User asks about privacy:**
> "Under P8: Privacy & Confidentiality, all processing happens in YOUR browser. No document content ever sent to servers. You maintain complete control."

**User asks about contradictions:**
> "Under P4: Contradiction Detection Primacy, contradictions are the key evidence. I use an enhanced engine that detects 5 types: temporal, factual, entity, admission-denial, and numerical contradictions."

---

## Technical Implementation

### File Locations

- **Constitution JSON:** `/web/data/constitution.json`
- **Contradiction Engine:** `/web/js/contradiction-engine.js`
- **Nine-Brains (Enhanced):** `/web/js/nine-brains.js`
- **Assistant (Constitutional):** `/web/js/assistant.js`

### Key Functions

```javascript
// Load constitution
await loadConstitution()

// Check constitutional compliance
checkConstitutionalCompliance(analysisType, data)

// Run enhanced contradiction engine
await runContradictionEngine(documents)

// Nine-Brains with constitutional checking
await runNineBrains({ file, arrayBuffer, text, metadata, caseFiles })
```

### Constitutional Compliance Checks

Every Nine-Brains analysis automatically checks:
- ✅ P1: All contradictions documented?
- ✅ P3: Explanations provided?
- ✅ P4: Contradiction analysis performed (if multi-doc)?
- ✅ P5: All 9 modules executed?

Results include:
```javascript
{
  constitutional: true/false,
  violations: [...],
  compliances: [...],
  constitutionalNotes: [...]
}
```

---

## Version History

### v1.0.0 (2025-10-26)
- Initial release of Constitutional Framework
- 10 core principles established
- Contradiction Engine rules defined
- Integration with Nine-Brains system
- AI assistant constitutional behavior specified

---

## For Developers

### Adding New Analysis Modules

New modules (Brain 10+) must:
1. Return `{ brain, vote, score, notes }`
2. Reference applicable constitutional principle(s)
3. Provide detailed notes (P3: Right to Explanation)
4. Document all findings (P1: Truth Above All)

### Modifying Existing Modules

Changes must:
1. Maintain constitutional compliance
2. Preserve or enhance truth-seeking capabilities
3. Not weaken contradiction detection (P4)
4. Document rationale for changes

### Testing Constitutional Compliance

```javascript
// Test that contradictions are surfaced (P1, P4)
const result = await runContradictionEngine([doc1, doc2]);
assert(result.contradictions.length > 0);
assert(result.contradictions[0].documented === true);

// Test multi-perspective requirement (P5)
const nineBrains = await runNineBrains({...});
assert(nineBrains.totalBrains === 9);
assert(nineBrains.constitutional === true);
```

---

## Legal Disclaimer

The Constitutional Framework provides rigorous forensic analysis designed to meet legal evidentiary standards. However:

- **Not legal advice:** This system provides document verification, not legal counsel
- **Human review required:** All flagged documents require professional review
- **Jurisdiction-specific:** Legal standards vary by jurisdiction
- **Technology limitations:** No automated system is perfect

**Always consult qualified legal professionals for legal matters.**

---

## Contact & Contributions

- **Issues:** Report constitutional violations or bugs
- **Improvements:** Suggest enhancements that maintain principles
- **Questions:** Ask about specific constitutional applications

**The Constitutional Principles (P1-P10) are immutable. Implementation details may evolve to better serve these principles.**

---

**Verum Omnis** — *The Whole Truth*  
Patent Pending
