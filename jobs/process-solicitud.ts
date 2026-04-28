import { getPrisma } from '@/lib/db';
import { sendMultaAnalysisEmail } from '@/lib/email';
import { extractTextFromPDF } from '@/lib/ocr';
import { downloadPdfFromSupabase } from '@/lib/storage';
import { calculatePrescriptionDate, getStatus, getDaysRemaining } from '@/lib/prescription';
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

    // Analyze with Claude to extract structured data
    console.log(`Analyzing with Claude for solicitud ${solicitudId}`);
    const analysis = await extractDataFromText(extractedText);

    if (!analysis || !analysis.rut || !analysis.patente || !analysis.fechaIngreso) {
      throw new Error('Failed to extract required fields from PDF');
    }

    const fechaIngreso = typeof analysis.fechaIngreso === 'string'
      ? new Date(analysis.fechaIngreso)
      : analysis.fechaIngreso;
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
          rut: analysis.rut,
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
        rut: analysis.rut,
        patente: analysis.patente,
        monto: analysis.monto,
        articulo: analysis.articulo,
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
      analysis.rut,
      analysis.patente,
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
        detalles: `Solicitud de ${solicitud.nombre} procesada. Multa creada: ${analysis.patente}. Estado: ${estado}`,
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
