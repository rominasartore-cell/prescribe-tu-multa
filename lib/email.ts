import { Resend } from 'resend';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendMultaAnalysisEmail(
  email: string,
  rut: string,
  patente: string,
  estado: string,
): Promise<boolean> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@prescribeulmulta.cl',
      to: email,
      subject: '✓ Tu multa ha sido analizada - Prescribe Tu Multa',
      html: `
        <h2>¡Tu multa ha sido analizada!</h2>
        <p>Hola,</p>
        <p>Hemos completado el análisis de tu multa de tránsito.</p>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>RUT:</strong> ${rut}</p>
          <p><strong>Patente:</strong> ${patente}</p>
          <p><strong>Estado:</strong> <span style="color: ${estado === 'PRESCRITA' ? '#059669' : '#DC2626'}; font-weight: bold;">${estado}</span></p>
        </div>
        <p>Inicia sesión en tu cuenta para ver el análisis completo y descargar los documentos.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Ver en Dashboard</a></p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
        <p style="color: #666; font-size: 12px;">Prescribe Tu Multa - Tu asistente legal de tránsito</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendSolicitudConfirmationEmail(
  email: string,
  nombre: string,
): Promise<boolean> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@prescribeulmulta.cl',
      to: email,
      subject: '✓ Hemos recibido tu solicitud - Prescribe Tu Multa',
      html: `
        <h2>¡Hemos recibido tu solicitud!</h2>
        <p>Hola ${nombre},</p>
        <p>Gracias por utilizar Prescribe Tu Multa. Hemos recibido tu solicitud de análisis de multa de tránsito.</p>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Estado:</strong> <span style="color: #059669; font-weight: bold;">PROCESANDO</span></p>
          <p style="color: #666; font-size: 14px;">Nuestro equipo está analizando tu certificado RMNP. Dentro de poco recibirás los resultados.</p>
        </div>
        <p><strong>¿Qué pasa ahora?</strong></p>
        <ul style="color: #666;">
          <li>Nuestro sistema analiza tu PDF con inteligencia artificial</li>
          <li>Extraemos los datos de tu multa (RUT, patente, monto, fecha)</li>
          <li>Calculamos si está prescrita según la ley (3 años desde RMNP)</li>
          <li>Te enviamos los resultados por email</li>
        </ul>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">⏱️ Tiempo estimado: 2-5 minutos</p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
        <p style="color: #999; font-size: 12px;">Si tienes dudas, contáctanos: ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@prescribeulmulta.cl'}</p>
        <p style="color: #999; font-size: 12px;">Prescribe Tu Multa - Tu asistente legal de tránsito</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending solicitud confirmation email:', error);
    return false;
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
): Promise<boolean> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@prescribeulmulta.cl',
      to: email,
      subject: '💳 Pago recibido - Generando documentos',
      html: `
        <h2>Pago recibido correctamente</h2>
        <p>Gracias por tu pago de $19.990 CLP</p>
        <p>Estamos generando tus documentos legales. En breve recibirás un email con los PDF y DOCX listos para descargar.</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">Tiempo estimado: 2-3 minutos</p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
        <p style="color: #666; font-size: 12px;">Prescribe Tu Multa - Tu asistente legal de tránsito</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

export async function sendDocumentsReadyEmail(
  email: string,
  downloadUrl: string,
): Promise<boolean> {
  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@prescribeulmulta.cl',
      to: email,
      subject: '📄 Tus documentos están listos',
      html: `
        <h2>Tus documentos legales están listos</h2>
        <p>Hola,</p>
        <p>Los documentos PDF y DOCX de tu análisis legal están listos para descargar.</p>
        <p><a href="${downloadUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Descargar documentos</a></p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">Los documentos incluyen:</p>
        <ul style="color: #666;">
          <li>PDF de análisis legal detallado</li>
          <li>DOCX con escrito judicial (si aplica)</li>
        </ul>
        <p style="margin-top: 30px; color: #999; font-size: 12px;"><strong>Nota:</strong> Estos documentos son informativos. Se recomienda consultar con un abogado antes de presentarlos.</p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
        <p style="color: #666; font-size: 12px;">Prescribe Tu Multa - Tu asistente legal de tránsito</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending documents email:', error);
    return false;
  }
}
