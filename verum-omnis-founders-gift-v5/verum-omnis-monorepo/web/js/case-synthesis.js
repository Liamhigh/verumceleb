/**
 * Case-Level Synthesis Engine
 * Verum Omnis — Patent Pending
 * 
 * Aggregates findings across all files in a case:
 * - Merged timeline
 * - Contradiction table
 * - Confession/admission mining
 * - Entity tracking
 * - Risk/confidence scoring
 */

/**
 * Build merged timeline from all files
 */
export function buildMergedTimeline(caseRecords) {
  const timeline = [];
  
  for (const record of caseRecords) {
    if (!record.text) continue;
    
    // Extract dates (same patterns as Brain 4)
    const datePatterns = [
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g,
      /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g,
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{1,2}),?\s+(\d{4})\b/gi,
    ];
    
    for (const pattern of datePatterns) {
      const matches = [...record.text.matchAll(pattern)];
      for (const match of matches) {
        try {
          const dateStr = match[0];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // Get context (50 chars before and after)
            const position = match.index;
            const context = record.text.slice(
              Math.max(0, position - 50),
              Math.min(record.text.length, position + dateStr.length + 50)
            );
            
            timeline.push({
              date,
              dateStr,
              filename: record.filename,
              context: context.trim(),
              position,
            });
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
    }
  }
  
  // Sort chronologically
  timeline.sort((a, b) => a.date - b.date);
  
  return timeline;
}

/**
 * Build contradiction table from all files
 */
export function buildContradictionTable(caseRecords) {
  const contradictions = [];
  
  // Collect all Nine-Brains results that include contradictions
  for (const record of caseRecords) {
    if (!record.nineBrainsResults) continue;
    
    const brain6 = record.nineBrainsResults.results.find(r => r.brain === 'Cross-Document Contradictions');
    if (brain6 && brain6.contradictions && brain6.contradictions.length > 0) {
      contradictions.push(...brain6.contradictions);
    }
  }
  
  return contradictions;
}

/**
 * Build confession/admission table from all files
 */
export function buildConfessionTable(caseRecords) {
  const admissions = [];
  const denials = [];
  const intents = [];
  
  for (const record of caseRecords) {
    if (!record.nineBrainsResults) continue;
    
    const brain7 = record.nineBrainsResults.results.find(r => r.brain === 'Confession/Admission/Denial Mining');
    if (brain7) {
      if (brain7.admissions) {
        for (const admission of brain7.admissions) {
          admissions.push({
            filename: record.filename,
            statement: admission,
          });
        }
      }
      if (brain7.denials) {
        for (const denial of brain7.denials) {
          denials.push({
            filename: record.filename,
            statement: denial,
          });
        }
      }
      if (brain7.intents) {
        for (const intent of brain7.intents) {
          intents.push({
            filename: record.filename,
            statement: intent,
          });
        }
      }
    }
  }
  
  return { admissions, denials, intents };
}

/**
 * Track entities across all files
 */
export function trackEntities(caseRecords) {
  const entityMap = {
    names: new Map(), // name → [filenames]
    ids: new Map(),
    amounts: new Map(),
    emails: new Map(),
  };
  
  for (const record of caseRecords) {
    if (!record.text) continue;
    
    // Extract entities (same patterns as Brain 5)
    const names = [...new Set((record.text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || []))];
    const ids = [...new Set((record.text.match(/\b[A-Z]{2,}\d{4,}\b/g) || []))];
    const amounts = [...new Set((record.text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || []))];
    const emails = [...new Set((record.text.match(/\b[\w.-]+@[\w.-]+\.\w+\b/g) || []))];
    
    // Add to maps
    for (const name of names) {
      if (!entityMap.names.has(name)) {
        entityMap.names.set(name, []);
      }
      entityMap.names.get(name).push(record.filename);
    }
    
    for (const id of ids) {
      if (!entityMap.ids.has(id)) {
        entityMap.ids.set(id, []);
      }
      entityMap.ids.get(id).push(record.filename);
    }
    
    for (const amount of amounts) {
      if (!entityMap.amounts.has(amount)) {
        entityMap.amounts.set(amount, []);
      }
      entityMap.amounts.get(amount).push(record.filename);
    }
    
    for (const email of emails) {
      if (!entityMap.emails.has(email)) {
        entityMap.emails.set(email, []);
      }
      entityMap.emails.get(email).push(record.filename);
    }
  }
  
  // Convert to arrays for easier display
  return {
    names: Array.from(entityMap.names.entries()).map(([name, files]) => ({ name, files: [...new Set(files)] })),
    ids: Array.from(entityMap.ids.entries()).map(([id, files]) => ({ id, files: [...new Set(files)] })),
    amounts: Array.from(entityMap.amounts.entries()).map(([amount, files]) => ({ amount, files: [...new Set(files)] })),
    emails: Array.from(entityMap.emails.entries()).map(([email, files]) => ({ email, files: [...new Set(files)] })),
  };
}

/**
 * Calculate case-level risk/confidence score
 */
export function calculateCaseScore(caseRecords) {
  if (caseRecords.length === 0) {
    return { risk: 0, confidence: 0, reasoning: ['No files analyzed'] };
  }
  
  const verified = caseRecords.filter(r => r.nineBrainsResults);
  
  if (verified.length === 0) {
    return { risk: 0, confidence: 0, reasoning: ['No verified files'] };
  }
  
  // Calculate average score across all files
  const avgScore = verified.reduce((sum, r) => sum + r.nineBrainsResults.avgScore, 0) / verified.length;
  
  // Count flags
  const flagged = verified.filter(r => r.nineBrainsResults.consensus === 'FLAG');
  const flagRatio = flagged.length / verified.length;
  
  // Risk score (0-100): higher = more suspicious
  const risk = Math.round((1 - avgScore) * 50 + flagRatio * 50);
  
  // Confidence score (0-100): how sure we are
  const confidence = Math.round(verified.length / caseRecords.length * avgScore * 100);
  
  const reasoning = [];
  
  if (flagRatio > 0.5) {
    reasoning.push(`⚠️ High flag rate: ${flagged.length}/${verified.length} files flagged`);
  }
  
  if (avgScore < 0.5) {
    reasoning.push(`⚠️ Low average score: ${(avgScore * 100).toFixed(1)}%`);
  }
  
  if (verified.length < caseRecords.length) {
    reasoning.push(`ℹ️ Only ${verified.length}/${caseRecords.length} files verified`);
  }
  
  if (risk < 30) {
    reasoning.push('✓ Low risk profile — documents appear authentic');
  } else if (risk < 60) {
    reasoning.push('⚠️ Moderate risk — review flagged items');
  } else {
    reasoning.push('🚨 High risk — significant issues detected');
  }
  
  return { risk, confidence, reasoning };
}

/**
 * Generate case-level synthesis report (object for PDF generation)
 */
export function generateCaseSynthesis(caseRecords) {
  const timeline = buildMergedTimeline(caseRecords);
  const contradictions = buildContradictionTable(caseRecords);
  const confessions = buildConfessionTable(caseRecords);
  const entities = trackEntities(caseRecords);
  const score = calculateCaseScore(caseRecords);
  
  return {
    timeline,
    contradictions,
    confessions,
    entities,
    score,
    fileCount: caseRecords.length,
    verifiedCount: caseRecords.filter(r => r.nineBrainsResults).length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Render timeline as HTML table
 */
export function renderTimelineTable(timeline) {
  if (timeline.length === 0) {
    return '<p class="text-slate-400">No dates extracted from case files.</p>';
  }
  
  const rows = timeline.slice(0, 50).map(event => `
    <tr class="border-b border-slate-700 hover:bg-slate-800/50">
      <td class="px-3 py-2 text-xs">${event.dateStr}</td>
      <td class="px-3 py-2 text-xs text-slate-400">${event.filename}</td>
      <td class="px-3 py-2 text-xs text-slate-300">${event.context}</td>
    </tr>
  `).join('');
  
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="text-xs uppercase bg-slate-800/50 text-slate-400">
          <tr>
            <th class="px-3 py-2">Date</th>
            <th class="px-3 py-2">Source</th>
            <th class="px-3 py-2">Context</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    ${timeline.length > 50 ? `<p class="text-xs text-slate-400 mt-2">Showing first 50 of ${timeline.length} events</p>` : ''}
  `;
}

/**
 * Render contradictions as HTML table
 */
export function renderContradictionsTable(contradictions) {
  if (contradictions.length === 0) {
    return '<p class="text-slate-400">No contradictions detected across case files.</p>';
  }
  
  const rows = contradictions.map(c => `
    <tr class="border-b border-slate-700 hover:bg-slate-800/50">
      <td class="px-3 py-2 text-xs">${c.file1}</td>
      <td class="px-3 py-2 text-xs">${c.file2}</td>
      <td class="px-3 py-2 text-xs text-slate-300">${c.claim}</td>
    </tr>
  `).join('');
  
  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="text-xs uppercase bg-slate-800/50 text-slate-400">
          <tr>
            <th class="px-3 py-2">File 1</th>
            <th class="px-3 py-2">File 2</th>
            <th class="px-3 py-2">Contradictory Claim</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Render confession/admission table as HTML
 */
export function renderConfessionTable(confessions) {
  const { admissions, denials, intents } = confessions;
  
  let html = '';
  
  if (admissions.length > 0) {
    html += '<h4 class="text-sm font-medium text-green-400 mt-4 mb-2">Admissions</h4>';
    html += '<ul class="space-y-2">';
    for (const a of admissions.slice(0, 10)) {
      html += `
        <li class="text-xs">
          <span class="text-slate-400">[${a.filename}]</span>
          <span class="text-slate-200">${a.statement}</span>
        </li>
      `;
    }
    html += '</ul>';
  }
  
  if (denials.length > 0) {
    html += '<h4 class="text-sm font-medium text-red-400 mt-4 mb-2">Denials</h4>';
    html += '<ul class="space-y-2">';
    for (const d of denials.slice(0, 10)) {
      html += `
        <li class="text-xs">
          <span class="text-slate-400">[${d.filename}]</span>
          <span class="text-slate-200">${d.statement}</span>
        </li>
      `;
    }
    html += '</ul>';
  }
  
  if (intents.length > 0) {
    html += '<h4 class="text-sm font-medium text-blue-400 mt-4 mb-2">Intent Statements</h4>';
    html += '<ul class="space-y-2">';
    for (const i of intents.slice(0, 10)) {
      html += `
        <li class="text-xs">
          <span class="text-slate-400">[${i.filename}]</span>
          <span class="text-slate-200">${i.statement}</span>
        </li>
      `;
    }
    html += '</ul>';
  }
  
  if (html === '') {
    return '<p class="text-slate-400">No admission/denial/intent statements detected.</p>';
  }
  
  return html;
}
