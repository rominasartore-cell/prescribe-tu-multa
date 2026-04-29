import { getPrisma } from '@/lib/db';
import { sendMultaAnalysisEmail } from '@/lib/email';
import { extractTextFromPDF } from '@/lib/ocr';
import { downloadPdfFromSupabase } from '@/lib/storage';
import { calculatePrescriptionDate, getStatus, getDaysRemaining } from '@/lib/prescription';
import { extractDataFromText } from '@/lib/ai';

/**
 * Procesa una solicitud de análisis de multa
 * 1. Descarga PDF desde Supabase Storage
 * 2. Extrae texto con OCR
 * 3. Analiza con Claude para extraer datos estructurados
 * 4. Calcula fecha de prescripción
 * 5. Crea registro de Multa
 * 6. Envía email con resultado
 */
export async function processSolicitudJob(solicitudId: string) {
  const prisma = await getPrisma();

  try {
    console.log('[PROCESS_SOLICITUD_START]', { solicitudId });

    // Buscar solicitud
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      console.error('[PROCESS_SOLICITUD_NOT_FOUND]', { solicitudId });
      return;
    }

    console.log('[PROCESS_SOLICITUD_FOUND]', {
      solicitudId,
      nombre: solicitud.nombre,
      patente: solicitud.patente,
      estado: solicitud.estado,
    });

    // Validar que tenga pdfUrl
    if (!solicitud.pdfUrl) {
      console.error('[PROCESS_SOLICITUD_NO_PDF]', { solicitudId });
      await prisma.solicitud.update({
        where: { id: solicitudId },
        data: { 
          estado: 'ERROR',
          intento: (solicitud.intento || 0) + 1,
        },
      });
      return;
    }

    // Marcar como procesando
    await prisma.solicitud.update({
      where: { id: solicitudId },
      data: { estado: 'PROCESANDO' },
    });

    // Descargar PDF desde Supabase Storage
    console.log('[PROCESS_SOLICITUD_DOWNLOAD_START]', { pdfUrl: solicitud.pdfUrl });
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await downloadPdfFromSupabase(solicitud.pdfUrl);
      console.log('[PROCESS_SOLICITUD_DOWNLOAD_SUCCESS]', { size: pdfBuffer.length });
    } catch (downloadError) {
      console.error('[PROCESS_SOLICITUD_DOWNLOAD_ERROR]', downloadError);
      throw new Error(`No se pudo descargar el PDF: ${downloadError}`);
    }

    // Extraer texto del PDF
    console.log('[PROCESS_SOLICITUD_OCR_START]');
    let extractedText: string;
    try {
      extractedText = await extractTextFromPDF(pdfBuffer);
      console.log('[PROCESS_SOLICITUD_OCR_SUCCESS]', { textLength: extractedText.length });
    } catch (ocrError) {
      console.error('[PROCESS_SOLICITUD_OCR_ERROR]', ocrError);
      throw new Error(`No se pudo extraer texto del PDF: ${ocrError}`);
    }

    // Analizar con Claude
    console.log('[PROCESS_SOLICITUD_CLAUDE_START]');
    let analysis;
    try {
      analysis = await extractDataFromText(extractedText);
      console.log('[PROCESS_SOLICITUD_CLAUDE_SUCCESS]', {
        rut: analysis?.rut,
        patente: analysis?.patente,
        monto: analysis?.monto,
      });
    } catch (claudeError) {
      console.error('[PROCESS_SOLICITUD_CLAUDE_ERROR]', claudeError);
      throw new Error(`No se pudo analizar el PDF: ${claudeError}`);
    }

    // Validar que se extrajeron los campos requeridos
    if (!analysis || !analysis.rut || !analysis.patente || !analysis.fechaIngreso) {
      throw new Error('No se pudieron extraer los campos requeridos del PDF');
    }

    // Convertir fecha
    const fechaIngreso = typeof analysis.fechaIngreso === 'string'
      ? new Date(analysis.fechaIngreso)
      : analysis.fechaIngreso;

    if (isNaN(fechaIngreso.getTime())) {
      throw new Error('Fecha de ingreso inválida');
    }

    // Calcular prescripción
    const fechaPrescripcion = calculatePrescriptionDate(fechaIngreso);
    const estado = getStatus(fechaIngreso);
    const diasRestantes = getDaysRemaining(fechaIngreso);

    console.log('[PROCESS_SOLICITUD_PRESCRIPTION]', {
      fechaIngreso: fechaIngreso.toISOString(),
      fechaPrescripcion: fechaPrescripcion.toISOString(),
      estado,
      diasRestantes,
    });

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { email: solicitud.email },
    });

    if (!user) {
      console.log('[PROCESS_SOLICITUD_CREATE_USER]', { email: solicitud.email });
      user = await prisma.user.create({
        data: {
          email: solicitud.email,
          password: '', // Sin contraseña para usuarios creados desde solicitud
          phone: solicitud.telefono,
          rut: analysis.rut,
        },
      });
    } else {
      // Actualizar RUT si no lo tiene
      if (!user.rut && analysis.rut) {
        await prisma.user.update({
          where: { id: user.id },
          data: { rut: analysis.rut },
        });
      }
    }

    // Crear registro de Multa
    console.log('[PROCESS_SOLICITUD_CREATE_MULTA]', {
      userId: user.id,
      patente: analysis.patente,
      rut: analysis.rut,
    });

    const multa = await prisma.multa.create({
      data: {
        userId: user.id,
        rut: analysis.rut,
        patente: analysis.patente,
        monto: analysis.monto || 0,
        articulo: analysis.articulo || '',
        fechaIngreso,
        fechaPrescripcion,
        estado,
        diasRestantes,
        pdfOriginalUrl: solicitud.pdfUrl,
      },
    });

    console.log('[PROCESS_SOLICITUD_MULTA_CREATED]', { multaId: multa.id });

    // Enviar email con resultado
    try {
      console.log('[PROCESS_SOLICITUD_SEND_EMAIL]', { email: solicitud.email });
      await sendMultaAnalysisEmail(
        solicitud.email,
        analysis.rut,
        analysis.patente,
        estado,
      );
      console.log('[PROCESS_SOLICITUD_EMAIL_SENT]');
    } catch (emailError) {
      console.error('[PROCESS_SOLICITUD_EMAIL_ERROR]', emailError);
      // No bloquear el proceso si falla el email
    }

    // Marcar solicitud como procesada
    await prisma.solicitud.update({
      where: { id: solicitudId },
      data: { 
        estado: 'PROCESADA',
        intento: (solicitud.intento || 0) + 1,
      },
    });

    // Crear log de auditoría
    try {
      await prisma.auditLog.create({
        data: {
          accion: 'SOLICITUD_PROCESSED',
          recurso: 'Solicitud',
          recursoId: solicitudId,
          userId: user.id,
          detalles: `Solicitud de ${solicitud.nombre} procesada. Multa creada: ${analysis.patente}. Estado: ${estado}`,
        },
      });
    } catch (auditError) {
      console.error('[PROCESS_SOLICITUD_AUDIT_ERROR]', auditError);
    }

    console.log('[PROCESS_SOLICITUD_SUCCESS]', {
      solicitudId,
      multaId: multa.id,
      estado,
    });
  } catch (error: any) {
    console.error('[PROCESS_SOLICITUD_ERROR]', {
      solicitudId,
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.split('\n')[0],
    });

    try {
      // Buscar solicitud nuevamente para actualizar
      const solicitud = await prisma.solicitud.findUnique({
        where: { id: solicitudId },
      });

      if (solicitud) {
        const intentos = (solicitud.intento || 0) + 1;
        const maxIntentos = 3;

        if (intentos < maxIntentos) {
          // Calcular próximo intento con backoff exponencial
          const proximoIntento = new Date();
          const minutosDeEspera = Math.pow(5, intentos - 1); // 1, 5, 25 minutos
          proximoIntento.setMinutes(proximoIntento.getMinutes() + minutosDeEspera);

          console.log('[PROCESS_SOLICITUD_RETRY_SCHEDULED]', {
            solicitudId,
            intento: intentos,
            proximoIntento: proximoIntento.toISOString(),
          });

          await prisma.solicitud.update({
            where: { id: solicitudId },
            data: {
              intento: intentos,
              proximoIntento,
              estado: 'PENDIENTE',
            },
          });
        } else {
          // Máximo de intentos alcanzado
          console.log('[PROCESS_SOLICITUD_MAX_RETRIES]', { solicitudId });
          await prisma.solicitud.update({
            where: { id: solicitudId },
            data: {
              intento: intentos,
              proximoIntento: null,
              estado: 'ERROR',
            },
          });
        }
      }
    } catch (updateError) {
      console.error('[PROCESS_SOLICITUD_UPDATE_ERROR]', updateError);
    }

    throw error;
  }
}
