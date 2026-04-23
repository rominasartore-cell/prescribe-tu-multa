import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature, getPaymentInfo } from '@/lib/mercado-pago';

export async function POST(request: NextRequest) {
  try {
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const body = await request.json();

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, xSignature || undefined, xRequestId || undefined);
    if (!isValid) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ received: true });
    }

    // Handle payment notifications
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (paymentId) {
        const payment = await getPaymentInfo(paymentId);

        if (payment.status === 'approved') {
          const externalRef = payment.external_reference;

          // Parse external reference to get multaId and userId
          const match = externalRef.match(/multa_(.+?)_user_(.+)/);
          if (match) {
            const [, multaId, userId] = match;

            // Update multa as paid
            await prisma.multa.update({
              where: { id: multaId },
              data: { pagado: true },
            });

            // Update payment record
            await prisma.pago.updateMany({
              where: { multaId },
              data: {
                mercadoPagoId: String(paymentId),
                estado: 'PAGADO',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true }); // Still return 200 to prevent retries
  }
}

export async function GET(request: NextRequest) {
  // For webhook verification if needed
  return NextResponse.json({ ok: true });
}
