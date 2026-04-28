export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { uploadToSupabase } from '@/lib/ocr';
import { sendMultaAnalysisEmail } from '@/lib/email';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getFieldValue(formData: FormData, ...aliases: string[]): string | null {
  for (const alias of aliases) {
    const value = formData.get(alias);
    if (value && typeof value === 'string') return value;
  }
  return null;
}

function getFileField(formData: FormData, ...aliases: string[]): File | null {
  for (const alias of aliases) {
    const file = formData.get(alias);
    if (file instanceof File) return file;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const logPrefix = `[UPLOAD:${requestId}]`;

  try {
    console.log(`${logPrefix} Request received`);
    const formData = await request.formData();

    // Extract fields with aliases
    const nombre = getFieldValue(formData, 'nombre', 'nombreCompleto');
    const patente = getFieldValue(formData, 'patente');
    const email = getFieldValue(formData, 'email');
    const telefono = getFieldValue(formData, 'telefono', 'whatsapp');
    const aceptaTerminosStr = getFieldValue(formData, 'aceptaTerminos');
    const aceptaTerminos = aceptaTerminosStr === 'true' || aceptaTerminosStr === '1';
    const file = getFileField(formData, 'file', 'pdf', 'certificado', 'archivo');

    console.log(`${logPrefix} Fields extracted - nombre: ${!!nombre}, patente: ${!!patente}, email: ${!!email}, file: ${!!file}`);

    // Validate required fields
    const errors: { [key: string]: string } = {};

    if (!nombre || !nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!patente || !patente.trim()) {
      errors.patente = 'La patente es obligatoria';
    } else if (!/^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/.test(patente.toUpperCase())) {
      errors.patente = 'Formato de patente inválido (ej: ABCD-12)';
    }

    if (!email || !email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email inválido';
    }

    if (!telefono || !telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[\d\s\-\+()]+$/.test(telefono) || telefono.replace(/\D/g, '').length < 7) {
      errors.telefono = 'Teléfono inválido';
    }

    if (!file) {
      errors.file = 'El certificado PDF es obligatorio';
    } else if (file.type !== 'application/pdf') {
      errors.file = 'El archivo debe ser un PDF válido';
    } else if (file.size > MAX_FILE_SIZE) {
      errors.file = `El archivo no debe exceder ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }

    if (!aceptaTerminos) {
      errors.aceptaTerminos = 'Debes aceptar los términos';
    }

    if (Object.keys(errors).length > 0) {
      console.log(`${logPrefix} Validation failed:`, errors);
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    // Convert file to buffer
    console.log(`${logPrefix} Converting file to buffer (${file!.size} bytes)`);
    const pdfBuffer = Buffer.from(await file!.arrayBuffer());

    // Upload to Supabase Storage
    const pdfPath = `certificados/${patente!.toUpperCase().replace('-', '')}/${Date.now()}-${file!.name}`;
    console.log(`${logPrefix} Uploading to Supabase Storage at: ${pdfPath}`);
    let pdfUrl: string;
    try {
      pdfUrl = await uploadToSupabase(pdfBuffer, file!.name);
      console.log(`${logPrefix} File uploaded successfully: ${pdfUrl}`);
    } catch (uploadError) {
      console.error(`${logPrefix} Storage upload failed:`, uploadError);
      return NextResponse.json(
        {
          error: 'Error al subir el archivo',
          code: 'STORAGE_UPLOAD_ERROR',
          message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Save solicitud to database
    console.log(`${logPrefix} Creating solicitud in database`);
    const prisma = await getPrisma();
    let solicitud: any;
    try {
      solicitud = await prisma.solicitud.create({
        data: {
          nombre: nombre!,
          patente: patente!.toUpperCase(),
          email: email!,
          telefono: telefono!,
          pdfUrl,
          aceptaTerminos,
          estado: 'PENDIENTE',
        },
      });
      console.log(`${logPrefix} Solicitud created: ${solicitud.id}`);
    } catch (dbError) {
      console.error(`${logPrefix} Database error:`, dbError);
      return NextResponse.json(
        {
          error: 'Error al guardar la solicitud',
          code: 'DATABASE_ERROR',
          message: dbError instanceof Error ? dbError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Send confirmation email (non-blocking)
    try {
      await sendMultaAnalysisEmail(email!, '', patente!, 'PENDIENTE');
      console.log(`${logPrefix} Confirmation email sent`);
    } catch (emailError) {
      console.warn(`${logPrefix} Email sending failed (non-blocking):`, emailError);
    }

    console.log(`${logPrefix} Request completed successfully`);
    return NextResponse.json(
      {
        success: true,
        solicitudId: solicitud.id,
        pdfUrl,
        message: 'Solicitud recibida correctamente. Procesaremos tu certificado en breve.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`${logPrefix} Unexpected error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Error al procesar la solicitud',
        code: 'INTERNAL_ERROR',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
