export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { uploadToSupabase } from '@/lib/ocr';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    // Require authentication for dashboard upload
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    console.log(`[Upload] User ${session.user.id} uploading file`);

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'El archivo PDF es obligatorio' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo no puede superar ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    console.log(`[Upload] File validated: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const pdfBuffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    console.log(`[Upload] Uploading to Supabase...`);
    let pdfUrl: string;
    try {
      pdfUrl = await uploadToSupabase(pdfBuffer, file.name);
      console.log(`[Upload] File uploaded: ${pdfUrl}`);
    } catch (uploadError) {
      console.error('[Upload] Supabase upload failed:', uploadError);
      return NextResponse.json(
        {
          error: 'Error al subir el archivo',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Create solicitud record for dashboard user upload
    // This will be processed by background job to extract data and create multa
    const prisma = await getPrisma();

    console.log(`[Upload] Creating solicitud record...`);
    let solicitud: any;
    try {
      solicitud = await prisma.solicitud.create({
        data: {
          nombre: session.user.name || 'Dashboard User',
          patente: 'PENDIENTE', // Will be extracted from PDF
          email: session.user.email || '',
          telefono: '', // Will be extracted from PDF if available
          pdfUrl,
          aceptaTerminos: true,
          estado: 'PENDIENTE',
        },
      });
      console.log(`[Upload] Solicitud created: ${solicitud.id}`);
    } catch (dbError) {
      console.error('[Upload] Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Error al guardar la solicitud',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Archivo recibido. Analizando...',
        id: solicitud.id,
        pdfUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[Upload] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Error al procesar el archivo',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
