import { prisma } from '@/lib/db';
import { uploadToS3 } from '@/lib/ocr';
import { generatePdf } from '@/lib/pdf-generator';
import { generateDocx } from '@/lib/docx-generator';
import { sendDocumentsReadyEmail } from '@/lib/email';
import { sendWhatsappDocumentsReady } from '@/lib/whatsapp';
import { Packer } from 'docx';

export async function generateDocumentsJob(multaId: string) {
  try {
    const multa = await prisma.multa.findUnique({
      where: { id: multaId },
      include: { user: true },
    });

    if (!multa) {
      console.error(`Multa ${multaId} not found`);
      return;
    }

    // Generate PDF
    const pdfBuffer = generatePdf({
      rut: multa.rut,
      patente: multa.patente,
      monto: multa.monto,
      articulo: multa.articulo || undefined,
      fechaIngreso: multa.fechaIngreso,
      fechaPrescripcion: multa.fechaPrescripcion,
      estado: multa.estado as 'PRESCRITA' | 'VIGENTE',
      diasRestantes: multa.diasRestantes || 0,
    });

    const pdfS3Key = await uploadToS3(pdfBuffer, `documentos/pdf-${multaId}.pdf`);

    // Generate DOCX
    const doc = generateDocx({
      rut: multa.rut,
      patente: multa.patente,
      monto: multa.monto,
      articulo: multa.articulo || undefined,
      fechaIngreso: multa.fechaIngreso,
      fechaPrescripcion: multa.fechaPrescripcion,
      estado: multa.estado as 'PRESCRITA' | 'VIGENTE',
      diasRestantes: multa.diasRestantes || 0,
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const docxS3Key = await uploadToS3(docxBuffer, `documentos/docx-${multaId}.docx`);

    // Update multa with document URLs
    await prisma.multa.update({
      where: { id: multaId },
      data: {
        documentoPdfUrl: pdfS3Key,
        documentoDocxUrl: docxS3Key,
      },
    });

    // Send notification emails
    if (multa.user.email) {
      const downloadUrl = `${process.env.NEXTAUTH_URL}/dashboard/multas/${multaId}`;
      await sendDocumentsReadyEmail(
        multa.user.email,
        downloadUrl,
        multa.rut,
      );
    }

    // Send WhatsApp if phone available
    if (multa.user.phone) {
      const downloadUrl = `${process.env.NEXTAUTH_URL}/dashboard/multas/${multaId}`;
      await sendWhatsappDocumentsReady(multa.user.phone, downloadUrl);
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        accion: 'DOCUMENTOS_GENERADOS',
        recurso: 'Multa',
        recursoId: multaId,
        userId: multa.userId,
        detalles: `Documentos PDF y DOCX generados para multa ${multa.patente}`,
      },
    });

    console.log(`Documents generated for multa ${multaId}`);
  } catch (error) {
    console.error(`Error generating documents for multa ${multaId}:`, error);
    throw error;
  }
}
