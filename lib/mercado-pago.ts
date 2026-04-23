import axios from 'axios';
import { MercadoPagoPreference, MercadoPagoPayment } from './types';
import crypto from 'crypto';

const MP_API_URL = 'https://api.mercadopago.com/v1';

const mpClient = axios.create({
  baseURL: MP_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export async function createPaymentPreference(
  multaId: string,
  userId: string,
  email: string,
): Promise<MercadoPagoPreference> {
  const preference = {
    items: [
      {
        title: 'Análisis Legal de Multa de Tránsito',
        quantity: 1,
        currency_id: 'CLP',
        unit_price: 19990,
      },
    ],
    payer: {
      email,
    },
    external_reference: `multa_${multaId}_user_${userId}`,
    notification_url: process.env.MERCADO_PAGO_NOTIFICATION_URL,
    auto_return: 'approved',
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/checkout/success`,
      failure: `${process.env.NEXTAUTH_URL}/checkout/failure`,
      pending: `${process.env.NEXTAUTH_URL}/checkout/pending`,
    },
  };

  const response = await mpClient.post('/checkout/preferences', preference);
  return response.data;
}

export async function getPaymentInfo(paymentId: number): Promise<MercadoPagoPayment> {
  const response = await mpClient.get(`/payments/${paymentId}`);
  return response.data;
}

export async function verifyWebhookSignature(
  _data: Record<string, unknown>,
  xSignature: string | undefined,
  xRequestId: string | undefined,
): Promise<boolean> {
  if (!xSignature || !xRequestId) return false;

  const secret = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  const parts = xSignature.split(',');

  for (const part of parts) {
    const [ts, hash] = part.split('=');
    if (!ts || !hash) continue;

    const timestamp = ts.trim();
    const signature = hash.trim();

    const message = `id=${xRequestId};request-id=${xRequestId};ts=${timestamp}`;
    const hmac = crypto.createHmac('sha256', secret).update(message).digest('hex');

    if (hmac === signature) {
      return true;
    }
  }

  return false;
}

export async function getPaymentByExternalReference(externalReference: string): Promise<MercadoPagoPayment | null> {
  try {
    const response = await mpClient.get('/payments/search', {
      params: {
        external_reference: externalReference,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
  } catch (error) {
    console.error('Error fetching payment:', error);
  }

  return null;
}
