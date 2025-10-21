# OCR and Legal Case Report Features

## Overview

This document describes the newly implemented OCR (Optical Character Recognition) and Legal Case Report features in the Verum Omnis Assistant.

## 🔍 OCR Capabilities

### What's New

The assistant can now read text from:
- **Scanned PDFs** - Documents that contain only images (no text layer)
- **Photos of documents** - JPG, PNG, and other image formats
- **Mixed documents** - Attempts text extraction first, falls back to OCR if needed

### How It Works

1. **Automatic Detection**: When you upload a PDF, the system first tries to extract text using PDF.js
2. **OCR Fallback**: If little or no text is found, it automatically runs OCR using Tesseract.js
3. **Progress Updates**: You'll see real-time progress as each page is processed
4. **Image OCR**: Photos and images are processed directly with OCR

### Supported Formats

- **Documents**: PDF (text or scanned), TXT, MD, DOCX, RTF, ODT
- **Images**: JPG, JPEG, PNG, GIF, BMP, TIFF
- **Spreadsheets**: XLSX, CSV, ODS

### Technical Details

- **OCR Engine**: Tesseract.js v5 (client-side processing)
- **Language**: English (eng) - can be extended to other languages
- **Scale**: 2x resolution for better accuracy on scanned documents
- **Privacy**: All OCR processing happens in your browser - no server upload required

## ⚖️ Legal Case Report Generator

### What's New

Lawyers and legal professionals can now generate structured case reports from uploaded documents with:
- **Automatic extraction** of case numbers, parties, and dates
- **Document classification** (affidavit, contract, complaint, etc.)
- **Key findings** based on content analysis
- **Forensic verification** with SHA-512 hashing
- **Export capability** to JSON format

### How to Use

1. **Upload a legal document** (case file, affidavit, contract, etc.)
2. **Click "Generate Case Report"** button or type "generate case report"
3. **Review the structured analysis** including:
   - Document metadata (name, size, hash)
   - Extracted case details (case number, parties, dates)
   - Content summary
   - Key findings and flags
   - Forensic verification status
4. **Export or seal** the report for permanent record

### Report Contents

#### Document Information
- File name, size, and type
- Analysis timestamp
- SHA-512 cryptographic hash

#### Case Details (Automatically Extracted)
- **Case Number**: Detects patterns like "Case No. 126/4/2025", "Matter #1295911"
- **Parties**: Extracts plaintiff, defendant, applicant, respondent names
- **Dates**: Identifies key dates referenced in the document
- **Document Type**: Classifies as affidavit, contract, complaint, etc.

#### Content Summary
- First 500 characters of readable content
- Full text available for search and analysis

#### Key Findings
- Automatic flags for fraud mentions
- Contradiction detection
- Evidence identification
- Party count and date references

#### Forensic Verification
- ✅ Document cryptographically hashed (SHA-512)
- ✅ Timestamp recorded
- ✅ Immutable record maintained
- 🔗 Ready for blockchain anchoring

### Actions Available

From the case report, you can:
- **Anchor to Blockchain** - Create permanent timestamp proof
- **Generate Sealed PDF** - Create tamper-proof certificate with QR code
- **Export Report** - Download structured JSON data

### Document Classification

The system automatically detects:
- Legal affidavits / sworn statements
- Legal contracts and agreements
- Financial documents (invoices, receipts)
- Legal complaints and filings
- Policy documents
- Legal evidence and exhibits
- Motions and petitions
- General case files

### Privacy and Security

- All document analysis happens **client-side** in your browser
- No document content is sent to external servers (except for sealing/anchoring)
- SHA-512 hashes provide cryptographic proof without revealing content
- Forensic seals include QR codes for verification

## 🔗 QR Code Verification

### Enhanced Sealing

All sealed PDFs now include:
- **QR Code** with verification URL
- **Watermark** with Verum logo (10% opacity)
- **Patent Pending** notice
- **Truncated SHA-512** hash for quick reference
- **Full hash** in document metadata

### Verification URL Format

```
https://your-domain.com/verify.html?hash={SHA-512-hash}
```

When scanned, the QR code directs to a verification page where users can:
- Confirm the document hash
- Check blockchain anchor status
- View receipt metadata
- Validate document integrity

## 📋 Example Use Cases

### For Lawyers
1. **Client intake**: Upload client documents and generate case reports automatically
2. **Evidence management**: OCR scanned documents to make them searchable
3. **Court filings**: Seal documents with forensic proof before submission
4. **Case organization**: Generate structured reports for multiple documents

### For Citizens
1. **Legal disputes**: Upload contracts or correspondence for analysis
2. **Evidence preservation**: Seal important documents with timestamp proof
3. **Document verification**: Ensure documents haven't been tampered with

### For Institutions
1. **Compliance**: Create auditable trails for all legal documents
2. **Fraud detection**: Automatically flag suspicious patterns in documents
3. **Record keeping**: Generate structured reports for archives

## 🚀 Technical Implementation

### Frontend (Client-Side)
- **PDF.js**: Text extraction from PDF documents
- **Tesseract.js**: OCR for scanned PDFs and images
- **Web Crypto API**: SHA-512 hashing
- **Browser APIs**: File reading, canvas rendering for OCR

### Backend (Server-Side)
- **PDFKit**: Forensic seal generation
- **QRCode**: QR code generation for verification URLs
- **Express API**: Document sealing and anchoring endpoints
- **Firebase Functions**: Serverless deployment

### API Endpoints Used

- `POST /v1/seal` - Generate sealed PDF with QR code
  - Parameters: `hash`, `title`, `notes`, `qrPayload`
  - Returns: PDF stream with watermark and QR code
  
- `POST /v1/anchor` - Create blockchain anchor receipt
  - Parameters: `hash`
  - Returns: Receipt with timestamp and anchor request

- `POST /v1/contradict` - Detect contradictions in text
  - Parameters: `text`, `meta`, `timeline`
  - Returns: Findings array with contradiction analysis

## 🎯 Performance Considerations

### OCR Processing Time
- **Single page**: ~5-10 seconds
- **Multi-page PDF**: ~5-10 seconds per page
- **High-resolution images**: May take longer

### Tips for Best Results
1. Use high-quality scans (300 DPI or higher)
2. Ensure good lighting and contrast in photos
3. Keep images in focus
4. Straighten documents before scanning
5. Remove shadows and glare

## 🔐 Security Summary

All features maintain Verum Omnis's core security principles:
- **Immutable governance** - Constitutional rules cannot be overridden
- **Stateless design** - No PII storage on servers
- **Client-side processing** - OCR and hashing happen in your browser
- **Cryptographic proof** - SHA-512 hashes for all documents
- **Forensic sealing** - Tamper-proof PDFs with watermarks and QR codes

## 📚 Additional Resources

- See `CHAT_DESIGN.md` for assistant conversation patterns
- See `IMPLEMENTATION.md` for deployment instructions
- See `.github/copilot-instructions.md` for development guidelines

---

**Version**: v5.2.6 (OCR + Case Reports Release)  
**Date**: October 2025  
**Status**: ✅ Production Ready
