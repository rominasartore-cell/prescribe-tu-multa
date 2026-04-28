import { getPrisma } from '@/lib/db';
import { sendMultaAnalysisEmail } from '@/lib/email';
import { extractTextFromPDF, getPdfFromSupabase } from '@/lib/ocr';
import { extractDataFromText } from '@/lib/ai';
import { calculatePrescriptionDate, getStatus, getDaysRemaining } from '@/lib/prescription';

export async function processSolicitudJob(solicitudId: string) {
  const logPrefix = `[PROCESS_SOLICITUD:${solicitudId}]`;

  try {
    console.log(`${logPrefix} Starting job`);
    const prisma = await getPrisma();

    console.log(`${logPrefix} Fetching solicitud`);
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (!solicitud) {
      console.error(`${logPrefix} Solicitud not found`);
      return;
    }

    if (!solicitud.pdfUrl) {
      console.error(`${logPrefix} No PDF URL`);
      await prisma.solicitud.update({
        where: { id: solicitudId },
        data: { estado: 'ERROR', intento: solicitud.intento + 1 },
      });
      return;
    }

    console.log(`${logPrefix} Marking as PROCESANDO`);
    await prisma.solicitud.update({
      where: { id: solicitudId },
      data: { estado: 'PROCESANDO' },
    });

    // Download PDF from Supabase Storage
    console.log(`${logPrefix} Downloading PDF from Supabase: ${solicitud.pdfUrl}`);
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await getPdfFromSupabase(solicitud.pdfUrl);
      console.log(`${logPrefix} PDF downloaded (${pdfBuffer.length} bytes)`);
    } catch (downloadError) {
      throw new Error(`Failed to download PDF: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`);
    }

    // Extract text from PDF
    console.log(`${logPrefix} Extracting text from PDF buffer`);
    let extractedText: string;
    try {
      extractedText = await extractTextFromPDF(pdfBuffer);
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text extracted from PDF');
      }
      console.log(`${logPrefix} Text extracted (${extractedText.length} chars)`);
    } catch (extractError) {
      throw new Error(`Failed to extract text: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`);
    }

    // Analyze with Claude to extract structured data
    console.log(`${logPrefix} Analyzing with Claude AI`);
    let analysis: any;
    try {
      analysis = await extractDataFromText(extractedText);
      console.log(`${logPrefix} Analysis completed`);
    } catch (aiError) {
      throw new Error(`Failed to analyze PDF: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
    }

    if (!analysis || !analysis.rut || !analysis.patente || !analysis.fechaIngreso) {
      const missingFields = [];
      if (!analysis?.rut) missingFields.push('rut');
      if (!analysis?.patente) missingFields.push('patente');
      if (!analysis?.fechaIngreso) missingFields.push('fechaIngreso');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log(`${logPrefix} Data validated`);

    // Calculate prescription date using shared functions
    const fechaIngreso = typeof analysis.fechaIngreso === 'string'
      ? new Date(analysis.fechaIngreso)
      : analysis.fechaIngreso;
    const fechaPrescripcion = calculatePrescriptionDate(fechaIngreso);
    const estado = getStatus(fechaIngreso);
    const diasRestantes = getDaysRemaining(fechaIngreso);

    console.log(`${logPrefix} Prescription calculated - estado: ${estado}, diasRestantes: ${diasRestantes}`);

    // Get or create user
    console.log(`${logPrefix} Getting or creating user`);
    let user = await prisma.user.findUnique({
      where: { email: solicitud.email },
    });

    if (!user) {
      console.log(`${logPrefix} Creating new user`);
      user = await prisma.user.create({
        data: {
          email: solicitud.email,
          password: '',
          phone: solicitud.telefono,
          rut: analysis.rut,
        },
      });
    } else if (!user.rut && analysis.rut) {
      console.log(`${logPrefix} Updating user RUT`);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { rut: analysis.rut },
      });
    }

    // Create Multa record
    console.log(`${logPrefix} Creating Multa record`);
    const multa = await prisma.multa.create({
      data: {
        userId: user.id,
        rut: analysis.rut,
        patente: analysis.patente,
        monto: analysis.monto || 0,
        articulo: analysis.articulo,
        fechaIngreso,
        fechaPrescripcion,
        estado,
        diasRestantes,
        pdfOriginalUrl: solicitud.pdfUrl,
      },
    });

    console.log(`${logPrefix} Multa created: ${multa.id}`);

    // Send analysis email
    console.log(`${logPrefix} Sending analysis email`);
    try {
      await sendMultaAnalysisEmail(
        solicitud.email,
        analysis.rut,
        analysis.patente,
        estado,
      );
    } catch (emailError) {
      console.warn(`${logPrefix} Email failed (non-blocking):`, emailError);
    }

    // Mark solicitud as processed
    console.log(`${logPrefix} Marking solicitud as PROCESADA`);
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
        detalles: `Procesada. Multa: ${multa.id}, Patente: ${analysis.patente}, Estado: ${estado}`,
      },
    });

    console.log(`${logPrefix} Job completed successfully`);
  } catch (error) {
    console.error(`${logPrefix} Job failed:`, error instanceof Error ? error.message : error);

    const prisma = await getPrisma();
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
    });

    if (solicitud) {
      const nextAttempt = new Date();
      const backoffMinutes = Math.pow(5, solicitud.intento);
      nextAttempt.setMinutes(nextAttempt.getMinutes() + backoffMinutes);

      const maxAttempts = 3;
      const willRetry = solicitud.intento < maxAttempts - 1;

      console.log(`${logPrefix} Attempt ${solicitud.intento + 1}/${maxAttempts}, willRetry: ${willRetry}`);

      await prisma.solicitud.update({
        where: { id: solicitudId },
        data: {
          intento: solicitud.intento + 1,
          proximoIntento: willRetry ? nextAttempt : null,
          estado: willRetry ? 'PENDIENTE' : 'ERROR',
        },
      });

      if (!willRetry) {
        await prisma.auditLog.create({
          data: {
            accion: 'SOLICITUD_PROCESSING_FAILED',
            recurso: 'Solicitud',
            recursoId: solicitudId,
            detalles: `Failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        });
      }
    }
  }
}
