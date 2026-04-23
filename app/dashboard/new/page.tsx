'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

export default function NewMultaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Selecciona un archivo PDF');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al procesar');
        setLoading(false);
        return;
      }

      setResult(data.multa);
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">¡Multa analizada!</h1>
            <p className="text-gray-600">Aquí está tu resultado preliminar</p>
          </div>

          <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-700 font-semibold">RUT</span>
              <span className="text-gray-900 font-bold">{result.rut}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-700 font-semibold">Patente</span>
              <span className="text-gray-900 font-bold">{result.patente}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-700 font-semibold">Monto</span>
              <span className="text-gray-900 font-bold">
                ${result.monto.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-700 font-semibold">Estado</span>
              <span
                className={`font-bold ${
                  result.estado === 'PRESCRITA' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {result.estado === 'PRESCRITA' ? '✓ PRESCRITA' : '⚠ VIGENTE'}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Resultado preliminar:</strong> Este análisis está basado en datos extraídos
              automáticamente. Se recomienda verificar con un abogado antes de tomar acciones legales.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/dashboard/multas/${result.id}`)}
              className="flex-1 bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Ver detalles
            </button>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cargar otra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Cargar una multa</h1>
        <p className="text-gray-600">Sube tu certificado RMNP en formato PDF</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-secondary bg-secondary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {isDragActive ? 'Suelta aquí' : 'Arrastra tu PDF o haz clic'}
          </p>
          <p className="text-gray-600">Soportamos archivos PDF hasta 50MB</p>
        </div>

        {/* File preview */}
        {file && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-danger hover:underline"
              >
                Cambiar
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analizando...' : 'Analizar multa'}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Tu PDF se procesa con <strong>AWS Textract</strong> + <strong>Claude IA</strong> y luego se
          elimina de nuestros servidores.
        </p>
      </form>
    </div>
  );
}
