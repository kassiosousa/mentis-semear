export type CsvValue = string | number | null | undefined;

export interface CsvColumn<TRow> {
  header: string;
  value: (row: TRow) => CsvValue;
}

const DELIMITER = ';';

const BOM = '\uFEFF';

const NEEDS_QUOTES = /[";\r\n]/;

function serialize(value: CsvValue): string {
  if (value === null || value === undefined) return '';

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value).replace('.', ',') : '';
  }

  return value;
}

function escape(cell: string): string {
  return NEEDS_QUOTES.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export function toCsv<TRow>(rows: readonly TRow[], columns: readonly CsvColumn<TRow>[]): string {
  const header = columns.map((column) => escape(column.header)).join(DELIMITER);
  const body = rows.map((row) =>
    columns.map((column) => escape(serialize(column.value(row)))).join(DELIMITER),
  );

  return [header, ...body].join('\r\n');
}

export function csvFilename(prefix: string, date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  return `${prefix}-${stamp}.csv`;
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
