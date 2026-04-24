'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="w-full">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Prescribe Tu Multa</div>
          <nav className="flex gap-6">
            <Link href="#features" className="text-gray-600 hover:text-primary">
              Características
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-primary">
              Precios
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-primary">
              Preguntas
            </Link>
            <Link
              href="/auth/login"
              className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            ¿Tu multa de tránsito está <span className="text-secondary">prescrita?</span>
          </h1>
          <p className="text-xl mb-8 text-gray-100">
            Carga tu certificado RMNP en 30 segundos y descubre si ya expiró tu deuda.
            Análisis automático con IA + documentos legales incluidos.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Analizar Mi Multa →
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Sube tu multa', desc: 'Carga el PDF de tu RMNP' },
              { num: '2', title: 'IA analiza', desc: 'Extrae datos automáticamente' },
              { num: '3', title: 'Resultado gratis', desc: 'Ve si está prescrita' },
              { num: '4', title: 'Documentos', desc: '$19.990 CLP por escrito' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">¿Qué incluye?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: '📄',
                title: 'Resultado gratis',
                desc: 'RUT, patente, monto, estado - sin pagar nada',
              },
              {
                icon: '🤖',
                title: 'Análisis IA',
                desc: 'Claude API extrae datos del PDF con 99% precisión',
              },
              {
                icon: '✓',
                title: 'Prescripción garantizada',
                desc: '3 años desde RMNP - cálculo legal exacto',
              },
              {
                icon: '📧',
                title: 'Email + WhatsApp',
                desc: 'Recibe resultados en ambos canales al instante',
              },
              {
                icon: '⚖️',
                title: 'Documentos legales',
                desc: 'PDF análisis + DOCX escrito judicial (opcional)',
              },
              {
                icon: '🔐',
                title: 'Datos seguros',
                desc: 'Encriptados en AWS S3 con máximo nivel de seguridad',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-lg border border-gray-200">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Precios transparentes</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Análisis Gratuito</h3>
              <p className="text-gray-600 mb-6">Ideal para verificar si tu multa prescribió</p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>RUT y patente</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Monto de la multa</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Estado (PRESCRITA/VIGENTE)</span>
                </li>
              </ul>
              <button className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90">
                Comenzar
              </button>
            </div>
            <div className="bg-white p-8 rounded-lg border-2 border-secondary shadow-lg">
              <div className="bg-secondary text-white px-3 py-1 rounded w-fit text-sm font-semibold mb-4">
                MÁS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-4">Documentos Legales</h3>
              <p className="text-3xl font-bold text-secondary mb-6">$19.990 CLP</p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Todo del plan gratuito</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>PDF análisis legal detallado</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>DOCX escrito judicial</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Descarga inmediata</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Envío por email + WhatsApp</span>
                </li>
              </ul>
              <button className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90">
                Desbloquear Documentos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Preguntas frecuentes</h2>
          <div className="space-y-6">
            {[
              {
                q: '¿Qué es RMNP?',
                a: 'Registro de Multas No Pagadas. Cuando infracionas en tránsito, la multa entra aquí y prescriba en 3 años desde su ingreso.',
              },
              {
                q: '¿Cuál es el plazo de prescripción?',
                a: 'Exactamente 3 años desde la fecha de ingreso en RMNP. Después de eso, la acción para cobrar prescribe conforme a ley.',
              },
              {
                q: '¿Es legal usar los documentos generados?',
                a: 'Son informativos. Se recomienda encarecidamente consultar con un abogado antes de presentarlos en tribunal.',
              },
              {
                q: '¿Qué datos subes a internet?',
                a: 'Solo tu PDF. Lo procesamos con AWS Textract + Claude API, luego se elimina. Encriptado en tránsito y en reposo.',
              },
              {
                q: '¿Garantizan que funcione?',
                a: 'No. Ofrecemos análisis informativo. Cada caso es único. Consulta siempre con un abogado certificado.',
              },
              {
                q: '¿Devuelven dinero?',
                a: 'Sí. Si los documentos no te sirven, devolvemos íntegramente el costo de $19.990 CLP.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Descubre si tu multa prescribió</h2>
          <p className="text-xl mb-8 text-gray-100">Análisis gratuito en 30 segundos. Sin compromiso.</p>
          <Link
            href="/auth/register"
            className="inline-block bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90"
          >
            Comenzar ahora →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Prescribe Tu Multa</h3>
              <p className="text-gray-300 text-sm">
                Plataforma legal-tech para análisis de multas chilenas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link href="#features">Características</Link>
                </li>
                <li>
                  <Link href="#pricing">Precios</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link href="/legal/terms">Términos</Link>
                </li>
                <li>
                  <Link href="/legal/privacy">Privacidad</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-gray-300 text-sm">support@prescribeulmulta.cl</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-300 text-sm">
            <p>&copy; 2024 Prescribe Tu Multa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
