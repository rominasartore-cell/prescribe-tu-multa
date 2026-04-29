export interface ParsedMulta {
  rol: string | null;
  patente: string | null;
  fechaInfraccion: Date | null;
  fechaIngresoRmnp: Date | null;
  tribunalOComuna: string | null;
  monto: number | null;
  estado: string | null;
}

function parseDate(input: string): Date | null {
  const m = input.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (!m) return null;
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  const d = new Date(`${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseMonto(input: string): number | null {
  const m = input.replace(/\./g, '').match(/\$?\s*(\d{3,})/);
  return m ? Number.parseInt(m[1], 10) : null;
}

export function parseCertificadoText(text: string): ParsedMulta[] {
  const blocks = text.split(/\n\s*\n/g).filter((b) => /rol|patente|rmnp|ingreso/i.test(b));

  return blocks.map((block) => {
    const rol = block.match(/rol\s*[:\-]?\s*([A-Z0-9-]+)/i)?.[1] || null;
    const patente = block.match(/patente\s*[:\-]?\s*([A-Z]{2,4}-?\d{2,4})/i)?.[1] || null;
    const fechaIngresoRaw = block.match(/(?:fecha\s+ingreso\s+rmnp|ingreso\s+rmnp|rmnp)\s*[:\-]?\s*([\d\/-]{8,10})/i)?.[1] || null;
    const fechaInfraccionRaw = block.match(/fecha\s+infracci[oó]n\s*[:\-]?\s*([\d\/-]{8,10})/i)?.[1] || null;
    const tribunalOComuna = block.match(/(?:tribunal|comuna)\s*[:\-]?\s*([^\n]+)/i)?.[1]?.trim() || null;
    const montoRaw = block.match(/(?:monto|total)\s*[:\-]?\s*([$\d\.,]+)/i)?.[1] || null;
    const estado = block.match(/estado\s*[:\-]?\s*([^\n]+)/i)?.[1]?.trim() || null;

    return {
      rol,
      patente,
      fechaInfraccion: fechaInfraccionRaw ? parseDate(fechaInfraccionRaw) : null,
      fechaIngresoRmnp: fechaIngresoRaw ? parseDate(fechaIngresoRaw) : null,
      tribunalOComuna,
      monto: montoRaw ? parseMonto(montoRaw) : null,
      estado,
    };
  });
}

export function pickBestRmnpDate(parsed: ParsedMulta[]): Date | null {
  const dates = parsed.map((m) => m.fechaIngresoRmnp).filter((d): d is Date => Boolean(d));
  if (!dates.length) return null;
  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates[0];
}
