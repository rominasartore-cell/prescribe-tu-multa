'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-secondary bg-secondary bg-opacity-5' : 'border-gray-300 hover:border-secondary'
      }`}
    >
      <input {...getInputProps()} />

      {archivo ? (
        <div className="text-center">
          <div className="text-3xl mb-2">📄</div>
          <p className="font-semibold text-gray-900 mb-1">{archivo.name}</p>
          <p className="text-sm text-gray-600 mb-3">
            {(archivo.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-xs text-gray-500">Haz clic para cambiar el archivo</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-3xl mb-2">📤</div>
          <p className="font-semibold text-gray-900 mb-1">Arrastra tu PDF aquí</p>
          <p className="text-sm text-gray-600">o haz clic para seleccionar un archivo</p>
          <p className="text-xs text-gray-500 mt-3">Solo se aceptan archivos PDF</p>
        </div>
      )}
    </div>
  );
}
