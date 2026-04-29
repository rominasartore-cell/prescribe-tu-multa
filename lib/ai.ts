import Anthropic from '@anthropic-ai/sdk';
import { ExtractedData } from './types';

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is missing');
  return new Anthropic({ apiKey: key });
}

const EXTRACTION_PROMPT = `You are an expert at extracting data from Chilean traffic fine certificates (RMNP - Resolución de Multa No Pagada).

Extract the following information from the provided text:
- RUT: The vehicle owner's RUT (Chilean ID)
- Patente: The vehicle license plate
- Monto: The fine amount in CLP
- Artículo: The traffic law article violated
- Fecha de Ingreso: The date the fine was registered in RMNP

Return a JSON object with these fields. If a field cannot be found, use null.
Return ONLY valid JSON, no additional text.

Example output:
{"rut": "12345678-9", "patente": "ABC-1234", "monto": 450000, "articulo": "Artículo 196", "fechaIngreso": "2021-06-15"}`;

export async function extractDataFromText(text: string): Promise<ExtractedData> {
  const message = await getClient().messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `${EXTRACTION_PROMPT}\n\nText to extract from:\n\n${text}`,
      },
    ],
  });

  try {
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const extracted = JSON.parse(jsonMatch[0]);

    // Parse date if it's a string
    let fechaIngreso = extracted.fechaIngreso;
    if (typeof fechaIngreso === 'string') {
      fechaIngreso = new Date(fechaIngreso);
    }

    // Parse monto as integer
    const monto = typeof extracted.monto === 'string' ? parseInt(extracted.monto, 10) : extracted.monto;

    return {
      rut: extracted.rut,
      patente: extracted.patente,
      monto,
      articulo: extracted.articulo,
      fechaIngreso,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {};
  }
}

export async function validateWithAI(text: string): Promise<boolean> {
  const message = await getClient().messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Is this a Chilean traffic fine certificate (RMNP)? Respond with only "true" or "false".\n\n${text}`,
      },
    ],
  });

  const response = message.content[0].type === 'text' ? message.content[0].text.trim().toLowerCase() : '';
  return response === 'true';
}
