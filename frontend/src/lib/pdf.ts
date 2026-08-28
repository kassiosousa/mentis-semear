export interface PdfColumn<TRow> {
  header: string;
  value: (row: TRow) => string;
  width?: number;
}

export interface PdfTable<TRow> {
  filename: string;
  title: string;
  subtitle?: string;
  columns: readonly PdfColumn<TRow>[];
  rows: readonly TRow[];
}

const MARGIN = 40;
const HEADER_HEIGHT = 92;
const FOOTER_OFFSET = 28;

const TITLE_COLOR: [number, number, number] = [20, 38, 26];
const MUTED_COLOR: [number, number, number] = [85, 102, 90];
const BODY_COLOR: [number, number, number] = [46, 59, 50];
const BORDER_COLOR: [number, number, number] = [214, 229, 203];
const HEAD_FILL: [number, number, number] = [21, 92, 56];
const STRIPE_FILL: [number, number, number] = [246, 250, 243];

export function pdfFilename(prefix: string, date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return `${prefix}-${stamp}.pdf`;
}

export async function downloadPdfTable<TRow>({
  filename,
  title,
  subtitle,
  columns,
  rows,
}: PdfTable<TRow>): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  autoTable(doc, {
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => column.value(row))),
    startY: HEADER_HEIGHT,
    margin: { top: HEADER_HEIGHT, right: MARGIN, bottom: MARGIN + 16, left: MARGIN },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 5,
      textColor: BODY_COLOR,
      lineColor: BORDER_COLOR,
      lineWidth: 0.5,
    },
    headStyles: { fillColor: HEAD_FILL, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: STRIPE_FILL },
    columnStyles: Object.fromEntries(
      columns.flatMap((column, index) =>
        column.width === undefined ? [] : [[index, { cellWidth: column.width }]],
      ),
    ),
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  const generatedAt = new Date().toLocaleString('pt-BR');

  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...TITLE_COLOR);
    doc.text(title, MARGIN, 50);

    if (subtitle !== undefined) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED_COLOR);
      doc.text(subtitle, MARGIN, 66);
    }

    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, 76, width - MARGIN, 76);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED_COLOR);
    doc.text(`Gerado em ${generatedAt}`, MARGIN, height - FOOTER_OFFSET);
    doc.text(`Página ${page} de ${pages}`, width - MARGIN, height - FOOTER_OFFSET, {
      align: 'right',
    });
  }

  doc.save(filename);
}
