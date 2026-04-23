'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Multa {
  id: string;
  rut: string;
  patente: string;
  monto: number;
  articulo?: string;
  fechaIngreso: string;
  fechaPrescripcion: string;
  estado: string;
  diasRestantes: number | null;
  pagado: boolean;
}

export default function MultaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [multa, setMulta] = useState<Multa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchMulta();
  }, [params.id]);

  async function fetchMulta() {
    try {
      const response = await fetch(`/api/multas/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setMulta(data.multa);
      } else {
        setError(data.error || 'Error al cargar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout() {
    if (!multa) return;

    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multaId: multa.id }),
      });

      const data = await response.json();

      if (data.success && data.init_point) {
        window.location.href = data.init_point;
      } else {
        setError('Error al procesar pago');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function downloadPDF() {
    if (!multa) return;
    const link = document.createElement('a');
    link.href = `/api/generate/pdf?multaId=${multa.id}`;
    link.download = `analisis-multa-${multa.rut}.pdf`;
    link.click();
  }

  async function downloadDOCX() {
    if (!multa) return;
    const link = document.createElement('a');
    link.href = `/api/generate/docx?multaId=${multa.id}`;
    link.download = `escrito-judicial-${multa.rut}.docx`;
    link.click();
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!multa) {
    return <div className="text-center py-12 text-danger">No encontrada</div>;
  }

  const fechaIngreso = new Date(multa.fechaIngreso).toLocaleDateString('es-CL');
  const fechaPrescripcion = new Date(multa.fechaPrescripcion).toLocaleDateString('es-CL');

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-secondary hover:underline">
          ← Volver
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">Multa {multa.patente}</h1>
          <span
            className={`px-4 py-2 rounded-lg text-lg font-bold ${
              multa.estado === 'PRESCRITA'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {multa.estado === 'PRESCRITA' ? '✓ PRESCRITA' : '⚠ VIGENTE'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">RUT</p>
              <p className="text-2xl font-bold text-gray-800">{multa.rut}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Monto</p>
              <p className="text-2xl font-bold text-gray-800">
                ${multa.monto.toLocaleString('es-CL')}
              </p>
            </div>
            {multa.articulo && (
              <div>
                <p className="text-gray-600 text-sm">Artículo</p>
                <p className="text-lg font-semibold text-gray-800">{multa.articulo}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Fecha de Ingreso RMNP</p>
              <p className="text-xl font-semibold text-gray-800">{fechaIngreso}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Fecha de Prescripción</p>
              <p className="text-xl font-semibold text-gray-800">{fechaPrescripcion}</p>
            </div>
            {multa.diasRestantes !== null && multa.diasRestantes > 0 && (
              <div>
                <p className="text-gray-600 text-sm">Días Restantes</p>
                <p className="text-xl font-semibold text-orange-600">{multa.diasRestantes} días</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentos Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">Documentos Legales</h2>

        {multa.pagado ? (
          <div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <p className="text-green-700 font-semibold">✓ Documentos desbloqueados</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={downloadPDF}
                className="bg-secondary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 flex items-center justify-center gap-2"
              >
                📄 Descargar PDF
              </button>
              <button
                onClick={downloadDOCX}
                className="bg-secondary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 flex items-center justify-center gap-2"
              >
                📋 Descargar DOCX
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Plan Premium</h3>
              <p className="text-gray-700 mb-6">
                Desbloquea análisis completo + escrito judicial por solo $19.990 CLP
              </p>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <span>PDF con análisis legal detallado</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <span>DOCX con escrito judicial</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Descarga inmediata</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">✓</span>
                  <span>Soporte por email</span>
                </li>
              </ul>

              <div className="text-3xl font-bold text-secondary mb-6">$19.990 CLP</div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
              >
                {checkoutLoading ? 'Procesando...' : 'Pagar con Mercado Pago'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
              <p>
                <strong>ℹ️ Nota:</strong> Se recomienda consultar con un abogado antes de usar estos
                documentos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
