/**
 * Validación y formato de patentes chilenas
 * 
 * Formatos válidos:
 * - Moderno: ABCD12, ABCD-12, rhhp33, RHHP-33 → normaliza a ABCD-12
 * - Antiguo: AB1234, AB-1234 → normaliza a AB-1234
 * 
 * Rechaza: ABC123, 123456, A12345, ABCDE1
 */

/**
 * Limpia una patente removiendo caracteres especiales y convirtiendo a mayúsculas
 */
export function cleanPatente(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Valida si una patente tiene formato chileno válido
 * - Formato moderno: 4 letras + 2 números (ABCD12)
 * - Formato antiguo: 2 letras + 4 números (AB1234)
 */
export function isValidPatente(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const clean = cleanPatente(value);
  
  // Formato moderno: 4 letras + 2 números
  if (/^[A-Z]{4}\d{2}$/.test(clean)) return true;
  
  // Formato antiguo: 2 letras + 4 números
  if (/^[A-Z]{2}\d{4}$/.test(clean)) return true;
  
  return false;
}

/**
 * Formatea una patente válida al formato estándar
 * - ABCD12 → ABCD-12
 * - AB1234 → AB-1234
 */
export function formatPatente(value: string): string {
  if (!value || typeof value !== 'string') return value;
  
  const clean = cleanPatente(value);
  
  // Formato moderno: 4 letras + 2 números
  if (/^[A-Z]{4}\d{2}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  
  // Formato antiguo: 2 letras + 4 números
  if (/^[A-Z]{2}\d{4}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  }
  
  // Si no es válido, devuelve el valor limpio en mayúsculas
  return clean;
}

/**
 * Valida y formatea una patente en un paso
 * Devuelve { valid: boolean, formatted: string }
 */
export function validateAndFormatPatente(value: string): { valid: boolean; formatted: string } {
  const valid = isValidPatente(value);
  const formatted = formatPatente(value);
  return { valid, formatted };
}
