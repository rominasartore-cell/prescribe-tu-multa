import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Prescribe Tu Multa
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-primary mb-8">Política de Privacidad</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-8 prose max-w-none">
          <h2>1. Información que Recopilamos</h2>
          <p>Prescribe Tu Multa recopila la siguiente información:</p>
          <ul>
            <li>
              <strong>Datos de registro:</strong> Email, contraseña (encriptada), teléfono (opcional)
            </li>
            <li>
              <strong>Documentos:</strong> Archivos PDF cargados (procesados y eliminados tras análisis)
            </li>
            <li>
              <strong>Datos extraídos:</strong> RUT, patente, monto, fechas (almacenados en BD
              PostgreSQL)
            </li>
            <li>
              <strong>Información de pago:</strong> Transacciones (procesadas por Mercado Pago)
            </li>
          </ul>

          <h2>2. Cómo Usamos tus Datos</h2>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Procesar tu análisis de multa</li>
            <li>Generar documentos legales</li>
            <li>Enviar resultados por email y WhatsApp</li>
            <li>Procesar pagos</li>
            <li>Mejorar el servicio</li>
            <li>Cumplir con requisitos legales</li>
          </ul>

          <h2>3. Almacenamiento y Seguridad</h2>
          <p>
            <strong>PDFs originales:</strong> Se almacenan encriptados en AWS S3 con restricción de
            acceso. Se eliminan 90 días después si el usuario lo solicita.
          </p>
          <p>
            <strong>Base de datos:</strong> PostgreSQL en AWS, encriptado en tránsito (TLS 1.2+) y en
            reposo (AES-256).
          </p>
          <p>
            <strong>Contraseñas:</strong> Se hashean con bcryptjs con 12 rondas de salt.
          </p>

          <h2>4. Terceros</h2>
          <p>Compartimos datos mínimos con:</p>
          <ul>
            <li>
              <strong>AWS:</strong> Almacenamiento y procesamiento (Textract, S3)
            </li>
            <li>
              <strong>Anthropic:</strong> Análisis de texto (Claude API) - sin guardar historiales
            </li>
            <li>
              <strong>Mercado Pago:</strong> Procesamiento de pagos
            </li>
            <li>
              <strong>Resend:</strong> Envío de emails
            </li>
            <li>
              <strong>WhatsApp Business API:</strong> Mensajería (requiere consentimiento)
            </li>
          </ul>

          <h2>5. Derechos ARCO</h2>
          <p>
            Conforme a la Ley de Protección de Datos Personales (Ley 19.628), tienes derecho a:
          </p>
          <ul>
            <li>
              <strong>Acceso:</strong> Solicitar copia de tus datos personales
            </li>
            <li>
              <strong>Rectificación:</strong> Corregir datos inexactos
            </li>
            <li>
              <strong>Cancelación:</strong> Solicitar eliminación de datos
            </li>
            <li>
              <strong>Oposición:</strong> Rechazar ciertos usos de datos
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, contacta a{' '}
            <strong>privacy@prescribetumlta.cl</strong>
          </p>

          <h2>6. Cookies y Rastreo</h2>
          <p>
            Utilizamos NextAuth.js para sesiones (cookie segura, solo-HTTP). No usamos cookies de
            rastreo de terceros excepto Google Analytics (anónimo).
          </p>

          <h2>7. Retención de Datos</h2>
          <ul>
            <li>Datos de cuenta: Mientras mantengas la cuenta activa</li>
            <li>PDFs procesados: 90 días máximo</li>
            <li>Registros de pago: 7 años (legal)</li>
            <li>Logs de acceso: 30 días</li>
          </ul>

          <h2>8. Cambios en Esta Política</h2>
          <p>
            Notificaremos cambios sustanciales por email. El uso continuado implica aceptación de
            cambios.
          </p>

          <h2>9. Contacto</h2>
          <p>
            Preguntas sobre privacidad: <strong>privacy@prescribetumlta.cl</strong>
          </p>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-8">
            <p className="text-blue-800">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-CL')}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-secondary font-semibold hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
