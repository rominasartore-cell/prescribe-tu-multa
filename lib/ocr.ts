import { downloadPdfFromSupabase, uploadPdfBufferToSupabase } from '@/lib/storage';

export async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  return uploadPdfBufferToSupabase(buffer, fileName);
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line global-require
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text || '';
    if (!text || text.trim().length < 50) return '';
    return text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}

export async function getPdfFromSupabase(supabaseKey: string): Promise<Buffer> {
  return downloadPdfFromSupabase(supabaseKey);
}

export const uploadToS3 = uploadToSupabase;
export const getPdfFromS3 = getPdfFromSupabase;
