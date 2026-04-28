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
    const pdf = formData.get('pdf') as File;

    // Validaciones básicas
    if (!nombre || !patente || !email || !telefono || !aceptaTerminos) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (!pdf) {
      return NextResponse.json(
        { error: 'Archivo PDF es obligatorio' },
        { status: 400 }
      );
    }

    if (!pdf.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un PDF válido' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar teléfono (formato chileno)
    const phoneRegex = /^(\+?56)?[\s.-]?(9)?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Teléfono chileno inválido' },
        { status: 400 }
      );
    }

    // Validar patente
    const patenteRegex = /^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/;
    if (!patenteRegex.test(patente)) {
      return NextResponse.json(
        { error: 'Patente inválida' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for Supabase upload
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());

    // Upload PDF to Supabase Storage
    const pdfKey = await uploadToSupabase(pdfBuffer, pdf.name);

    // Guardar en base de datos
    const prisma = await getPrisma();
    const solicitud = await prisma.solicitud.create({
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

    console.log('Solicitud creada:', solicitud.id);

    // Enviar emails (no bloquean si fallan)
    try {
      await sendSolicitudConfirmationEmail(email, nombre);
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
    }

    // Notificar al equipo de soporte
    try {
      await sendInternalNotificationEmail(solicitud.id, nombre, patente, email, telefono);
    } catch (notificationError) {
      console.error('Error enviando notificación interna:', notificationError);
    }

    // TODO: Enviar notificación por WhatsApp si está configurado

    return NextResponse.json(
      {
        success: true,
        message: 'Solicitud recibida correctamente',
        id: solicitud.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en solicitud:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
