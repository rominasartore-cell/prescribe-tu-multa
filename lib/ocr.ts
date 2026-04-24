import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  const key = `uploads/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from('pdfs')
    .upload(key, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }

  return key;
}

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    // Use require to load pdf-parse at runtime
    // eslint-disable-next-line global-require
    const pdfParse = require('pdf-parse/lib/pdf.js');

    // Parse PDF to extract text
    const pdfData = await pdfParse(pdfBuffer);

    // Get the extracted text from the PDF
    let text = pdfData.text || '';

    // If text extraction from pdf-parse gives empty or very little text,
    // return what we got. The Claude AI extraction step will handle any refinement needed.
    if (!text || text.trim().length < 50) {
      // Fallback: PDF might be image-based, in which case we return a message
      // that will be caught by the API handler
      return '';
    }

    return text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return '';
  }
}

export async function getPdfFromSupabase(supabaseKey: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .download(supabaseKey);

  if (error) {
    throw new Error(`Failed to download from Supabase Storage: ${error.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
}

// Legacy function names for backward compatibility
export const uploadToS3 = uploadToSupabase;
export const getPdfFromS3 = getPdfFromSupabase;
