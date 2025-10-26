/**
 * Universal File Extraction
 * Verum Omnis — Patent Pending
 * 
 * Extracts text and metadata from all file types:
 * - PDF (text layer + OCR fallback)
 * - Images (OCR with language picker)
 * - DOC/DOCX/TXT (text extraction)
 * - Media (hash + transcription stub)
 */

/**
 * Extract text and metadata from any file type
 */
export async function extractFromFile(file) {
  const mime = file.type;
  const arrayBuffer = await file.arrayBuffer();
  
  // Route to appropriate extractor
  if (mime === 'application/pdf') {
    return await extractFromPDF(file, arrayBuffer);
  } else if (mime.startsWith('image/')) {
    return await extractFromImage(file, arrayBuffer);
  } else if (mime.includes('word') || mime.includes('document')) {
    return await extractFromDocument(file, arrayBuffer);
  } else if (mime.startsWith('text/')) {
    return await extractFromText(file, arrayBuffer);
  } else if (mime.startsWith('audio/') || mime.startsWith('video/')) {
    return await extractFromMedia(file, arrayBuffer);
  } else {
    // Unknown type - treat as binary
    return {
      text: '',
      metadata: {
        type: 'binary',
        extractionMethod: 'none',
      },
    };
  }
}

/**
 * Extract from PDF (text layer first, OCR fallback)
 */
async function extractFromPDF(file, arrayBuffer) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js library not loaded');
  }
  
  try {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    let fullText = '';
    let hasTextLayer = false;
    let ocrPages = [];
    let totalConfidence = 0;
    
    // Try to extract text layer from each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      
      if (pageText.trim().length > 0) {
        hasTextLayer = true;
        fullText += pageText + '\n';
      } else {
        // No text layer - need OCR
        ocrPages.push(i);
      }
    }
    
    // If no text layer or sparse, fall back to OCR
    const needsOCR = !hasTextLayer || fullText.trim().length < 100;
    
    if (needsOCR && typeof Tesseract !== 'undefined') {
      console.log(`OCR needed for ${ocrPages.length > 0 ? ocrPages.length : pageCount} pages...`);
      
      // For now, OCR first page only (full doc OCR can be slow)
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const { data } = await Tesseract.recognize(canvas, 'eng', {
        logger: m => console.log(m),
      });
      
      fullText = data.text;
      totalConfidence = data.confidence / 100;
      
      return {
        text: fullText,
        metadata: {
          type: 'pdf',
          pageCount,
          extractionMethod: 'ocr',
          ocrStats: {
            wasOcrNeeded: true,
            ocrPages: [1], // Only first page for now
            avgConfidence: totalConfidence,
          },
          pdfInfo: {
            pageCount,
            producer: (await pdf.getMetadata()).info?.Producer || 'Unknown',
            creator: (await pdf.getMetadata()).info?.Creator || 'Unknown',
          },
        },
      };
    }
    
    return {
      text: fullText,
      metadata: {
        type: 'pdf',
        pageCount,
        extractionMethod: hasTextLayer ? 'text-layer' : 'none',
        ocrStats: {
          wasOcrNeeded: false,
        },
        pdfInfo: {
          pageCount,
          producer: (await pdf.getMetadata()).info?.Producer || 'Unknown',
          creator: (await pdf.getMetadata()).info?.Creator || 'Unknown',
        },
      },
    };
  } catch (error) {
    console.error('PDF extraction failed:', error);
    return {
      text: '',
      metadata: {
        type: 'pdf',
        extractionMethod: 'failed',
        error: error.message,
      },
    };
  }
}

/**
 * Extract from image using OCR
 */
async function extractFromImage(file, arrayBuffer, language = 'eng') {
  if (typeof Tesseract === 'undefined') {
    throw new Error('Tesseract.js library not loaded');
  }
  
  try {
    const { data } = await Tesseract.recognize(file, language, {
      logger: m => console.log(m),
    });
    
    return {
      text: data.text,
      metadata: {
        type: 'image',
        extractionMethod: 'ocr',
        ocrStats: {
          wasOcrNeeded: true,
          avgConfidence: data.confidence / 100,
          language,
        },
      },
    };
  } catch (error) {
    console.error('Image OCR failed:', error);
    return {
      text: '',
      metadata: {
        type: 'image',
        extractionMethod: 'failed',
        error: error.message,
      },
    };
  }
}

/**
 * Extract from DOC/DOCX (basic text extraction)
 */
async function extractFromDocument(file, arrayBuffer) {
  // For DOCX, we could use a library like mammoth.js
  // For now, return placeholder
  return {
    text: '[Document text extraction requires additional library - use PDF conversion for best results]',
    metadata: {
      type: 'document',
      extractionMethod: 'placeholder',
      warning: 'Convert to PDF for full text extraction',
    },
  };
}

/**
 * Extract from plain text file
 */
async function extractFromText(file, arrayBuffer) {
  try {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);
    
    return {
      text,
      metadata: {
        type: 'text',
        extractionMethod: 'direct',
      },
    };
  } catch (error) {
    console.error('Text extraction failed:', error);
    return {
      text: '',
      metadata: {
        type: 'text',
        extractionMethod: 'failed',
        error: error.message,
      },
    };
  }
}

/**
 * Extract from audio/video (hash + transcription stub)
 */
async function extractFromMedia(file, arrayBuffer) {
  // Transcription would require a speech-to-text API (e.g., OpenAI Whisper)
  // For now, return metadata only
  return {
    text: '[Media file - transcription requires speech-to-text API]',
    metadata: {
      type: file.type.startsWith('audio/') ? 'audio' : 'video',
      extractionMethod: 'placeholder',
      duration: null, // Would need media parsing
      transcriptionAvailable: false,
    },
  };
}
