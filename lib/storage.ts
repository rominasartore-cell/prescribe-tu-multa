import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'certificados';
let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing');
  }

  client = createClient(url, key);
  return client;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadPdfToSupabase(file: File): Promise<string> {
  try {
    const safeName = sanitizeFileName(file.name);
    const key = `solicitudes/${Date.now()}-${safeName}`;

    const client = getSupabaseClient();
    const { error } = await client.storage.from(BUCKET).upload(key, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (error) {
      console.error('STORAGE_UPLOAD_ERROR', {
        message: error.message,
        code: error.statusCode,
        bucket: BUCKET,
        key: key,
      });
      throw new Error(`STORAGE_UPLOAD_ERROR: ${error.message}`);
    }
    
    console.log('STORAGE_UPLOAD_SUCCESS', { key, bucket: BUCKET });
    return key;
  } catch (err: any) {
    console.error('STORAGE_UPLOAD_EXCEPTION', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    });
    throw err;
  }
}

export async function uploadPdfBufferToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  const safeName = sanitizeFileName(fileName);
  const key = `uploads/${Date.now()}-${safeName}`;
  const { error } = await getSupabaseClient().storage.from(BUCKET).upload(key, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  });

  if (error) throw new Error(`Supabase Storage upload error: ${error.message}`);
  return key;
}

export async function downloadPdfFromSupabase(key: string): Promise<Buffer> {
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).download(key);
  if (error || !data) throw new Error(`Supabase Storage download error: ${error?.message || 'file not found'}`);
  return Buffer.from(await data.arrayBuffer());
}
