import PDFDocument from 'pdfkit'; import fs from 'fs'; import path from 'path';
export async function makeSealedPdf({ hash, title, notes, logoPath || path.join(path.dirname(new URL(import.meta.url).pathname),'..','web','assets','logo_black.png') }){
  const doc = new PDFDocument({ size:'A4', margins:{top:56,left:56,right:56,bottom:56} });
  if (fs.existsSync(logoPath || path.join(path.dirname(new URL(import.meta.url).pathname),'..','web','assets','logo_black.png'))) { const { width } = doc.page; doc.image(logoPath || path.join(path.dirname(new URL(import.meta.url).pathname),'..','web','assets','logo_black.png'), (width-120)/2, 24, { width:120 }); }
  doc.moveDown(3).fontSize(18).text(title||'Seal', {align:'center'}).moveDown(1);
  doc.fontSize(10).text('SHA-512: ' + hash);
  if (notes) doc.moveDown(0.5).text('Notes: ' + notes);
  doc.end(); return doc;
}