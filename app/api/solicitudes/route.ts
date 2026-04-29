import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { sendSolicitudConfirmationEmail, sendInternalNotificationEmail } from '@/lib/email';
import { uploadPdfToSupabase } from '@/lib/storage';
import { formatPatente, isValidPatente } from '@/lib/patente';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Log seguro: solo mostrar claves, no valores
    console.log('[SOLICITUD_FORMDATA_KEYS]', Array.from(formData.keys()));

    // Aceptar variaciones de nombres de campos
    const nombre = String(formData.get('nombre') || formData.get('nombreCompleto') || '').trim();
    let patente = String(formData.get('patente') || '').trim().toUpperCase();
    const email = String(formData.get('email') || formData.get('correo') || '').trim();
    const telefono = String(formData.get('telefono') || formData.get('whatsapp') || '').trim();
    const aceptaTerminosValue = String(formData.get('aceptaTerminos') || '').trim().toLowerCase();
    const aceptaTerminos = aceptaTerminosValue === 'true' || aceptaTerminosValue === 'on' || aceptaTerminosValue === '1';

    const pdf = (formData.get('pdf') ||
      formData.get('file') ||
      formData.get('certificado') ||
      formData.get('archivo')) as File | null;

    const receivedFields = Array.from(formData.keys());
    const missingFields = [
      !nombre ? 'nombre (o nombreCompleto)' : null,
      !patente ? 'patente' : null,
      !email ? 'email (o correo)' : null,
      !telefono ? 'telefono (o whatsapp)' : null,
      !aceptaTerminos ? 'aceptaTerminos' : null,
      !pdf ? 'pdf (o file, certificado, archivo)' : null,
    ].filter(Boolean);

    if (missingFields.length > 0) {
      console.log('[SOLICITUD_VALIDATION_ERROR] Campos faltantes:', missingFields);
      return NextResponse.json(
        { 
          error: 'Todos los campos son obligatorios', 
          missingFields, 
          receivedFields 
        },
        { status: 400 },
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[SOLICITUD_VALIDATION_ERROR] Email inválido:', email);
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Validar teléfono
    const phoneRegex = /^(\+?56)?[\s.-]?(9)?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, ''))) {
      console.log('[SOLICITUD_VALIDATION_ERROR] Teléfono inválido:', telefono);
      return NextResponse.json({ error: 'Teléfono chileno inválido' }, { status: 400 });
    }

    // Validar patente con la nueva función
    if (!isValidPatente(patente)) {
      console.log('[SOLICITUD_VALIDATION_ERROR] Patente inválida:', patente);
      return NextResponse.json(
        { error: 'Formato de patente inválido. Ejemplos válidos: ABCD-12 o AB-1234.' }, 
        { status: 400 }
      );
    }

    // Formatear patente al formato estándar
    patente = formatPatente(patente);
    console.log('[SOLICITUD_PATENTE_FORMATTED]', patente);

    // Validar PDF
    if (!(pdf instanceof File)) {
      console.log('[SOLICITUD_VALIDATION_ERROR] Archivo no es File');
      return NextResponse.json({ error: 'Archivo PDF inválido' }, { status: 400 });
    }

    if (pdf.type !== 'application/pdf') {
      console.log('[SOLICITUD_VALIDATION_ERROR] Tipo de archivo no es PDF:', pdf.type);
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    if (pdf.size > MAX_PDF_SIZE_BYTES) {
      console.log('[SOLICITUD_VALIDATION_ERROR] PDF supera tamaño máximo:', pdf.size);
      return NextResponse.json({ error: 'El PDF supera el tamaño máximo de 10MB' }, { status: 400 });
    }

    console.log('[SOLICITUD_UPLOAD_PDF] Iniciando subida a Supabase:', {
      filename: pdf.name,
      size: pdf.size,
      patente,
    });

    const pdfUrl = await uploadPdfToSupabase(pdf, patente);
    console.log('[SOLICITUD_UPLOAD_SUCCESS] PDF subido:', pdfUrl);

    // Crear solicitud en Prisma
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

    console.log('[SOLICITUD_CREATED]', {
      id: solicitud.id,
      patente: solicitud.patente,
      email: solicitud.email,
      pdfUrl: solicitud.pdfUrl,
    });

    // Enviar emails (no bloquean la respuesta)
    try {
      await sendSolicitudConfirmationEmail(email, nombre);
      console.log('[SOLICITUD_EMAIL_SENT] Confirmación enviada a:', email);
    } catch (emailError) {
      console.error('[SOLICITUD_EMAIL_ERROR]', emailError);
    }

    try {
      await sendInternalNotificationEmail(solicitud.id, nombre, patente, email, telefono);
      console.log('[SOLICITUD_NOTIFICATION_SENT] Notificación interna enviada');
    } catch (notificationError) {
      console.error('[SOLICITUD_NOTIFICATION_ERROR]', notificationError);
    }

    return NextResponse.json(
      { 
        success: true, 
        id: solicitud.id, 
        pdfUrl,
        message: 'Solicitud recibida correctamente. Te contactaremos en 24 horas.'
      }, 
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as any;
    
    // Log seguro: no exponer tokens ni contraseñas
    console.error('[SOLICITUD_ERROR]', {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      meta: err?.meta,
      stack: err?.stack?.split('\n')[0],
    });

    // Mensajes de error seguros y diagnosticables
    let errorMessage = 'Error al procesar la solicitud';
    let statusCode = 500;

    if (err?.code === 'P2002') {
      errorMessage = 'Esta solicitud ya fue registrada';
      statusCode = 409;
    } else if (err?.message?.includes('Bucket')) {
      errorMessage = 'Error en el almacenamiento. Intenta de nuevo.';
      statusCode = 503;
    } else if (err?.message?.includes('SUPABASE')) {
      errorMessage = 'Error de conexión con el servicio. Intenta de nuevo.';
      statusCode = 503;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: err?.code ?? 'UNKNOWN_ERROR',
      },
      { status: statusCode }
    );
  }
}
