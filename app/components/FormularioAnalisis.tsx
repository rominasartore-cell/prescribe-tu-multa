'use client';

import { useState } from 'react';
import { Dropzone } from './Dropzone';

interface FormularioState {
  nombre: string;
  patente: string;
  email: string;
  telefono: string;
  aceptaTerminos: boolean;
  archivo: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function FormularioAnalisis() {
  const [form, setForm] = useState<FormularioState>({
    nombre: '',
    patente: '',
    email: '',
    telefono: '',
    aceptaTerminos: false,
    archivo: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Formatear patente: ABCD12 -> ABCD-12, abcd 12 -> ABCD-12
  const formatearPatente = (valor: string) => {
    let patente = valor
      .toUpperCase()
      .replace(/\s/g, '')
      .trim();

    // Separar letras y números
    const match = patente.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      patente = `${match[1]}-${match[2]}`;
    }

    return patente;
  };

  const handlePatente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setForm({ ...form, patente: formatearPatente(valor) });
    if (errors.patente) {
      setErrors({ ...errors, patente: '' });
    }
  };

  const handleTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.startsWith('56')) {
      valor = valor.substring(2);
    }
    setForm({ ...form, telefono: valor });
    if (errors.telefono) {
      setErrors({ ...errors, telefono: '' });
    }
  };

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, email: e.target.value });
    if (errors.email) {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleNombre = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, nombre: e.target.value });
    if (errors.nombre) {
      setErrors({ ...errors, nombre: '' });
    }
  };

  const validar = (): boolean => {
    const nuevosErrores: FormErrors = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!form.patente.trim()) {
      nuevosErrores.patente = 'La patente es obligatoria';
    } else if (!/^[A-Z]{2,3}-?\d{4}$|^[A-Z]{4}-?\d{2}$/.test(form.patente)) {
      nuevosErrores.patente = 'Formato de patente inválido (ej: ABCD-12)';
    }

    if (!form.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    if (!form.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{7,9}$/.test(form.telefono.replace(/\D/g, ''))) {
      nuevosErrores.telefono = 'Teléfono chileno inválido';
    }

    if (!form.archivo) {
      nuevosErrores.archivo = 'El certificado PDF es obligatorio';
    }

    if (!form.aceptaTerminos) {
      nuevosErrores.aceptaTerminos = 'Debes aceptar los términos';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    setLoading(true);

    try {
      console.log('[FormularioAnalisis] Form data before submission:', {
        nombre: form.nombre,
        patente: form.patente,
        email: form.email,
        telefono: form.telefono,
        aceptaTerminos: form.aceptaTerminos,
        archivoName: form.archivo?.name,
        archivoSize: form.archivo?.size,
        archivoType: form.archivo?.type,
      });

      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('patente', form.patente);
      formData.append('email', form.email);
      formData.append('telefono', form.telefono);
      formData.append('aceptaTerminos', form.aceptaTerminos.toString());
      if (form.archivo) {
        formData.append('file', form.archivo);
      }

      console.log('[FormularioAnalisis] FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: "${value}"`);
        }
      }

      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      console.log('[FormularioAnalisis] Server response:', data);

      if (!response.ok) {
        const errorMsg = data.errors
          ? Object.values(data.errors).join(', ')
          : data.error || 'Error al procesar la solicitud';
        setErrors({ submit: errorMsg });
        setLoading(false);
        return;
      }

      setEnviado(true);
    } catch (error) {
      console.error('[FormularioAnalisis] Error:', error);
      setErrors({ submit: 'Error de conexión. Intenta de nuevo.' });
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          ¡Solicitud recibida correctamente!
        </h2>
        <p className="text-gray-600 mb-6">
          Hemos recibido tu solicitud correctamente. Revisaremos el certificado ingresado y te
          contactaremos por WhatsApp o correo electrónico con el resultado del análisis
          preliminar.
        </p>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
          <p>
            <strong>Contacto:</strong> {form.email} / +56 {form.telefono}
          </p>
        </div>
        <button
          onClick={() => {
            setEnviado(false);
            setForm({
              nombre: '',
              patente: '',
              email: '',
              telefono: '',
              aceptaTerminos: false,
              archivo: null,
            });
          }}
          className="mt-6 bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">Analizar tu multa</h2>
      <p className="text-gray-600 mb-8">
        Completa el formulario y sube tu certificado RMNP. Te contactaremos en 24 horas.
      </p>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo *
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={handleNombre}
            placeholder="Ej: Juan Pérez"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
        </div>

        {/* Patente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patente del vehículo *
          </label>
          <input
            type="text"
            value={form.patente}
            onChange={handlePatente}
            placeholder="Ej: ABCD-12 o AB-1234"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary uppercase ${
              errors.patente ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.patente && <p className="text-red-600 text-sm mt-1">{errors.patente}</p>}
          <p className="text-xs text-gray-500 mt-1">Se formatea automáticamente</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={handleEmail}
            placeholder="tu@email.com"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono / WhatsApp *
          </label>
          <input
            type="tel"
            value={form.telefono}
            onChange={handleTelefono}
            placeholder="+56 9 XXXX XXXX"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
          <p className="text-xs text-gray-500 mt-1">Formato: 9 XXXX XXXX o +56 9 XXXX XXXX</p>
        </div>

        {/* Archivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificado de multa (PDF) *
          </label>
          <Dropzone
            onFileSelect={(file) => {
              setForm({ ...form, archivo: file });
              if (errors.archivo) {
                setErrors({ ...errors, archivo: '' });
              }
            }}
            archivo={form.archivo}
          />
          {errors.archivo && <p className="text-red-600 text-sm mt-1">{errors.archivo}</p>}
        </div>

        {/* Términos */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="aceptaTerminos"
            checked={form.aceptaTerminos}
            onChange={(e) => {
              setForm({ ...form, aceptaTerminos: e.target.checked });
              if (errors.aceptaTerminos) {
                setErrors({ ...errors, aceptaTerminos: '' });
              }
            }}
            className="mt-1 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="aceptaTerminos" className="text-sm text-gray-600">
            <span>Acepto que </span>
            <strong>el análisis depende de la información que proporciono y del certificado adjunto</strong>
            <span>. He leído los </span>
            <a href="/legal/terms" target="_blank" className="text-secondary hover:underline">
              términos de servicio
            </a>
            <span>. *</span>
          </label>
        </div>
        {errors.aceptaTerminos && (
          <p className="text-red-600 text-sm">{errors.aceptaTerminos}</p>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Procesando...' : 'Enviar solicitud'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Los campos marcados con * son obligatorios
        </p>
      </form>
    </div>
  );
}
