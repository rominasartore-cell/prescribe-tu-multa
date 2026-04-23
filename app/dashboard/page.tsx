'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Multa {
  id: string;
  rut: string;
  patente: string;
  monto: number;
  estado: string;
  diasRestantes: number | null;
  pagado: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMultas();
  }, []);

  async function fetchMultas() {
    try {
      const response = await fetch('/api/multas');
      const data = await response.json();

      if (data.success) {
        setMultas(data.multas);
      } else {
        setError(data.error || 'Error al cargar multas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Mis Multas</h1>
        <p className="text-gray-600">Gestiona y analiza tus multas de tránsito</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      {multas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Sin multas aún</h2>
          <p className="text-gray-600 mb-6">No tienes multas cargadas. ¡Comienza por cargar una!</p>
          <Link
            href="/dashboard/new"
            className="inline-block bg-secondary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
          >
            Cargar mi primera multa
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {multas.map((multa) => (
            <Link key={multa.id} href={`/dashboard/multas/${multa.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-primary">
                        {multa.patente}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          multa.estado === 'PRESCRITA'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {multa.estado}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">RUT: {multa.rut}</p>
                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-700">
                        <strong>Monto:</strong> ${multa.monto.toLocaleString('es-CL')}
                      </span>
                      {multa.diasRestantes !== null && multa.diasRestantes > 0 && (
                        <span className="text-gray-700">
                          <strong>Quedan:</strong> {multa.diasRestantes} días
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {!multa.pagado ? (
                      <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded text-sm font-semibold">
                        Documentos disponibles
                      </div>
                    ) : (
                      <div className="bg-green-50 text-green-700 px-3 py-1 rounded text-sm font-semibold">
                        ✓ Documentos comprados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <Link
          href="/dashboard/new"
          className="inline-block bg-secondary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          ➕ Cargar otra multa
        </Link>
      </div>
    </div>
  );
}
