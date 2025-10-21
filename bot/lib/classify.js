export function classifyByHeuristics({ filename, mime, textHead }) {
  const name = filename.toLowerCase();

  const has = (re) => re.test(textHead || "");

  // quick heuristics
  if (has(/\baffidavit\b|\bsworn statement\b|\bcommissioner of oaths\b/i)) return "legal_affidavit";
  if (has(/\binvoice\b|\bvat\b|\btax invoice\b|\bsubtotal\b|\baccount number\b/i)) return "invoice_or_receipt";
  if (has(/\bfirebase\b|\bandroid\b|\bgradle\b|\bjson\b|\bconfig\b|\bapi key\b/i)) return "technical_pdf";
  if (has(/\bterms and conditions\b|\bagreement\b|\bparty\b.*\bparty\b|\bindemnity\b/i)) return "legal_contract";

  // filename hints
  if (/affidavit|annexure|exhibit/.test(name)) return "legal_affidavit";
  if (/invoice|receipt|statement/.test(name)) return "invoice_or_receipt";
  if (/firebase|config|setup|deploy|readme/.test(name)) return "technical_pdf";

  // default
  return "general_pdf";
}
