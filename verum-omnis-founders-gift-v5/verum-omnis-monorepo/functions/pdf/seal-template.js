import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export async function makeSealedPdf(opts = {}) {
  const { hash, title, notes, logoPath, qrPayload } = opts;
  const defaultLogoPath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'web', 'assets', 'logo_black.png');
  const logo = logoPath || defaultLogoPath;

  const doc = new PDFDocument({ size: 'A4', margins: { top: 56, left: 56, right: 56, bottom: 56 }, compress: false });

  const { width: pageWidth, height: pageHeight } = doc.page;

  // Header logo
  if (fs.existsSync(logo)) {
    doc.image(logo, (pageWidth - 120) / 2, 24, { width: 120 });
  }

  // Title and body
  doc.moveDown(3).fontSize(18).text(title || 'Seal', { align: 'center' }).moveDown(1);
  doc.fontSize(10).text('SHA-512: ' + (hash || ''));
  if (notes) doc.moveDown(0.5).text('Notes: ' + notes);

  // Centered watermark logo (ghosted behind content)
  if (fs.existsSync(logo)) {
    const watermarkSize = 200;
    const watermarkX = (pageWidth - watermarkSize) / 2;
    const watermarkY = (pageHeight - watermarkSize) / 2;
    doc.save();
    doc.opacity(0.1);
    doc.image(logo, watermarkX, watermarkY, { width: watermarkSize });
    doc.restore();
  }

  // Bottom-right: Patent Pending notice + QR
  const footerY = pageHeight - 120;
  doc.fontSize(8).fillColor('#666').text('✔ Patent Pending - Verum Omnis', pageWidth - 200, footerY, { width: 180, align: 'right' });

  // Truncated SHA-512 below patent notice
  if (hash) {
    const truncated = hash.substring(0, 16) + '…';
    doc.fontSize(7).text(truncated, pageWidth - 200, footerY + 12, { width: 180, align: 'right' });
  }

  // QR code at bottom-right if payload provided
  if (qrPayload) {
    try {
      const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', margin: 1, width: 160 });
      const qrWidth = 100;
      const qrX = pageWidth - qrWidth - 56;
      const qrY = pageHeight - qrWidth - 56;
      doc.image(qrBuffer, qrX, qrY, { width: qrWidth });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('QR generation failed', e);
    }
  }

  doc.end();
  return doc;
}