'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  archivo: File | null;
}

export function Dropzone({ onFileSelect, archivo }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type === 'application/pdf') {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        isDragActive
          ? 'border-primary bg-primary bg-opacity-5 shadow-md'
          : 'border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-2'
      }`}
    >
      <input {...getInputProps()} />

      {archivo ? (
        <div className="text-center slide-in-up">
          <div className="w-12 h-12 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <p className="font-semibold text-text-primary mb-2">{archivo.name}</p>
          <p className="text-sm text-text-secondary mb-3">
            {(archivo.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-xs text-text-muted hover:text-primary transition-colors">
            Haz clic para cambiar el archivo
          </p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="font-semibold text-text-primary mb-2 text-lg">Arrastra tu PDF aquí</p>
          <p className="text-sm text-text-secondary mb-4">o haz clic para seleccionar un archivo</p>
          <p className="text-xs text-text-muted">
            Solo se aceptan archivos PDF • Máximo 10 MB
          </p>
        </div>
      )}
    </div>
  );
}
