import { ValidationError, ExtractedData } from './types';
import { isValidPatente, formatPatente } from './patente';


function validateCheckDigit(rut: string): boolean {
  const actualDigit = rut[rut.length - 1].toUpperCase();
  const cleanRut = rut.replace(/\D/g, '');
  if (cleanRut.length < 7) return false;

  let sum = 0;
  let multiplier = 2;
  for (let i = cleanRut.length - 2; i >= 0; i--) {
    sum += parseInt(cleanRut[i]) * multiplier;
    multiplier = multiplier === 9 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const verifier = 11 - remainder;
  const expectedDigit = verifier === 11 ? '0' : verifier === 10 ? 'K' : String(verifier);

  return expectedDigit === actualDigit;
}

export function validateRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  const cleanRut = rut.replace(/[.\-]/g, '');
  if (!/^\d{6,8}[0-9K]$/.test(cleanRut.toUpperCase())) return false;
  return validateCheckDigit(cleanRut);
}

export function validatePatente(patente: string): boolean {
  if (!patente || typeof patente !== 'string') return false;
  return isValidPatente(patente);
}

export function validateFecha(fecha: string | Date): boolean {
  try {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return date >= new Date('2000-01-01') && date <= now;
  } catch {
    return false;
  }
}

export function validateMonto(monto: number | string): boolean {
  try {
    const amount = typeof monto === 'string' ? parseInt(monto, 10) : monto;
    return amount > 0 && amount < 10000000; // Up to 10M CLP
  } catch {
    return false;
  }
}

export function validateArticulo(articulo: string): boolean {
  if (!articulo || typeof articulo !== 'string') return false;
  return /[Aa]rtículo\s+\d+/.test(articulo) || /[Aa]rt\.\s*\d+/.test(articulo);
}

export function validateExtraction(data: ExtractedData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.rut || !validateRUT(data.rut)) {
    errors.push({ field: 'rut', message: 'RUT inválido' });
  }

  if (!data.patente || !validatePatente(data.patente)) {
    errors.push({ field: 'patente', message: 'Patente inválida' });
  }

  if (!data.monto || !validateMonto(data.monto)) {
    errors.push({ field: 'monto', message: 'Monto debe ser un número positivo' });
  }

  if (!data.fechaIngreso || !validateFecha(data.fechaIngreso)) {
    errors.push({ field: 'fechaIngreso', message: 'Fecha inválida' });
  }

  if (data.articulo && !validateArticulo(data.articulo)) {
    errors.push({ field: 'articulo', message: 'Formato de artículo inválido' });
  }

  return errors;
}

export function normalizeExtraction(data: ExtractedData): ExtractedData {
  return {
    rut: data.rut?.toUpperCase().replace(/[\.\-\s]/g, '').trim(),
    patente: data.patente ? formatPatente(data.patente) : undefined,
    monto: typeof data.monto === 'string' ? parseInt(data.monto, 10) : data.monto,
    articulo: data.articulo?.trim(),
    fechaIngreso: data.fechaIngreso,
  };
}
