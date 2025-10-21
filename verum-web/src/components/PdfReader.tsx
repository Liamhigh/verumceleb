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

  async function run() {
    if (!file) return;
    setBusy(true);
    setProgress("Reading file...");
    try {
      const buf = await file.arrayBuffer();
      setProgress("Computing SHA-512...");
      const h = await sha512Hex(buf);
      setHash(h);
      setProgress("Extracting text from PDF...");
      const { text: extractedText, pages: pageCount } = await extractPdfTextAll(buf, { 
        ocr: useOCR,
        onProgress: (msg) => setProgress(msg)
      });
      setText(extractedText.slice(0, 120000));
      setPages(pageCount);
      setProgress("Done!");
    } catch (error: any) {
      setProgress("Error: " + error.message);
      console.error(error);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(""), 2000);
    }
  }

  async function buildSeal() {
    if (!file || !hash) return;
    setBusy(true);
    setProgress("Building sealed cover PDF...");
    try {
      const now = new Date().toISOString();
      const bytes = await makeSealedCoverPdf({ filename: file.name, sha512Hex: hash, when: now });
      setSealed(new Uint8Array(bytes.buffer.slice(0)));
      setProgress("Sealed PDF ready!");
    } catch (error: any) {
      setProgress("Error: " + error.message);
      console.error(error);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(""), 2000);
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
          <span>OCR image pages</span>
        </label>
        <button 
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
          onClick={run} 
          disabled={!file || busy}
        >
          {busy ? "Processing..." : "Process PDF"}
        </button>
      </div>

      {progress && (
        <div className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
          {progress}
        </div>
      )}

      {hash && (
        <div className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
          <div className="font-mono">
            <span className="font-semibold text-gray-700 dark:text-gray-300">SHA-512:</span>
            <code className="block mt-1 break-all text-gray-600 dark:text-gray-400">{hash}</code>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Pages:</span> {pages}
          </div>
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
              🔒 Make sealed cover PDF
            </button>
            {sealed && (
              <button 
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition"
                onClick={() => download("sealed-cover.pdf", sealed as any, "application/pdf")}
              >
                ⬇️ Download sealed-cover.pdf
              </button>
            )}
          </div>
        </div>
      )}

      <textarea 
        className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm font-mono bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Extracted text will appear here..."
        value={text}
        readOnly
      />
    </div>
  );
}
