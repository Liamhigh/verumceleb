"use client";
import { useState } from "react";
import { extractPdfTextAll, sha512Hex, makeSealedCoverPdf } from "@/lib/pdf";

export default function PdfReader() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const [pages, setPages] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [sealed, setSealed] = useState<Uint8Array | null>(null);
  const [useOCR, setUseOCR] = useState(true);
  const [progress, setProgress] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [ocrPagesProcessed, setOcrPagesProcessed] = useState<number>(0);
  const [documentReadComplete, setDocumentReadComplete] = useState(false);

  async function run() {
    if (!file) return;
    setBusy(true);
    setDocumentReadComplete(false);
    setOcrPagesProcessed(0);
    setProgress("📄 Reading file...");
    try {
      const buf = await file.arrayBuffer();
      setProgress("🔐 Computing SHA-512 hash...");
      const h = await sha512Hex(buf);
      setHash(h);
      setProgress("📖 Extracting text from PDF pages...");
      const { text: extractedText, pages: pageCount, ocrPagesCount } = await extractPdfTextAll(buf, { 
        ocr: useOCR,
        onProgress: (msg) => {
          setProgress(msg);
          // Track OCR progress
          if (msg.includes("OCR page")) {
            const match = msg.match(/OCR page \d+ \((\d+)\/(\d+)\)/);
            if (match) {
              setOcrPagesProcessed(parseInt(match[1]));
            }
          }
        }
      });
      setText(extractedText.slice(0, 120000));
      setPages(pageCount);
      setDocumentReadComplete(true);
      if (ocrPagesCount > 0) {
        setProgress(`✅ Document read complete! ${ocrPagesCount} pages processed with OCR.`);
      } else {
        setProgress("✅ Document read complete! All pages extracted.");
      }
      
      // Generate QR code preview for the hash
      const QRCode = (await import("qrcode")).default;
      const qrUrl = await QRCode.toDataURL(h, {
        margin: 1,
        width: 200,
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(qrUrl);
    } catch (error: any) {
      setProgress("❌ Error: " + error.message);
      console.error(error);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(""), 3000);
    }
  }

  async function buildSeal() {
    if (!file || !hash) return;
    setBusy(true);
    setProgress("🔒 Building sealed cover PDF with watermark and QR code...");
    try {
      const now = new Date().toISOString();
      const bytes = await makeSealedCoverPdf({ filename: file.name, sha512Hex: hash, when: now });
      setSealed(new Uint8Array(bytes.buffer.slice(0)));
      setProgress("✅ Sealed PDF ready with QR code!");
    } catch (error: any) {
      setProgress("❌ Error: " + error.message);
      console.error(error);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(""), 3000);
    }
  }

  function download(name: string, data: BlobPart, type: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function downloadReport() {
    if (!file || !hash) return;
    const report = {
      version: "1.0",
      generated_at: new Date().toISOString(),
      filename: file.name,
      size_bytes: file.size,
      mime: file.type,
      sha512_hex: hash,
      page_count: pages,
      ocr_applied: useOCR,
      preview_sample: text.slice(0, 2000)
    };
    download("forensic-report.json", JSON.stringify(report, null, 2), "application/json");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
        />
        <label className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <input 
            type="checkbox" 
            checked={useOCR} 
            onChange={e => setUseOCR(e.target.checked)}
            className="rounded"
          />
          <span>
            OCR image pages
            {useOCR && <span className="ml-1 text-xs text-green-600 dark:text-green-400">✓ Enabled</span>}
          </span>
        </label>
        <button 
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
          onClick={run} 
          disabled={!file || busy}
        >
          {busy ? "Processing..." : "Process PDF"}
        </button>
      </div>

      {/* Progress and Status Indicators */}
      {progress && (
        <div className="text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">⏳</span>
            <span className="text-blue-800 dark:text-blue-200">{progress}</span>
          </div>
          {ocrPagesProcessed > 0 && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              🔍 OCR Processing: {ocrPagesProcessed} pages analyzed
            </div>
          )}
        </div>
      )}

      {/* Document Read Success Banner */}
      {documentReadComplete && !busy && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <span className="text-lg">✅</span>
            <div>
              <div className="font-semibold">Document Reading Complete!</div>
              <div className="text-xs mt-1">
                📄 {pages} pages extracted • 🔐 SHA-512 computed • {useOCR ? "🔍 OCR applied" : "📖 Text-based PDF"}
              </div>
            </div>
          </div>
        </div>
      )}

      {hash && (
        <div className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
          <div className="font-mono">
            <span className="font-semibold text-gray-700 dark:text-gray-300">SHA-512 Hash:</span>
            <code className="block mt-1 break-all text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded">{hash}</code>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Pages:</span> {pages}
          </div>
          
          {/* QR Code Preview */}
          {qrDataUrl && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📱 QR Code Preview (SHA-512 Hash)
              </div>
              <div className="flex items-start gap-4">
                <img 
                  src={qrDataUrl} 
                  alt="QR Code for SHA-512 hash" 
                  className="w-32 h-32 border border-gray-300 dark:border-gray-600 rounded"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                  <p className="mb-2">✅ This QR code contains the full SHA-512 hash and will be embedded in your sealed PDF.</p>
                  <p>📱 Scan with any QR reader to verify the document fingerprint.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button 
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs font-medium transition"
              onClick={() => download("SHA512SUMS.txt", `${hash} *${file?.name}\n`, "text/plain")}
            >
              📄 Download SHA512SUMS.txt
            </button>
            <button 
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs font-medium transition"
              onClick={downloadReport}
            >
              📊 Download report.json
            </button>
            <button 
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium transition"
              onClick={buildSeal}
              disabled={busy}
            >
              🔒 Make sealed cover PDF (with QR)
            </button>
            {sealed && (
              <button 
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition animate-pulse"
                onClick={() => download("sealed-cover.pdf", sealed as any, "application/pdf")}
              >
                ⬇️ Download sealed PDF (includes QR code)
              </button>
            )}
          </div>
        </div>
      )}

      <textarea 
        className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm font-mono bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Extracted text will appear here... (PDF.js text extraction + optional Tesseract OCR)"
        value={text}
        readOnly
      />
    </div>
  );
}
