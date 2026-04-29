import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { sendSolicitudConfirmationEmail, sendInternalNotificationEmail } from '@/lib/email';
import { uploadPdfToSupabase } from '@/lib/storage';
import { formatPatente, isValidPatente } from '@/lib/patente';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type inválido. Debe ser multipart/form-data' },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    console.log('SOLICITUD_FORMDATA_KEYS', Array.from(formData.keys()));

    const nombre = String(formData.get('nombre') || formData.get('nombreCompleto') || '').trim();
    const patenteRaw = String(formData.get('patente') || '').trim();
    const patente = formatPatente(patenteRaw);
    const email = String(formData.get('email') || formData.get('correo') || '').trim();
    const telefono = String(formData.get('telefono') || formData.get('whatsapp') || '').trim();
    const aceptaTerminosRaw = formData.get('aceptaTerminos');
    const aceptaTerminosValue = String(aceptaTerminosRaw ?? '').trim().toLowerCase();
    const aceptaTerminos = ['true', 'on', '1'].includes(aceptaTerminosValue);

    const pdf = (formData.get('pdf') ||
      formData.get('file') ||
      formData.get('certificado') ||
      formData.get('archivo')) as File | null;

    const receivedFields = Array.from(formData.keys());
    const missingFields = [
      !nombre ? 'nombre' : null,
      !patente ? 'patente' : null,
      !email ? 'email' : null,
      !telefono ? 'telefono' : null,
      !aceptaTerminos ? 'aceptaTerminos' : null,
      !pdf ? 'pdf' : null,
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios', missingFields, receivedFields },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const phoneRegex = /^(\+?56)?[\s.-]?(9)?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Teléfono chileno inválido' }, { status: 400 });
    }

    if (!isValidPatente(patenteRaw)) {
      return NextResponse.json(
        { error: 'Formato de patente inválido. Ejemplos válidos: ABCD-12 o AB-1234.' },
        { status: 400 },
      );
    }

    if (!(pdf instanceof File)) {
      return NextResponse.json({ error: 'Archivo PDF inválido' }, { status: 400 });
    }

    if (pdf.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    if (pdf.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json({ error: 'El PDF supera el tamaño máximo de 10MB' }, { status: 400 });
    }

    let pdfUrl = '';
    try {
      pdfUrl = await uploadPdfToSupabase(pdf);
    } catch (uploadError: unknown) {
      const err = uploadError as any;
      return NextResponse.json(
        {
          error: 'STORAGE_UPLOAD_ERROR',
          message: err?.message ?? 'Unknown storage upload error',
          details: {
            name: err?.name ?? null,
            code: err?.code ?? null,
          },
        },
        { status: 500 },
      );
    }

    const prisma = await getPrisma();
    const solicitud = await prisma.solicitud.create({
      data: {
        nombre,
        patente,
        email,
        telefono,
        aceptaTerminos,
        pdfUrl,
        estado: 'PENDIENTE',
      },
    });

    try {
      await sendSolicitudConfirmationEmail(email, nombre);
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
    }

    try {
      await sendInternalNotificationEmail(solicitud.id, nombre, patente, email, telefono);
    } catch (notificationError) {
      console.error('Error enviando notificación interna:', notificationError);
    }

    return NextResponse.json(
      {
        success: true,
        id: solicitud.id,
        estado: solicitud.estado,
        pdfUrl,
        message: 'Solicitud recibida correctamente',
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const err = error as any;

    console.error('SOLICITUD_ERROR', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        error: 'SOLICITUD_ERROR',
        name: err?.name ?? 'UnknownError',
        message: err?.message ?? String(error),
        code: err?.code ?? null,
        meta: err?.meta ?? null,
      },
      { status: 500 },
    );
  }
}
