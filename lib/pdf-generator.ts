import PDFDocument from 'pdfkit';
import { PrescriptionResult } from './types';

export function generatePdf(multa: PrescriptionResult): Buffer {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('ANÁLISIS DE MULTA DE TRÁNSITO', { align: 'center' });
  doc.moveDown(0.5);

  // Status badge
  const statusColor = multa.estado === 'PRESCRITA' ? '#059669' : '#DC2626';
  const statusBg = multa.estado === 'PRESCRITA' ? '#D1FAE5' : '#FEE2E2';
  doc.fillColor(statusBg).rect(50, doc.y, 495, 40).fill();
  doc.fillColor(statusColor).fontSize(14).font('Helvetica-Bold');
  doc.text(
    `Estado: ${multa.estado === 'PRESCRITA' ? '✓ PRESCRITA (Deuda exigible extinguida)' : '⚠ VIGENTE (Deuda vigente)'}`,
    100,
    doc.y + 8,
    { align: 'left' },
  );
  doc.moveDown(2);

  // Data section
  doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text('INFORMACIÓN DE LA MULTA', { underline: true });
  doc.moveDown(0.8);

  const tableData = [
    ['Campo', 'Valor'],
    ['RUT', multa.rut],
    ['Patente', multa.patente],
    ['Monto', `$${multa.monto.toLocaleString('es-CL')}`],
    ['Artículo', multa.articulo || 'No identificado'],
    ['Fecha de Ingreso', multa.fechaIngreso.toLocaleDateString('es-CL')],
    ['Fecha de Prescripción', multa.fechaPrescripcion.toLocaleDateString('es-CL')],
  ];

  drawTable(doc, tableData);
  doc.moveDown(1.5);

  // Legal explanation
  doc.fontSize(11).font('Helvetica-Bold').text('ANÁLISIS LEGAL', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica');

  if (multa.estado === 'PRESCRITA') {
    doc.text(
      'Según el Código de Procedimiento Civil, las multas de tránsito se prescriben en un plazo de 3 años desde su entrada en RMNP. Esta multa ha excedido ese plazo, por lo que la acción para cobrarla se encuentra prescrita.',
      { align: 'justify' },
    );
  } else {
    const diasRestantes = Math.ceil(
      (multa.fechaPrescripcion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    doc.text(
      `Esta multa sigue vigente. Quedan ${diasRestantes} días para que prescriba. Se recomienda proceder según corresponda.`,
      { align: 'justify' },
    );
  }

  doc.moveDown(1.5);

  // Disclaimer
  doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
  doc.text(
    '⚠ AVISO IMPORTANTE: Este análisis es informativo y no constituye asesoramiento legal profesional. Se recomienda encarecidamente consultar con un abogado antes de tomar cualquier acción legal.',
    { align: 'justify' },
  );

  doc.moveDown(2);

  // Footer
  doc.fontSize(8).fillColor('#999999').text(`Generado por Prescribe Tu Multa - ${new Date().toLocaleDateString('es-CL')}`, {
    align: 'center',
  });

  doc.end();

  return Buffer.concat(chunks);
}

function drawTable(doc: PDFKit.PDFDocument, data: string[][]): void {
  const x = 50;
  let y = doc.y;
  const columnWidths = [150, 345];
  const rowHeight = 25;

  // Header row
  doc.fillColor('#F3F4F6').rect(x, y, 495, rowHeight).fill();
  doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);

  let xPos = x;
  for (let i = 0; i < data[0].length; i++) {
    doc.text(data[0][i], xPos + 10, y + 7, { width: columnWidths[i] - 20 });
    xPos += columnWidths[i];
  }

  y += rowHeight;

  // Data rows
  doc.font('Helvetica').fontSize(9);
  for (let i = 1; i < data.length; i++) {
    doc.fillColor('#FFFFFF').rect(x, y, 495, rowHeight).fill();
    doc.stroke();

    doc.fillColor('#000000');
    xPos = x;
    for (let j = 0; j < data[i].length; j++) {
      doc.text(data[i][j], xPos + 10, y + 7, {
        width: columnWidths[j] - 20,
        ellipsis: true,
      });
      xPos += columnWidths[j];
    }

    y += rowHeight;
  }
}
