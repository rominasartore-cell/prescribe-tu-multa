import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { sendSolicitudConfirmationEmail, sendInternalNotificationEmail } from '@/lib/email';
import { uploadPdfToSupabase } from '@/lib/storage';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nombre = String(formData.get('nombre') || '').trim();
    const patente = String(formData.get('patente') || '').trim().toUpperCase();
    const email = String(formData.get('email') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const aceptaTerminosValue = String(formData.get('aceptaTerminos') || '').trim().toLowerCase();
    const aceptaTerminos = aceptaTerminosValue === 'true';

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
        { error: 'Faltan campos obligatorios', missingFields, receivedFields },
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

    const patenteRegex = /^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/;
    if (!patenteRegex.test(patente)) {
      return NextResponse.json({ error: 'Patente inválida' }, { status: 400 });
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

    const pdfUrl = await uploadPdfToSupabase(pdf);

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

    return NextResponse.json({ success: true, id: solicitud.id, pdfUrl }, { status: 201 });
  } catch (error) {
    console.error('Error en solicitud:', error);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
