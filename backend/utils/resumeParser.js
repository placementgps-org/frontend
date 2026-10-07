import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

/**
 * Robustly extract text from a PDF Buffer across pdf-parse v1 (function) and v2+ (PDFParse class)
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function parsePdf(buffer) {
  // Case 1: pdf-parse v1 style (callable function)
  if (typeof pdfModule === 'function') {
    const data = await pdfModule(buffer);
    return data.text || '';
  }

  // Case 2: pdf-parse v2+ style (PDFParse class)
  if (pdfModule && pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    try {
      const textResult = await parser.getText();
      if (typeof textResult === 'string') return textResult;
      if (textResult && typeof textResult.text === 'string') return textResult.text;
      if (Array.isArray(textResult?.pages)) {
        return textResult.pages.map(p => p.text || '').join('\n');
      }
      return textResult ? JSON.stringify(textResult) : '';
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }

  // Case 3: Default export or wrapped object
  if (pdfModule?.default && typeof pdfModule.default === 'function') {
    const data = await pdfModule.default(buffer);
    return data.text || '';
  }

  throw new Error('Unable to initialize PDF parsing engine');
}

/**
 * Extracts plain text from an uploaded resume buffer (PDF, DOCX, or text)
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} mimetype - MIME type of the uploaded file
 * @param {string} originalname - Original file name for fallback extension check
 * @returns {Promise<string>} Cleaned extracted text
 */
export const extractResumeText = async (buffer, mimetype = '', originalname = '') => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file buffer provided');
  }

  const nameLower = (originalname || '').toLowerCase();
  const mimeLower = (mimetype || '').toLowerCase();
  let rawText = '';

  // 1. PDF extraction
  if (mimeLower.includes('pdf') || nameLower.endsWith('.pdf')) {
    try {
      rawText = await parsePdf(buffer);
    } catch (pdfErr) {
      console.error('[resumeParser] PDF parse error:', pdfErr.message);
      throw new Error(`Failed to extract text from PDF file: ${pdfErr.message}`);
    }
  }
  // 2. DOCX extraction
  else if (
    mimeLower.includes('word') ||
    mimeLower.includes('officedocument') ||
    nameLower.endsWith('.docx') ||
    nameLower.endsWith('.doc')
  ) {
    try {
      const docxResult = await mammoth.extractRawText({ buffer });
      rawText = docxResult.value || '';
    } catch (docxErr) {
      console.error('[resumeParser] DOCX parse error:', docxErr.message);
      throw new Error(`Failed to extract text from Word document: ${docxErr.message}`);
    }
  }
  // 3. Plain text / Markdown fallback
  else if (mimeLower.includes('text') || nameLower.endsWith('.txt') || nameLower.endsWith('.md')) {
    rawText = buffer.toString('utf-8');
  } else {
    // Try PDF first, then fallback to text
    try {
      rawText = await parsePdf(buffer);
    } catch {
      rawText = buffer.toString('utf-8');
    }
  }

  // Clean and sanitize text
  const cleanedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('Could not extract readable text from the resume. Please ensure the file is not scanned as a flat image or password-protected.');
  }

  // Cap at 15,000 characters to protect AI token limits while retaining complete resume contents
  return cleanedText.slice(0, 15000);
};
