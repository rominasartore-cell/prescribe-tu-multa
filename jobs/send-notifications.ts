import { prisma } from '@/lib/db';
import { sendMultaAnalysisEmail } from '@/lib/email';
import { sendWhatsappMessage } from '@/lib/whatsapp';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 60000; // 1 minute

export async function sendNotificationsJob() {
  try {
    const now = new Date();

    // Get pending notifications
    const pendingNotifs = await prisma.notificacion.findMany({
      where: {
        estado: 'PENDIENTE',
        OR: [
          { proximoIntento: null },
          { proximoIntento: { lte: now } },
        ],
      },
      take: 50, // Process max 50 at a time
    });

    console.log(`Processing ${pendingNotifs.length} pending notifications`);

    for (const notif of pendingNotifs) {
      try {
        let success = false;

        if (notif.tipo === 'EMAIL') {
          const result = await sendMultaAnalysisEmail(
            notif.destinatario,
            'N/A', // Subject variations handled in template
            'N/A',
            'PENDIENTE',
          );
          success = result;
        } else if (notif.tipo === 'WHATSAPP') {
          success = await sendWhatsappMessage(
            notif.destinatario,
            notif.mensaje,
          );
        }

        if (success) {
          await prisma.notificacion.update({
            where: { id: notif.id },
            data: {
              estado: 'ENVIADO',
              intentos: notif.intentos + 1,
            },
          });
        } else {
          // Schedule retry
          const proximoIntento = new Date(now.getTime() + RETRY_DELAY_MS * (notif.intentos + 1));

          if (notif.intentos < MAX_RETRIES) {
            await prisma.notificacion.update({
              where: { id: notif.id },
              data: {
                intentos: notif.intentos + 1,
                proximoIntento,
              },
            });
          } else {
            await prisma.notificacion.update({
              where: { id: notif.id },
              data: {
                estado: 'FALLIDO',
                intentos: notif.intentos + 1,
              },
            });
          }
        }
      } catch (error) {
        console.error(`Error sending notification ${notif.id}:`, error);

        // Increment retry count
        const proximoIntento = new Date(now.getTime() + RETRY_DELAY_MS * (notif.intentos + 1));

        if (notif.intentos < MAX_RETRIES) {
          await prisma.notificacion.update({
            where: { id: notif.id },
            data: {
              intentos: notif.intentos + 1,
              proximoIntento,
            },
          });
        } else {
          await prisma.notificacion.update({
            where: { id: notif.id },
            data: {
              estado: 'FALLIDO',
              intentos: notif.intentos + 1,
            },
          });
        }
      }
    }

    console.log('Notification job completed');
  } catch (error) {
    console.error('Error in notification job:', error);
    throw error;
  }
}
