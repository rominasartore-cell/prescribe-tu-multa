import axios from 'axios';

function getWhatsappClient() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error('WhatsApp environment variables are not set');
  }

  const WA_API_URL = `https://graph.instagram.com/v18.0/${phoneNumberId}`;

  return axios.create({
    baseURL: WA_API_URL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function sendWhatsappMessage(
  phoneNumber: string,
  message: string,
): Promise<boolean> {
  try {
    const waClient = getWhatsappClient();
    const response = await waClient.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(phoneNumber),
      type: 'text',
      text: {
        body: message,
      },
    });

    return !!response.data.messages?.[0]?.id;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

export async function sendWhatsappNotification(
  phoneNumber: string,
  rut: string,
  patente: string,
  estado: string,
): Promise<boolean> {
  const message = `Prescribe Tu Multa ✓\n\n¡Tu multa ha sido analizada!\n\nRUT: ${rut}\nPatente: ${patente}\nEstado: ${estado === 'PRESCRITA' ? '✓ PRESCRITA' : '⚠ VIGENTE'}\n\nRevisa tu análisis en: ${process.env.NEXTAUTH_URL}/dashboard`;

  return sendWhatsappMessage(phoneNumber, message);
}

export async function sendWhatsappDocumentsReady(
  phoneNumber: string,
  downloadUrl: string,
): Promise<boolean> {
  const message = `Prescribe Tu Multa ✓\n\nTus documentos están listos para descargar.\n\nEnlace: ${downloadUrl}\n\n⚠ Recuerda que necesitas consultar con un abogado antes de presentarlos.`;

  return sendWhatsappMessage(phoneNumber, message);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const clean = phone.replace(/\D/g, '');

  // If starts with 9 (Chilean mobile), add +56
  if (clean.startsWith('9')) {
    return '+56' + clean;
  }

  // If already has country code
  if (clean.startsWith('56')) {
    return '+' + clean;
  }

  // Otherwise add +56
  return '+56' + clean;
}
