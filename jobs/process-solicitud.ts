import { getPrisma } from '@/lib/db';
import { sendMultaAnalysisEmail } from '@/lib/email';
import { extractTextFromPDF } from '@/lib/ocr';
import { downloadPdfFromSupabase } from '@/lib/storage';
import { calculatePrescriptionDate, getStatus, getDaysRemaining, getYearsElapsed } from '@/lib/prescription';
import { parseCertificadoText, pickBestRmnpDate } from '@/lib/certificado-parser';
import { extractDataFromText } from '@/lib/ai';

export async function processSolicitudJob(solicitudId: string) {
  try {
    const prisma = await getPrisma();

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      console.error(`Solicitud ${solicitudId} not found`);
      return;
    }

    if (!solicitud.pdfUrl) {
      console.error(`Solicitud ${solicitudId} has no PDF URL`);
      // Mark as error
      await prisma.solicitud.update({
        where: { id: solicitudId },
        data: { estado: 'ERROR', intento: solicitud.intento + 1 },
      });
      return;
    }

    console.log(`Downloading and extracting text from PDF for solicitud ${solicitudId}`);
    const pdfBuffer = await downloadPdfFromSupabase(solicitud.pdfUrl);
    const extractedText = await extractTextFromPDF(pdfBuffer);

    const parsedMultas = parseCertificadoText(extractedText);

    // Analyze with Claude to extract structured data (fallback parser if API/env unavailable)
    console.log(`Analyzing with Claude for solicitud ${solicitudId}`);
    const analysis = await extractDataFromText(extractedText);

    const fechaIngreso = (analysis?.fechaIngreso
      ? (typeof analysis.fechaIngreso === 'string' ? new Date(analysis.fechaIngreso) : analysis.fechaIngreso)
      : pickBestRmnpDate(parsedMultas));

    if (!fechaIngreso) {
      throw new Error('Failed to extract RMNP date from PDF');
    }

    const patente = analysis?.patente || parsedMultas.find((m) => m.patente)?.patente || solicitud.patente;
    const rut = analysis?.rut || 'PENDIENTE_VALIDAR';
    const fechaPrescripcion = calculatePrescriptionDate(fechaIngreso);
    const estado = getStatus(fechaIngreso);
    const diasRestantes = getDaysRemaining(fechaIngreso);

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: solicitud.email },
    });

    if (!user) {
      // Create a temporary user for the solicitud
      user = await prisma.user.create({
        data: {
          email: solicitud.email,
          password: '', // No password for solicitud-created users
          phone: solicitud.telefono,
          rut,
        },
      });
    } else {
      // Update user with extracted RUT if not present
      if (!user.rut && analysis.rut) {
        await prisma.user.update({
          where: { id: user.id },
          data: { rut: analysis.rut },
        });
      }
    }

    // Create Multa record
    const multa = await prisma.multa.create({
      data: {
        userId: user.id,
        rut,
        patente,
        monto: analysis.monto || parsedMultas.find((m) => m.monto)?.monto || 0,
        articulo: analysis.articulo || parsedMultas.find((m) => m.rol)?.rol || undefined,
        fechaIngreso,
        fechaPrescripcion,
        estado,
        diasRestantes,
        pdfOriginalUrl: solicitud.pdfUrl,
      },
    });

    // Send analysis email to user
    await sendMultaAnalysisEmail(
      solicitud.email,
      rut,
      patente,
      estado,
    );

    // Mark solicitud as processed
    await prisma.solicitud.update({
      where: { id: solicitudId },
      data: { estado: 'PROCESADA' },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        accion: 'SOLICITUD_PROCESSED',
        recurso: 'Solicitud',
        recursoId: solicitudId,
        userId: user.id,
        detalles: `Solicitud de ${solicitud.nombre} procesada. Multa creada: ${patente}. Estado: ${estado}. Años transcurridos: ${getYearsElapsed(fechaIngreso)}.`,
      },
    });

    console.log(`Solicitud ${solicitudId} processed successfully. Multa created: ${multa.id}`);
  } catch (error) {
    console.error(`Error processing solicitud ${solicitudId}:`, error);

    // Update attempt count and schedule retry
    const prisma = await getPrisma();
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (solicitud) {
      const nextAttempt = new Date();
      nextAttempt.setMinutes(nextAttempt.getMinutes() + Math.pow(5, solicitud.intento)); // Exponential backoff: 5, 25, 125 minutes

      await prisma.solicitud.update({
        where: { id: solicitudId },
        data: {
          intento: solicitud.intento + 1,
          proximoIntento: solicitud.intento < 3 ? nextAttempt : null,
          estado: solicitud.intento >= 3 ? 'ERROR' : 'PENDIENTE',
        },
      });
    }
  }
}
