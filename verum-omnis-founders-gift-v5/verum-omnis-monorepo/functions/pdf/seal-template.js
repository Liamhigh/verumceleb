import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export async function makeSealedPdf(opts = {}) {
  const { hash, title, notes, logoPath, qrPayload } = opts;
  const defaultLogoPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'web', 'assets', 'logo_black.png');
  const logo = logoPath || defaultLogoPath;

  const doc = new PDFDocument({ size: 'A4', margins: { top: 56, left: 56, right: 56, bottom: 56 } });

  // Header logo
  if (fs.existsSync(logo)) {
    const { width } = doc.page;
    doc.image(logo, (width - 120) / 2, 24, { width: 120 });
  }

  // Title and body
  doc.moveDown(3).fontSize(18).text(title || 'Seal', { align: 'center' }).moveDown(1);
  doc.fontSize(10).text('SHA-512: ' + (hash || ''));
  if (notes) doc.moveDown(0.5).text('Notes: ' + notes);

  // If a QR payload is provided, embed it as a PNG
  if (qrPayload) {
    try {
      const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', margin: 1, width: 160 });
      // place QR at bottom-right corner with some margin
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const qrWidth = 120;
      const qrX = pageWidth - qrWidth - 56; // right margin
      const qrY = pageHeight - qrWidth - 80; // above bottom margin
      doc.image(qrBuffer, qrX, qrY, { width: qrWidth });
    } catch (e) {
      // continue without QR if generation fails
      // eslint-disable-next-line no-console
      console.error('QR generation failed', e);
    }
  }

  doc.end();
  return doc;
}