export function cleanPatente(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidPatente(value: string): boolean {
  const clean = cleanPatente(value);
  return /^[A-Z]{4}\d{2}$/.test(clean) || /^[A-Z]{2}\d{4}$/.test(clean);
}

export function formatPatente(value: string): string {
  const clean = cleanPatente(value);

  if (/^[A-Z]{4}\d{2}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }

  if (/^[A-Z]{2}\d{4}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  }

  return value.toUpperCase().trim();
}
