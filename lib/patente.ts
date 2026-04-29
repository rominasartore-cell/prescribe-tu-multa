/**
 * Chilean License Plate Validation and Formatting
 *
 * Supports both formats:
 * - Modern: ABCD-12 (4 letters + 2 digits)
 * - Legacy: AB-1234 (2 letters + 4 digits)
 */

export function cleanPatente(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidPatente(value: string): boolean {
  const clean = cleanPatente(value);
  // Modern format: 4 letters + 2 digits
  // Legacy format: 2 letters + 4 digits
  return /^[A-Z]{4}\d{2}$/.test(clean) || /^[A-Z]{2}\d{4}$/.test(clean);
}

export function formatPatente(value: string): string {
  const clean = cleanPatente(value);

  // Modern format: ABCD-12
  if (/^[A-Z]{4}\d{2}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }

  // Legacy format: AB-1234
  if (/^[A-Z]{2}\d{4}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  }

  return value.toUpperCase().trim();
}

/**
 * Test cases:
 * RHHP-33 => { valid: true, formatted: 'RHHP-33' }
 * RHHP33 => { valid: true, formatted: 'RHHP-33' }
 * rhhp33 => { valid: true, formatted: 'RHHP-33' }
 * AB1234 => { valid: true, formatted: 'AB-1234' }
 * AB-1234 => { valid: true, formatted: 'AB-1234' }
 * ABC123 => { valid: false, formatted: 'ABC123' }
 * 123456 => { valid: false, formatted: '123456' }
 */
