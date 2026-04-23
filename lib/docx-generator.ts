import { Document, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun } from 'docx';
import { PrescriptionResult } from './types';

export function generateDocx(multa: PrescriptionResult): Document {
  const isPrescrbed = multa.estado === 'PRESCRITA';

  return new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            text: 'ESCRITO JUDICIAL',
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            style: 'Heading1',
          }),

          new Paragraph({
            text: isPrescrbed
              ? 'EXCEPCIÓN POR PRESCRIPCIÓN DE LA ACCIÓN'
              : 'ANÁLISIS DE MULTA DE TRÁNSITO',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            style: 'Heading2',
          }),

          // Considerandos
          new Paragraph({
            text: 'CONSIDERANDOS',
            spacing: { before: 200, after: 200 },
            style: 'Heading3',
          }),

          new Paragraph({
            text: isPrescrbed
              ? '1. Que, la multa identificada en los autos ha sido ingresada en el Registro de Multas no Pagadas (RMNP) conforme se acredita de los documentos que acompañan.'
              : '1. Que, se ha solicitado el análisis de la multa de tránsito identificada en los autos, la cual fue ingresada en el Registro de Multas no Pagadas (RMNP).',
            spacing: { after: 100 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph({
            text: isPrescrbed
              ? '2. Que, conforme al artículo 2515 del Código Civil, la acción para cobrar deudas prescribe en el plazo de tres años, contados desde la fecha en que la obligación se hizo exigible.'
              : '2. Que, conforme al artículo 2515 del Código Civil, la acción para cobrar deudas prescribe en el plazo de tres años, contados desde la fecha en que la obligación se hizo exigible.',
            spacing: { after: 100 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph({
            text: isPrescrbed
              ? `3. Que, la presente multa fue ingresada en RMNP en fecha ${multa.fechaIngreso.toLocaleDateString('es-CL')}, habiendo transcurrido más de tres años desde esa fecha, por lo que la acción para cobrarla se encuentra completamente prescrita.`
              : `3. Que, la presente multa fue ingresada en RMNP en fecha ${multa.fechaIngreso.toLocaleDateString('es-CL')}, encontrándose aún dentro del plazo de prescripción.`,
            spacing: { after: 100 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph({
            text: isPrescrbed
              ? '4. Que, en consecuencia, la deuda descrita se encuentra extinguida por el transcurso del tiempo, conforme lo establecido en la ley.'
              : '4. Que, por esta razón, la deuda sigue siendo exigible y vigente.',
            spacing: { after: 300 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          // Data Table
          new Paragraph({
            text: 'DATOS DE LA MULTA',
            spacing: { before: 200, after: 100 },
            style: 'Heading3',
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'RUT', bold: true })] })],
                    shading: { fill: 'E5E7EB' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: multa.rut })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Patente', bold: true })] })],
                    shading: { fill: 'E5E7EB' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: multa.patente })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Monto', bold: true })] })],
                    shading: { fill: 'E5E7EB' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `$${multa.monto.toLocaleString('es-CL')}` })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Artículo', bold: true })] })],
                    shading: { fill: 'E5E7EB' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: multa.articulo || 'No identificado' })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Fecha Ingreso RMNP', bold: true })] })],
                    shading: { fill: 'E5E7EB' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: multa.fechaIngreso.toLocaleDateString('es-CL') })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Fecha Prescripción', bold: true })] })],
                    shading: { fill: 'E5E7EB' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: multa.fechaPrescripcion.toLocaleDateString('es-CL') }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: '',
            spacing: { after: 300 },
          }),

          // Conclusion
          new Paragraph({
            text: isPrescrbed ? 'CONCLUSIÓN' : 'SITUACIÓN ACTUAL',
            spacing: { before: 200, after: 100 },
            style: 'Heading3',
          }),

          new Paragraph({
            text: isPrescrbed
              ? 'Por las consideraciones anteriores, la multa descrita se encuentra PRESCRITA, habiendo la acción para cobrarla quedado extinguida por el paso del tiempo. Conforme a derecho, no puede ser exigido su pago.'
              : 'La multa descrita se encuentra VIGENTE y la acción para cobrarla sigue siendo exigible conforme a la ley.',
            spacing: { after: 300 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          // Disclaimer
          new Paragraph({
            children: [new TextRun({ text: '⚠ AVISO IMPORTANTE', bold: true })],
            spacing: { before: 200, after: 100 },
          }),

          new Paragraph({
            text: 'Este documento es informativo y ha sido generado por un sistema automatizado. No constituye asesoramiento legal profesional. Se recomienda encarecidamente consultar con un abogado antes de presentar este documento ante cualquier tribunal o autoridad.',
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph({
            children: [new TextRun({ text: `Generado el ${new Date().toLocaleDateString('es-CL')} por Prescribe Tu Multa`, color: '666666', size: 18 })],
            spacing: { before: 200 },
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });
}
