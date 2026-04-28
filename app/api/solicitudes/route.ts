export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { sendSolicitudConfirmationEmail, sendInternalNotificationEmail } from '@/lib/email';
import { uploadToSupabase } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nombre = formData.get('nombre') as string;
    const patente = formData.get('patente') as string;
    const email = formData.get('email') as string;
    const telefono = formData.get('telefono') as string;
    const aceptaTerminos = formData.get('aceptaTerminos') === 'true';
    const pdf = (formData.get('file') || formData.get('pdf')) as File;

    console.log('[Solicitud] Received request - nombre:', nombre, 'patente:', patente, 'email:', email);

    // Validaciones básicas
    if (!nombre || !patente || !email || !telefono || !aceptaTerminos) {
      console.warn('[Solicitud] Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (!pdf) {
      console.warn('[Solicitud] Validation failed: no PDF file provided');
      return NextResponse.json(
        { error: 'Archivo PDF es obligatorio' },
        { status: 400 }
      );
    }

    console.log(`[Solicitud] PDF received: ${pdf.name} (${pdf.size} bytes, type: ${pdf.type})`);

    if (!pdf.type.includes('pdf')) {
      console.warn('[Solicitud] Validation failed: invalid file type:', pdf.type);
      return NextResponse.json(
        { error: 'El archivo debe ser un PDF válido' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn('[Solicitud] Validation failed: invalid email:', email);
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar teléfono (formato chileno)
    const phoneRegex = /^(\+?56)?[\s.-]?(9)?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
      console.warn('[Solicitud] Validation failed: invalid phone:', telefono);
      return NextResponse.json(
        { error: 'Teléfono chileno inválido' },
        { status: 400 }
      );
    }

    // Validar patente
    const patenteRegex = /^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/;
    if (!patenteRegex.test(patente)) {
      console.warn('[Solicitud] Validation failed: invalid patente:', patente);
      return NextResponse.json(
        { error: 'Patente inválida' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Supabase upload
    console.log('[Solicitud] Converting PDF to buffer...');
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());

    // Upload PDF to Supabase Storage
    console.log('[Solicitud] Uploading PDF to Supabase Storage...');
    let pdfKey: string;
    try {
      pdfKey = await uploadToSupabase(pdfBuffer, pdf.name);
      console.log('[Solicitud] PDF uploaded successfully:', pdfKey);
    } catch (uploadError) {
      console.error('[Solicitud] Failed to upload PDF:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir el archivo PDF', details: uploadError instanceof Error ? uploadError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Guardar en base de datos
    console.log('[Solicitud] Creating solicitud in database...');
    const prisma = await getPrisma();
    let solicitud: any;
    try {
      solicitud = await prisma.solicitud.create({
        data: {
          nombre,
          patente,
          email,
          telefono,
          aceptaTerminos,
          pdfUrl: pdfKey,
          estado: 'PENDIENTE',
        },
      });
      console.log('[Solicitud] Solicitud created successfully:', solicitud.id);
    } catch (dbError) {
      console.error('[Solicitud] Failed to create solicitud in database:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar la solicitud', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Enviar emails (no bloquean si fallan)
    try {
      await sendSolicitudConfirmationEmail(email, nombre);
      console.log('[Solicitud] Confirmation email sent to:', email);
    } catch (emailError) {
      console.warn('[Solicitud] Error sending confirmation email:', emailError);
    }

    // Notificar al equipo de soporte
    try {
      await sendInternalNotificationEmail(solicitud.id, nombre, patente, email, telefono);
      console.log('[Solicitud] Internal notification email sent');
    } catch (notificationError) {
      console.warn('[Solicitud] Error sending internal notification:', notificationError);
    }

    // TODO: Enviar notificación por WhatsApp si está configurado

    console.log('[Solicitud] Request completed successfully');
    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud recibida correctamente',
        id: solicitud.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Solicitud] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: errorMessage, stack: errorStack },
      { status: 500 }
    );
  }
}
