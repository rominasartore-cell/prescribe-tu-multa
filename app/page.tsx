'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import FormularioAnalisis from './components/FormularioAnalisis';
import { CheckCircle, Shield, FileText, Clock, Zap } from 'lucide-react';

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
      <header className="sticky top-0 bg-white border-b border-gray-100 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <div className="text-xl font-bold text-primary">Prescribe Tu Multa</div>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#como-funciona" className="text-text-secondary hover:text-primary transition-colors">
              Cómo funciona
            </Link>
            <Link href="#faq" className="text-text-secondary hover:text-primary transition-colors">
              Preguntas
            </Link>
            <Link
              href="/auth/login"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary-dark text-white py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="slide-in-down">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Prescribe tu multa TAG de forma simple y online
              </h1>
              <p className="text-lg text-gray-100 mb-8 leading-relaxed">
                Sube tu certificado de multas, revisamos si existen infracciones prescritas y preparamos la información para iniciar el trámite correspondiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#formulario"
                  className="btn-primary text-center"
                >
                  Subir certificado
                </Link>
                <Link
                  href="#como-funciona"
                  className="btn-outline text-center"
                >
                  Ver cómo funciona
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 slide-in-up">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
                <Zap className="w-8 h-8 mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Análisis de prescripción</h3>
                <p className="text-sm text-gray-200">Verificamos el estado legal de tu multa</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
                <FileText className="w-8 h-8 mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Certificado RMNP</h3>
                <p className="text-sm text-gray-200">Procesamos tu documento automáticamente</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
                <Shield className="w-8 h-8 mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Revisión legal</h3>
                <p className="text-sm text-gray-200">Análisis conforme a la ley chilena</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
                <CheckCircle className="w-8 h-8 mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Resultado claro</h3>
                <p className="text-sm text-gray-200">Información precisa y confiable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario Principal */}
      <section id="formulario" className="py-20 bg-bg-light">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Comienza tu análisis</h2>
            <p className="text-text-secondary text-lg">Sube tu certificado y obtén resultados en segundos</p>
          </div>
          <FormularioAnalisis />
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-16">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Sube tu certificado',
                desc: 'Carga el PDF de tu certificado RMNP de multas de tránsito',
                icon: FileText,
              },
              {
                num: '2',
                title: 'Revisamos las fechas',
                desc: 'Analizamos la fecha de ingreso al registro para determinar prescripción',
                icon: Clock,
              },
              {
                num: '3',
                title: 'Recibes orientación',
                desc: 'Obtienes documentos y orientación para continuar con el trámite',
                icon: CheckCircle,
              },
            ].map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <div key={idx} className="card text-center">
                  <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">{step.title}</h3>
                  <p className="text-text-secondary">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm">
            <div className="flex gap-4 mb-6">
              <Shield className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4">Servicio responsable y confiable</h3>
                <p className="text-text-secondary text-lg mb-6 leading-relaxed">
                  Servicio orientado a la revisión de antecedentes de multas de tránsito conforme a la información contenida en el certificado acompañado por el usuario.
                </p>
                <div className="bg-accent bg-opacity-10 border-l-4 border-accent p-4 rounded">
                  <p className="text-text-primary font-medium">
                    ⚠️ El análisis depende de la información disponible en el certificado y no reemplaza la resolución de la autoridad competente. Se recomienda consultar con un abogado certificado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-text-primary mb-16">Preguntas frecuentes</h2>
          <div className="space-y-6">
            {[
              {
                q: '¿Qué certificado necesito subir?',
                a: 'Necesitas el certificado RMNP (Registro de Multas No Pagadas) emitido por Carabineros o a través del sitio web oficial.',
              },
              {
                q: '¿Qué significa que una multa esté prescrita?',
                a: 'Significa que han pasado 3 años desde la fecha de ingreso al RMNP y, conforme a la ley, la acción para cobrar ya no es válida.',
              },
              {
                q: '¿El trámite es automático?',
                a: 'No. Nuestro servicio proporciona análisis y documentos informativos. El trámite legal debe realizarse con asesoría profesional.',
              },
              {
                q: '¿Qué pasa después de enviar mi solicitud?',
                a: 'Revisaremos tu certificado y te contactaremos con el resultado del análisis y los documentos generados.',
              },
              {
                q: '¿Mis datos están protegidos?',
                a: 'Sí. Tus datos se procesan de forma segura y encriptada. Solo utilizamos la información necesaria para el análisis.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="card">
                <h3 className="font-bold text-lg text-text-primary mb-3">{faq.q}</h3>
                <p className="text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para revisar tu multa?</h2>
          <p className="text-lg text-gray-100 mb-8">Análisis gratuito en segundos. Sin compromiso.</p>
          <Link
            href="#formulario"
            className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Comenzar ahora →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="font-bold text-lg">Prescribe Tu Multa</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Plataforma legal-tech para análisis de multas de tránsito en Chile.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link href="#como-funciona" className="hover:text-white transition-colors">
                    Cómo funciona
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-white transition-colors">
                    Preguntas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link href="/legal/terms" className="hover:text-white transition-colors">
                    Términos de servicio
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-white transition-colors">
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-gray-300 text-sm">support@prescribeulmulta.cl</p>
              <p className="text-gray-400 text-xs mt-4">Disponible de lunes a viernes, 9:00 - 18:00 CLT</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-300 text-sm">&copy; 2024 Prescribe Tu Multa. Todos los derechos reservados.</p>
              <p className="text-gray-400 text-xs">
                Servicio de análisis informativo. No reemplaza asesoría legal profesional.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
