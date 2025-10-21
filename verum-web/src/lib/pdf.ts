// pdf.ts: client-only helpers for PDF processing
// Uses dynamic imports to keep SSR happy

export async function sha512Hex(buf: ArrayBuffer): Promise<string> {
  const h = await crypto.subtle.digest("SHA-512", buf);
  return [...new Uint8Array(h)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function extractPdfTextAll(
  buf: ArrayBuffer,
  opts: { ocr?: boolean; onProgress?: (msg: string) => void } = {}
): Promise<{ text: string; pages: number; ocrPagesCount: number }> {
  const pdfjs = await import("pdfjs-dist");
  
  // Set worker source to local file
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  }

  opts.onProgress?.("Loading PDF document...");
  const loading = pdfjs.getDocument({ data: buf });
  const doc = await loading.promise;
  const pages = doc.numPages;

  opts.onProgress?.(`Extracting text from ${pages} pages...`);
  const perPage: string[] = [];
  
  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    const txt = (textContent.items || [])
      .map((i: any) => i.str)
      .join(" ");
    perPage.push(txt.trim());
    opts.onProgress?.(`Extracted page ${p}/${pages}`);
  }

  // OCR for image-based pages
  let ocrPagesCount = 0;
  if (opts.ocr) {
    const emptyPages = perPage
      .map((t, i) => ({ i, t }))
      .filter(({ t }) => t.length < 8)
      .map(({ i }) => i + 1);

    if (emptyPages.length > 0) {
      ocrPagesCount = emptyPages.length;
      opts.onProgress?.(`Running OCR on ${emptyPages.length} image page(s)...`);
      const ocrText = await ocrPages(doc, emptyPages, opts.onProgress);
      for (const { index, text } of ocrText) {
        perPage[index - 1] = text;
      }
    }
  }

  return { text: perPage.join("\n\n"), pages, ocrPagesCount };
}

async function ocrPages(
  doc: any,
  pageNums: number[],
  onProgress?: (msg: string) => void
): Promise<{ index: number; text: string }[]> {
  const Tesseract = (await import("tesseract.js")).default;
  const out: { index: number; text: string }[] = [];
  
  for (let i = 0; i < pageNums.length; i++) {
    const pn = pageNums[i];
    onProgress?.(`OCR page ${pn} (${i + 1}/${pageNums.length})...`);
    
    const page = await doc.getPage(pn);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    const { data } = await Tesseract.recognize(canvas, "eng", {
      logger: () => {} // Suppress Tesseract logs
    });
    
    out.push({ index: pn, text: data.text.trim() });
  }
  
  return out;
}

export async function makeSealedCoverPdf(opts: {
  filename: string;
  sha512Hex: string;
  when: string;
}): Promise<Uint8Array> {
  const PDFLib = await import("pdf-lib");
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  // Header
  page.drawText("Verum Forensic Seal", {
    x: 50,
    y: 780,
    size: 20,
    font,
    color: rgb(0.1, 0.1, 0.3),
  });

  // File info
  page.drawText(`File: ${opts.filename}`, {
    x: 50,
    y: 740,
    size: 12,
    font,
  });

  // SHA-512
  page.drawText("SHA-512:", { x: 50, y: 720, size: 12, font });
  drawWrapped(page, opts.sha512Hex, {
    x: 120,
    y: 720,
    width: 430,
    font,
    size: 10,
  });

  // Timestamp
  page.drawText(`Generated: ${opts.when}`, {
    x: 50,
    y: 660,
    size: 12,
    font,
  });

  // QR Code - generate as data URL directly (no canvas needed)
  const QRCode = (await import("qrcode")).default;
  
  // Generate QR code as PNG data URL
  const qrDataUrl = await QRCode.toDataURL(opts.sha512Hex, {
    margin: 1,
    width: 140,
    errorCorrectionLevel: 'M',
  });
  
  const png = await pdf.embedPng(qrDataUrl);
  page.drawImage(png, {
    x: 50,
    y: 500,
    width: 140,
    height: 140,
  });

  const bytes = await pdf.save();
  return new Uint8Array(bytes);
}

function drawWrapped(
  page: any,
  text: string,
  {
    x,
    y,
    width,
    size,
    font,
    leading = 14,
  }: {
    x: number;
    y: number;
    width: number;
    size: number;
    font: any;
    leading?: number;
  }
) {
  const measure = (s: string) => font.widthOfTextAtSize(s, size);
  let line = "";
  let yy = y;
  
  for (const ch of text) {
    if (measure(line + ch) > width) {
      page.drawText(line, { x, y: yy, size, font });
      yy -= leading;
      line = ch;
    } else {
      line += ch;
    }
  }
  
  if (line) {
    page.drawText(line, { x, y: yy, size, font });
  }
}
