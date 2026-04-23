import { prisma } from '@/lib/db';
import { sendMultaAnalysisEmail } from '@/lib/email';
import { sendWhatsappNotification } from '@/lib/whatsapp';

export async function processPdfJob(multaId: string) {
  try {
    const multa = await prisma.multa.findUnique({
      where: { id: multaId },
      include: { user: true },
    });

    if (!multa) {
      console.error(`Multa ${multaId} not found`);
      return;
    }

    // Send email notification
    if (multa.user.email) {
      await sendMultaAnalysisEmail(
        multa.user.email,
        multa.rut,
        multa.patente,
        multa.estado,
      );
    }

    // Send WhatsApp notification if phone available
    if (multa.user.phone) {
      await sendWhatsappNotification(
        multa.user.phone,
        multa.rut,
        multa.patente,
        multa.estado,
      );
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        accion: 'PDF_PROCESSED',
        recurso: 'Multa',
        recursoId: multaId,
        userId: multa.userId,
        detalles: `Multa ${multa.patente} procesada. Estado: ${multa.estado}`,
      },
    });

    console.log(`PDF job completed for multa ${multaId}`);
  } catch (error) {
    console.error(`Error processing PDF for multa ${multaId}:`, error);
    throw error;
  }
}
