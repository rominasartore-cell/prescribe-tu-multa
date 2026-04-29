import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'certificados';
let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  }

  client = createClient(url, key);
  return client;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Sube un PDF a Supabase Storage
 * @param file - Archivo PDF (File object)
 * @param patente - Patente del vehículo para organizar en carpetas
 * @returns URL pública del archivo
 */
export async function uploadPdfToSupabase(file: File, patente: string = ''): Promise<string> {
  try {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('El archivo debe ser un PDF válido');
    }

    const safeName = sanitizeFileName(file.name);
    const timestamp = Date.now();
    
    // Organizar en carpetas por patente: certificados/ABCD-12/timestamp-filename.pdf
    const folder = patente ? patente.replace(/[^A-Z0-9]/g, '') : 'sin-patente';
    const key = `${folder}/${timestamp}-${safeName}`;

    console.log('[STORAGE_UPLOAD_START]', {
      bucket: BUCKET,
      key,
      fileSize: file.size,
      fileType: file.type,
    });

    const supabase = getSupabaseClient();
    const { error, data } = await supabase.storage
      .from(BUCKET)
      .upload(key, file, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('[STORAGE_UPLOAD_ERROR]', {
        message: error.message,
        statusCode: error.statusCode,
        bucket: BUCKET,
        key,
      });

      if ((error as any)?.statusCode === 404) {
        throw new Error(`Bucket ${BUCKET} no existe en Supabase Storage`);
      }

      throw new Error(`Error al subir PDF: ${(error as any)?.message || String(error)}`);
    }

    console.log('[STORAGE_UPLOAD_SUCCESS]', {
      bucket: BUCKET,
      key,
      path: data?.path,
    });

    // Retornar la ruta del archivo (se puede usar para descargar después)
    return key;
  } catch (err: any) {
    console.error('[STORAGE_UPLOAD_EXCEPTION]', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
    });
    throw err;
  }
}

/**
 * Sube un Buffer de PDF a Supabase Storage
 * @param buffer - Buffer del archivo PDF
 * @param fileName - Nombre del archivo
 * @param patente - Patente del vehículo (opcional)
 * @returns Ruta del archivo en Storage
 */
export async function uploadPdfBufferToSupabase(
  buffer: Buffer,
  fileName: string,
  patente: string = ''
): Promise<string> {
  try {
    const safeName = sanitizeFileName(fileName);
    const timestamp = Date.now();
    const folder = patente ? patente.replace(/[^A-Z0-9]/g, '') : 'sin-patente';
    const key = `${folder}/${timestamp}-${safeName}`;

    console.log('[STORAGE_UPLOAD_BUFFER_START]', {
      bucket: BUCKET,
      key,
      bufferSize: buffer.length,
    });

    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('[STORAGE_UPLOAD_BUFFER_ERROR]', {
        message: error.message,
        statusCode: error.statusCode,
      });
      throw new Error(`Error al subir PDF: ${error.message}`);
    }

    console.log('[STORAGE_UPLOAD_BUFFER_SUCCESS]', { key });
    return key;
  } catch (err: any) {
    console.error('[STORAGE_UPLOAD_BUFFER_EXCEPTION]', {
      name: err?.name,
      message: err?.message,
    });
    throw err;
  }
}

/**
 * Descarga un PDF desde Supabase Storage
 * @param key - Ruta del archivo en Storage (ej: ABCD12/1234567890-file.pdf)
 * @returns Buffer del archivo
 */
export async function downloadPdfFromSupabase(key: string): Promise<Buffer> {
  try {
    if (!key) {
      throw new Error('La ruta del archivo es requerida');
    }

    console.log('[STORAGE_DOWNLOAD_START]', { bucket: BUCKET, key });

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(key);

    if (error) {
      console.error('[STORAGE_DOWNLOAD_ERROR]', {
        message: error.message,
        statusCode: error.statusCode,
      });
      throw new Error(`Error al descargar PDF: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se pudo descargar el archivo');
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    console.log('[STORAGE_DOWNLOAD_SUCCESS]', { key, size: buffer.length });
    return buffer;
  } catch (err: any) {
    console.error('[STORAGE_DOWNLOAD_EXCEPTION]', {
      name: err?.name,
      message: err?.message,
    });
    throw err;
  }
}

/**
 * Obtiene la URL pública de un archivo
 * @param key - Ruta del archivo en Storage
 * @returns URL pública del archivo
 */
export function getPublicPdfUrl(key: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL no está configurada');
  }
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${key}`;
}

/**
 * Elimina un archivo de Supabase Storage
 * @param key - Ruta del archivo en Storage
 */
export async function deletePdfFromSupabase(key: string): Promise<void> {
  try {
    console.log('[STORAGE_DELETE_START]', { bucket: BUCKET, key });

    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([key]);

    if (error) {
      console.error('[STORAGE_DELETE_ERROR]', {
        message: error.message,
        statusCode: error.statusCode,
      });
      throw new Error(`Error al eliminar PDF: ${error.message}`);
    }

    console.log('[STORAGE_DELETE_SUCCESS]', { key });
  } catch (err: any) {
    console.error('[STORAGE_DELETE_EXCEPTION]', {
      name: err?.name,
      message: err?.message,
    });
    throw err;
  }
}
