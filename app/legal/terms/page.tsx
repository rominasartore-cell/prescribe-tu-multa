import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-primary mb-8">Términos de Servicio</h1>

        <div className="bg-white rounded-lg border border-gray-200 p-8 prose max-w-none">
          <h2>1. Naturaleza del Servicio</h2>
          <p>
            Prescribe Tu Multa ("el Servicio") es una plataforma de legal-tech que proporciona análisis
            automatizado de multas de tránsito chilenas. El Servicio NO constituye asesoramiento legal
            profesional.
          </p>

          <h2>2. Limitaciones de Responsabilidad</h2>
          <p>
            El análisis proporcionado es informativo solamente. Los usuarios deben consultar con un
            abogado licenciado antes de tomar cualquier acción legal. Prescribe Tu Multa no se
            responsabiliza por:
          </p>
          <ul>
            <li>Errores en la extracción de datos</li>
            <li>Cambios en la legislación posterior al análisis</li>
            <li>Circunstancias especiales del caso del usuario</li>
            <li>Pérdidas derivadas del uso del Servicio</li>
          </ul>

          <h2>3. Garantía</h2>
          <p>
            El Servicio se proporciona "TAL COMO ESTÁ" sin garantías de ningún tipo, expresas o
            implícitas. Ofrecemos reembolso completo si los documentos no son útiles (dentro de 30
            días de compra).
          </p>

          <h2>4. Datos del Usuario</h2>
          <p>
            Los archivos PDF cargados se procesan mediante AWS Textract y Claude API, luego se
            elimina automáticamente. Los datos personales se almacenan según nuestra Política de
            Privacidad.
          </p>

          <h2>5. Pago y Política de Reembolso</h2>
          <p>
            Los pagos se procesan vía Mercado Pago. El plan premium ($19.990 CLP) incluye documentos
            PDF y DOCX. Se ofrece reembolso completo dentro de 30 días si no estás satisfecho.
          </p>

          <h2>6. Cambios en los Términos</h2>
          <p>
            Prescribe Tu Multa se reserva el derecho de modificar estos términos en cualquier momento.
            Se notificará a los usuarios de cambios sustanciales.
          </p>

          <h2>7. Jurisdicción</h2>
          <p>
            Estos términos se rigen por la ley de la República de Chile. Cualquier disputa se
            resolverá en los tribunales de Santiago.
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
