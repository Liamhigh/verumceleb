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

  // Center watermark (logo at reduced opacity)
  if (fs.existsSync(logo)) {
    doc.save();
    const { width, height } = doc.page;
    doc.opacity(0.1);
    doc.image(logo, (width - 200) / 2, (height - 100) / 2, { width: 200 });
    doc.restore();
  }

  // Title and body
  doc.moveDown(3).fontSize(18).text(title || 'Seal', { align: 'center' }).moveDown(1);
  doc.fontSize(10).text('SHA-512: ' + (hash || ''));
  if (notes) doc.moveDown(0.5).text('Notes: ' + notes);

  // Bottom-right certification block with QR and Patent Pending notice
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const blockX = pageWidth - 180;
  const blockY = pageHeight - 160;
  
  // Draw Patent Pending block
  doc.fontSize(10).fillColor('#000000')
    .text('✔ Patent Pending', blockX, blockY, { width: 160, align: 'left' })
    .fontSize(8)
    .text('Verum Omnis', blockX, blockY + 15, { width: 160, align: 'left' });
  
  // Add QR code if payload provided
  if (qrPayload) {
    try {
      const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', margin: 1, width: 160 });
      const qrWidth = 100;
      const qrX = pageWidth - qrWidth - 60;
      const qrY = pageHeight - qrWidth - 60;
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