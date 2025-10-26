/**
 * Case Manager & Evidence Manifest
 * Verum Omnis — Patent Pending
 * 
 * Manages multi-file cases with immutable evidence records,
 * chain-of-custody tracking, and audit logging.
 */

export class CaseManager {
  constructor() {
    this.caseId = `CASE-${Date.now()}`;
    this.files = new Map(); // filename → file record
    this.auditLog = [];
    this.startTime = new Date().toISOString();
  }

  /**
   * Add a file to the case with immutable evidence record
   */
  async addFile(file) {
    const sha512 = await this.computeSHA512(file);
    
    const record = {
      filename: file.name,
      size: file.size,
      mime: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
      sha512,
      sha512Truncated: sha512.slice(0, 16) + '...' + sha512.slice(-16),
      addedAt: new Date().toISOString(),
      file, // Keep reference to File object
      text: null,
      metadata: {},
      nineBrainsResults: null,
      status: 'added', // added → extracting → extracted → verifying → verified
    };
    
    this.files.set(file.name, record);
    this.logAudit('file_added', { filename: file.name, sha512, size: file.size });
    
    return record;
  }

  /**
   * Compute SHA-512 hash
   */
  async computeSHA512(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-512', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Log an audit event
   */
  logAudit(action, details) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      details,
    });
  }

  /**
   * Update file record with extraction results
   */
  setExtraction(filename, text, metadata) {
    const record = this.files.get(filename);
    if (!record) throw new Error(`File not found: ${filename}`);
    
    record.text = text;
    record.metadata = metadata;
    record.status = 'extracted';
    
    this.logAudit('text_extracted', { 
      filename, 
      textLength: text.length,
      ocrUsed: metadata?.ocrStats?.wasOcrNeeded || false,
    });
  }

  /**
   * Update file record with Nine-Brains verification results
   */
  setVerification(filename, nineBrainsResults) {
    const record = this.files.get(filename);
    if (!record) throw new Error(`File not found: ${filename}`);
    
    record.nineBrainsResults = nineBrainsResults;
    record.status = 'verified';
    
    this.logAudit('verified', { 
      filename, 
      consensus: nineBrainsResults.consensus,
      avgScore: nineBrainsResults.avgScore,
    });
  }

  /**
   * Get evidence manifest (all files with metadata)
   */
  getManifest() {
    return Array.from(this.files.values()).map(record => ({
      filename: record.filename,
      size: record.size,
      mime: record.mime,
      lastModified: record.lastModified,
      sha512: record.sha512,
      sha512Truncated: record.sha512Truncated,
      addedAt: record.addedAt,
      status: record.status,
      consensus: record.nineBrainsResults?.consensus || '—',
      avgScore: record.nineBrainsResults?.avgScore?.toFixed(2) || '—',
    }));
  }

  /**
   * Get all file records (full data)
   */
  getAllRecords() {
    return Array.from(this.files.values());
  }

  /**
   * Get audit trail
   */
  getAuditLog() {
    return this.auditLog;
  }

  /**
   * Export case data (for download)
   */
  exportCaseData() {
    return {
      caseId: this.caseId,
      startTime: this.startTime,
      fileCount: this.files.size,
      manifest: this.getManifest(),
      auditLog: this.auditLog,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get case summary stats
   */
  getCaseStats() {
    const records = Array.from(this.files.values());
    const verified = records.filter(r => r.status === 'verified');
    const passed = verified.filter(r => r.nineBrainsResults?.consensus === 'PASS');
    const flagged = verified.filter(r => r.nineBrainsResults?.consensus === 'FLAG');
    
    return {
      totalFiles: records.length,
      verified: verified.length,
      pending: records.length - verified.length,
      passed: passed.length,
      flagged: flagged.length,
      totalSize: records.reduce((sum, r) => sum + r.size, 0),
    };
  }
}

/**
 * Generate evidence manifest table HTML
 */
export function renderManifestTable(manifest) {
  if (manifest.length === 0) {
    return '<p class="text-slate-400">No files in case yet.</p>';
  }

  const rows = manifest.map(record => `
    <tr class="border-b border-slate-700 hover:bg-slate-800/50">
      <td class="px-3 py-2 text-xs truncate max-w-[200px]" title="${record.filename}">${record.filename}</td>
      <td class="px-3 py-2 text-xs text-slate-400">${formatBytes(record.size)}</td>
      <td class="px-3 py-2">
        <code class="text-xs text-blue-400" title="${record.sha512}">${record.sha512Truncated}</code>
      </td>
      <td class="px-3 py-2">
        <span class="px-2 py-1 text-xs rounded ${getStatusBadgeClass(record.status)}">
          ${record.status}
        </span>
      </td>
      <td class="px-3 py-2 text-center">
        <span class="px-2 py-1 text-xs rounded ${getConsensusBadgeClass(record.consensus)}">
          ${record.consensus}
        </span>
      </td>
      <td class="px-3 py-2 text-xs text-slate-400 text-center">${record.avgScore}</td>
    </tr>
  `).join('');

  return `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="text-xs uppercase bg-slate-800/50 text-slate-400">
          <tr>
            <th class="px-3 py-2">File</th>
            <th class="px-3 py-2">Size</th>
            <th class="px-3 py-2">SHA-512 (trunc)</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2 text-center">Consensus</th>
            <th class="px-3 py-2 text-center">Score</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getStatusBadgeClass(status) {
  const classes = {
    added: 'bg-blue-900/50 text-blue-300',
    extracting: 'bg-yellow-900/50 text-yellow-300',
    extracted: 'bg-purple-900/50 text-purple-300',
    verifying: 'bg-orange-900/50 text-orange-300',
    verified: 'bg-green-900/50 text-green-300',
  };
  return classes[status] || 'bg-slate-700 text-slate-300';
}

function getConsensusBadgeClass(consensus) {
  if (consensus === 'PASS') return 'bg-green-900/50 text-green-300';
  if (consensus === 'FLAG') return 'bg-red-900/50 text-red-300';
  return 'bg-slate-700 text-slate-400';
}

/**
 * Download case data as JSON
 */
export function downloadCaseData(caseManager) {
  const data = caseManager.exportCaseData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${caseManager.caseId}-manifest.json`;
  a.click();
  URL.revokeObjectURL(url);
}
