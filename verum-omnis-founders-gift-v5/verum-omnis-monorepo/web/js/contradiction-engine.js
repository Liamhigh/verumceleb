/**
 * Enhanced Contradiction Engine - Verum Omnis
 * Constitutional Framework Compliant
 * 
 * This engine implements P4: Contradiction Detection Primacy
 * All analysis must pass through constitutional filters
 */

import constitution from '../data/constitution.json' assert { type: 'json' };

// ═══════════════════════════════════════════════════════════════
// Constitutional Principle Checker
// ═══════════════════════════════════════════════════════════════
export function checkConstitutionalCompliance(analysisType, data) {
  const violations = [];
  const compliances = [];
  
  // P1: Truth Above All - no omissions
  if (data.contradictions && data.contradictions.length > 0 && !data.contradictions[0].documented) {
    violations.push({
      principle: 'P1',
      violation: 'Contradictions detected but not fully documented',
      severity: 'critical'
    });
  } else if (data.contradictions) {
    compliances.push({
      principle: 'P1',
      status: 'All contradictions fully documented'
    });
  }
  
  // P3: Right to Explanation
  if (!data.notes || data.notes.length === 0) {
    violations.push({
      principle: 'P3',
      violation: 'No explanation provided for analysis',
      severity: 'major'
    });
  } else {
    compliances.push({
      principle: 'P3',
      status: 'Detailed explanation provided'
    });
  }
  
  // P4: Contradiction Detection Primacy
  if (analysisType === 'multi-document' && !data.contradictionAnalysisPerformed) {
    violations.push({
      principle: 'P4',
      violation: 'Multi-document analysis without contradiction detection',
      severity: 'critical'
    });
  } else if (analysisType === 'multi-document') {
    compliances.push({
      principle: 'P4',
      status: 'Contradiction analysis performed as required'
    });
  }
  
  // P5: Multi-Perspective Analysis (for Nine-Brains results)
  if (data.totalBrains && data.totalBrains < 9) {
    violations.push({
      principle: 'P5',
      violation: `Only ${data.totalBrains} analysis modules used (9 required)`,
      severity: 'major'
    });
  } else if (data.totalBrains) {
    compliances.push({
      principle: 'P5',
      status: 'All 9 independent analysis modules executed'
    });
  }
  
  return { violations, compliances, constitutional: violations.length === 0 };
}

// ═══════════════════════════════════════════════════════════════
// Enhanced Contradiction Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Temporal Contradictions: Same event, different times
 */
export function detectTemporalContradictions(documents) {
  const contradictions = [];
  
  // Extract event-time pairs from all documents
  const eventPattern = /(\w+(?:\s+\w+){0,5})\s+(?:on|at|during)\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/gi;
  
  const eventsByDoc = documents.map(doc => {
    const events = [];
    let match;
    while ((match = eventPattern.exec(doc.text)) !== null) {
      events.push({
        event: match[1].trim().toLowerCase(),
        time: match[2].trim(),
        source: doc.filename,
        position: match.index
      });
    }
    return { filename: doc.filename, events };
  });
  
  // Cross-compare events
  for (let i = 0; i < eventsByDoc.length; i++) {
    for (let j = i + 1; j < eventsByDoc.length; j++) {
      const doc1 = eventsByDoc[i];
      const doc2 = eventsByDoc[j];
      
      for (const event1 of doc1.events) {
        for (const event2 of doc2.events) {
          // Similar event name but different time
          if (similarStrings(event1.event, event2.event, 0.8) && event1.time !== event2.time) {
            contradictions.push({
              type: 'temporal',
              severity: 'major',
              event: event1.event,
              time1: event1.time,
              time2: event2.time,
              source1: event1.source,
              source2: event2.source,
              principle: 'P4',
              explanation: `Event "${event1.event}" dated "${event1.time}" in ${event1.source} but "${event2.time}" in ${event2.source}`
            });
          }
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Factual Contradictions: X is true vs X is false
 */
export function detectFactualContradictions(documents) {
  const contradictions = [];
  
  // Extract claims (subject-verb-object patterns)
  const claimPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(is|was|has|had|will|would|can|could|does|did)\s+(not\s+)?(\w+(?:\s+\w+){0,5})/gi;
  
  const claimsByDoc = documents.map(doc => {
    const claims = [];
    let match;
    while ((match = claimPattern.exec(doc.text)) !== null) {
      claims.push({
        subject: match[1].trim(),
        verb: match[2].trim(),
        negation: match[3] ? true : false,
        predicate: match[4].trim(),
        fullClaim: match[0].trim(),
        source: doc.filename,
        position: match.index
      });
    }
    return { filename: doc.filename, claims };
  });
  
  // Find contradictory claims
  for (let i = 0; i < claimsByDoc.length; i++) {
    for (let j = i + 1; j < claimsByDoc.length; j++) {
      const doc1 = claimsByDoc[i];
      const doc2 = claimsByDoc[j];
      
      for (const claim1 of doc1.claims) {
        for (const claim2 of doc2.claims) {
          // Same subject and predicate, but opposite negation
          if (
            similarStrings(claim1.subject, claim2.subject, 0.9) &&
            similarStrings(claim1.predicate, claim2.predicate, 0.8) &&
            claim1.negation !== claim2.negation
          ) {
            contradictions.push({
              type: 'factual',
              severity: 'critical',
              subject: claim1.subject,
              claim1: claim1.fullClaim,
              claim2: claim2.fullClaim,
              source1: claim1.source,
              source2: claim2.source,
              principle: 'P4',
              explanation: `Contradictory claims: "${claim1.fullClaim}" (${claim1.source}) vs "${claim2.fullClaim}" (${claim2.source})`
            });
          }
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Entity Contradictions: Same entity, different attributes
 */
export function detectEntityContradictions(documents) {
  const contradictions = [];
  
  // Extract entity-attribute pairs (e.g., "John Smith, age 45" vs "John Smith, age 47")
  const entityAttrPattern = /([A-Z][a-z]+\s+[A-Z][a-z]+).*?(\d+\s+years?\s+old|age\s+\d+|born\s+in\s+\d{4})/gi;
  
  const entitiesByDoc = documents.map(doc => {
    const entities = [];
    let match;
    while ((match = entityAttrPattern.exec(doc.text)) !== null) {
      entities.push({
        name: match[1].trim(),
        attribute: match[2].trim(),
        source: doc.filename,
        context: doc.text.substring(Math.max(0, match.index - 50), Math.min(doc.text.length, match.index + 100))
      });
    }
    return { filename: doc.filename, entities };
  });
  
  // Find conflicting attributes for same entity
  for (let i = 0; i < entitiesByDoc.length; i++) {
    for (let j = i + 1; j < entitiesByDoc.length; j++) {
      const doc1 = entitiesByDoc[i];
      const doc2 = entitiesByDoc[j];
      
      for (const entity1 of doc1.entities) {
        for (const entity2 of doc2.entities) {
          if (
            similarStrings(entity1.name, entity2.name, 0.9) &&
            entity1.attribute !== entity2.attribute
          ) {
            contradictions.push({
              type: 'entity',
              severity: 'major',
              entity: entity1.name,
              attribute1: entity1.attribute,
              attribute2: entity2.attribute,
              source1: entity1.source,
              source2: entity2.source,
              principle: 'P4',
              explanation: `Entity "${entity1.name}" has conflicting attributes: "${entity1.attribute}" (${entity1.source}) vs "${entity2.attribute}" (${entity2.source})`
            });
          }
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Admission vs Denial Contradictions
 */
export function detectAdmissionDenialContradictions(documents) {
  const contradictions = [];
  
  // Extract admissions and denials
  const admissionPattern = /\b(I|we|he|she|they)\s+(admit|acknowledge|confess|accept)\s+(?:that\s+)?([^.!?]{10,100})/gi;
  const denialPattern = /\b(I|we|he|she|they)\s+(deny|dispute|reject|refute)\s+(?:that\s+)?([^.!?]{10,100})/gi;
  
  const statementsByDoc = documents.map(doc => {
    const admissions = [];
    const denials = [];
    
    let match;
    while ((match = admissionPattern.exec(doc.text)) !== null) {
      admissions.push({
        subject: match[1],
        verb: match[2],
        content: match[3].trim(),
        source: doc.filename
      });
    }
    
    while ((match = denialPattern.exec(doc.text)) !== null) {
      denials.push({
        subject: match[1],
        verb: match[2],
        content: match[3].trim(),
        source: doc.filename
      });
    }
    
    return { filename: doc.filename, admissions, denials };
  });
  
  // Find admission in one doc, denial in another
  for (let i = 0; i < statementsByDoc.length; i++) {
    for (let j = 0; j < statementsByDoc.length; j++) {
      if (i === j) continue;
      
      const doc1 = statementsByDoc[i];
      const doc2 = statementsByDoc[j];
      
      for (const admission of doc1.admissions) {
        for (const denial of doc2.denials) {
          if (similarStrings(admission.content, denial.content, 0.7)) {
            contradictions.push({
              type: 'admission-denial',
              severity: 'critical',
              admission: admission.content,
              denial: denial.content,
              source1: admission.source,
              source2: denial.source,
              principle: 'P4',
              explanation: `Contradictory statements: Admission in ${admission.source} ("${admission.verb} ${admission.content}") vs Denial in ${denial.source} ("${denial.verb} ${denial.content}")`
            });
          }
        }
      }
    }
  }
  
  return contradictions;
}

/**
 * Numerical Contradictions: Same ID, different amounts
 */
export function detectNumericalContradictions(documents) {
  const contradictions = [];
  
  // Extract ID-amount pairs
  const idAmountPattern = /([A-Z]{2,}\d{4,}|\b\d{4,}\b)[^\$]*?\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
  
  const amountsByDoc = documents.map(doc => {
    const amounts = [];
    let match;
    while ((match = idAmountPattern.exec(doc.text)) !== null) {
      amounts.push({
        id: match[1].trim(),
        amount: match[2].replace(/,/g, ''),
        source: doc.filename
      });
    }
    return { filename: doc.filename, amounts };
  });
  
  // Find same ID with different amounts
  for (let i = 0; i < amountsByDoc.length; i++) {
    for (let j = i + 1; j < amountsByDoc.length; j++) {
      const doc1 = amountsByDoc[i];
      const doc2 = amountsByDoc[j];
      
      for (const amt1 of doc1.amounts) {
        for (const amt2 of doc2.amounts) {
          if (amt1.id === amt2.id && amt1.amount !== amt2.amount) {
            contradictions.push({
              type: 'numerical',
              severity: 'critical',
              id: amt1.id,
              amount1: amt1.amount,
              amount2: amt2.amount,
              source1: amt1.source,
              source2: amt2.source,
              principle: 'P4',
              explanation: `ID ${amt1.id} has conflicting amounts: $${amt1.amount} (${amt1.source}) vs $${amt2.amount} (${amt2.source})`
            });
          }
        }
      }
    }
  }
  
  return contradictions;
}

// ═══════════════════════════════════════════════════════════════
// Master Contradiction Engine
// ═══════════════════════════════════════════════════════════════
export async function runContradictionEngine(documents) {
  if (!documents || documents.length < 2) {
    return {
      contradictions: [],
      summary: 'Single document - no cross-document contradictions possible',
      constitutional: true,
      contradictionAnalysisPerformed: false
    };
  }
  
  const allContradictions = [
    ...detectTemporalContradictions(documents),
    ...detectFactualContradictions(documents),
    ...detectEntityContradictions(documents),
    ...detectAdmissionDenialContradictions(documents),
    ...detectNumericalContradictions(documents)
  ];
  
  // Sort by severity
  const severityOrder = { critical: 0, major: 1, minor: 2 };
  allContradictions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  // Document all contradictions (P1: Truth Above All)
  const documented = allContradictions.map(c => ({
    ...c,
    documented: true,
    timestamp: new Date().toISOString()
  }));
  
  // Build summary
  const criticalCount = documented.filter(c => c.severity === 'critical').length;
  const majorCount = documented.filter(c => c.severity === 'major').length;
  const minorCount = documented.filter(c => c.severity === 'minor').length;
  
  let summary = `Analyzed ${documents.length} documents. `;
  if (documented.length === 0) {
    summary += 'No contradictions detected.';
  } else {
    summary += `Found ${documented.length} contradiction(s): ${criticalCount} critical, ${majorCount} major, ${minorCount} minor.`;
  }
  
  // Check constitutional compliance
  const compliance = checkConstitutionalCompliance('multi-document', {
    contradictions: documented,
    contradictionAnalysisPerformed: true,
    notes: [summary]
  });
  
  return {
    contradictions: documented,
    summary,
    criticalCount,
    majorCount,
    minorCount,
    totalCount: documented.length,
    constitutional: compliance.constitutional,
    compliance,
    contradictionAnalysisPerformed: true,
    timestamp: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════
function similarStrings(str1, str2, threshold = 0.8) {
  if (!str1 || !str2) return false;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return true;
  
  // Simple similarity: character overlap ratio
  const set1 = new Set(s1.split(''));
  const set2 = new Set(s2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const similarity = intersection.size / union.size;
  return similarity >= threshold;
}
