import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export async function makeSealedPdf(opts = {}) {
  const { hash, title, notes, logoPath, watermarkPath, badgePath, qrPayload } = opts;
  const assetsDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'assets', 'branding');
  const defaultLogoPath = path.join(assetsDir, 'vo-logo-3d-full.png');
  const defaultWatermarkPath = path.join(assetsDir, 'vo-watermark-3d.png');
  const defaultBadgePath = path.join(assetsDir, 'vo-badge-check.png');
  
  const logo = logoPath || defaultLogoPath;
  const watermark = watermarkPath || defaultWatermarkPath;
  const badge = badgePath || defaultBadgePath;

  const doc = new PDFDocument({ size: 'A4', margins: { top: 56, left: 56, right: 56, bottom: 56 } });

  // Center watermark (low opacity, behind content)
  if (fs.existsSync(watermark)) {
    const { width, height } = doc.page;
    doc.save();
    doc.opacity(0.12);
    doc.image(watermark, (width - 480) / 2, (height - 480) / 2, { width: 480 });
    doc.restore();
  }

  // Header logo (top-center)
  if (fs.existsSync(logo)) {
    const { width } = doc.page;
    doc.image(logo, (width - 120) / 2, 24, { width: 120 });
  }

  // Title and body
  doc.moveDown(3).fontSize(18).text(title || 'Seal', { align: 'center' }).moveDown(1);
  doc.fontSize(10).text('SHA-512: ' + (hash || ''));
  if (notes) doc.moveDown(0.5).text('Notes: ' + notes);

  // Bottom-right certification block with badge, QR, and hash
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const blockX = pageWidth - 200;
  const blockY = pageHeight - 200;

  // Add badge check mark
  if (fs.existsSync(badge)) {
    doc.image(badge, blockX + 10, blockY, { width: 40 });
  }

  // Add certification text with "✔ Patent Pending Verum Omnis"
  doc.fontSize(8).text('✔ Patent Pending', blockX + 55, blockY + 5);
  doc.text('Verum Omnis', blockX + 55, blockY + 18);
  doc.fontSize(7).text('Sealed: ' + new Date().toISOString().split('T')[0], blockX + 55, blockY + 33);

  // Add QR code if payload provided
  if (qrPayload) {
    try {
      const qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', margin: 1, width: 160 });
      const qrWidth = 90;
      doc.image(qrBuffer, blockX + 10, blockY + 55, { width: qrWidth });
      doc.fontSize(6).text('Scan to verify', blockX + 15, blockY + 150, { width: 80, align: 'center' });
    } catch (e) {
      // continue without QR if generation fails
      // eslint-disable-next-line no-console
      console.error('QR generation failed', e);
    }
  }

  doc.end();
  return doc;
}