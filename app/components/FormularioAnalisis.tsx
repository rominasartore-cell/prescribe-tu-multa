'use client';

import { useState } from 'react';
import { Dropzone } from './Dropzone';
import { isValidPatente, formatPatente } from '@/lib/patente';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

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

  const handlePatente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setForm({ ...form, patente: formatPatente(valor) });
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
    } else if (!isValidPatente(form.patente)) {
      nuevosErrores.patente = 'Formato de patente inválido. Ejemplos válidos: ABCD-12 o AB-1234.';
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
      <div className="card text-center max-w-2xl mx-auto slide-in-up">
        <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-4">
          ¡Solicitud recibida correctamente!
        </h2>
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          Hemos recibido tu solicitud correctamente. Revisaremos tu certificado y te contactaremos con el resultado del análisis.
        </p>
        <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 p-6 rounded-xl text-sm text-text-primary mb-8">
          <p className="font-semibold mb-2">Datos de contacto registrados:</p>
          <p className="text-text-secondary">{form.email}</p>
          <p className="text-text-secondary">+56 {form.telefono}</p>
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
          className="btn-primary"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-text-primary mb-2">Enviar certificado para revisión</h2>
      <p className="text-text-secondary text-lg mb-8">
        Completa el formulario y sube tu certificado RMNP. Te contactaremos en 24 horas.
      </p>

      {errors.submit && (
        <div className="flex gap-3 bg-danger bg-opacity-5 border border-danger border-opacity-20 text-danger p-4 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error al procesar</p>
            <p className="text-sm mt-1">{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="label-field">
            Nombre completo <span className="text-danger">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            value={form.nombre}
            onChange={handleNombre}
            placeholder="Ej: Juan Pérez"
            className={`input-field ${errors.nombre ? 'border-danger' : ''}`}
          />
          {errors.nombre && (
            <p className="error-message">
              <AlertCircle className="w-4 h-4" />
              {errors.nombre}
            </p>
          )}
        </div>

        {/* Patente */}
        <div>
          <label htmlFor="patente" className="label-field">
            Patente del vehículo <span className="text-danger">*</span>
          </label>
          <input
            id="patente"
            type="text"
            value={form.patente}
            onChange={handlePatente}
            placeholder="Ej: ABCD-12 o AB-1234"
            className={`input-field uppercase ${errors.patente ? 'border-danger' : ''}`}
          />
          <p className="text-xs text-text-muted mt-2">Se formatea automáticamente. Ejemplos: ABCD-12 o AB-1234</p>
          {errors.patente && (
            <p className="error-message">
              <AlertCircle className="w-4 h-4" />
              {errors.patente}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="label-field">
            Correo electrónico <span className="text-danger">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleEmail}
            placeholder="tu@email.com"
            className={`input-field ${errors.email ? 'border-danger' : ''}`}
          />
          {errors.email && (
            <p className="error-message">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="label-field">
            Teléfono / WhatsApp <span className="text-danger">*</span>
          </label>
          <input
            id="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleTelefono}
            placeholder="9 XXXX XXXX"
            className={`input-field ${errors.telefono ? 'border-danger' : ''}`}
          />
          <p className="text-xs text-text-muted mt-2">Formato: 9 XXXX XXXX</p>
          {errors.telefono && (
            <p className="error-message">
              <AlertCircle className="w-4 h-4" />
              {errors.telefono}
            </p>
          )}
        </div>

        {/* Archivo */}
        <div>
          <label htmlFor="archivo" className="label-field">
            Certificado de multa (PDF) <span className="text-danger">*</span>
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
          {errors.archivo && (
            <p className="error-message">
              <AlertCircle className="w-4 h-4" />
              {errors.archivo}
            </p>
          )}
        </div>

        {/* Términos */}
        <div className="bg-primary bg-opacity-5 border border-primary border-opacity-20 p-4 rounded-lg">
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
              className="mt-1 w-4 h-4 cursor-pointer accent-primary"
            />
            <label htmlFor="aceptaTerminos" className="text-sm text-text-primary leading-relaxed">
              Acepto que <strong>el análisis depende de la información que proporciono y del certificado adjunto</strong>. He leído los{' '}
              <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                términos de servicio
              </a>
              . <span className="text-danger">*</span>
            </label>
          </div>
          {errors.aceptaTerminos && (
            <p className="error-message mt-3">
              <AlertCircle className="w-4 h-4" />
              {errors.aceptaTerminos}
            </p>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Enviando solicitud...
            </>
          ) : (
            'Enviar certificado para revisión'
          )}
        </button>

        <p className="text-xs text-text-muted text-center">
          Los campos marcados con <span className="text-danger">*</span> son obligatorios
        </p>
      </form>
    </div>
  );
}
