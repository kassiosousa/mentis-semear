const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseApiDate(value: string | null): Date | null {
  if (value === null || value === '') return null;

  const match = DATE_ONLY.exec(value);
  const date =
    match === null
      ? new Date(value)
      : new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | null): string {
  const date = parseApiDate(value);

  return date === null
    ? '—'
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value: string | null): string {
  const date = parseApiDate(value);

  return date === null
    ? '—'
    : date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function formatShortDate(value: string | null): string {
  const date = parseApiDate(value);

  return date === null
    ? '—'
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function formatNumber(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('pt-BR');
}

export function formatDecimal(value: number | null, digits = 1): string {
  return value === null
    ? '—'
    : value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatPercent(value: number | null, digits = 1): string {
  return value === null ? '—' : `${formatDecimal(value, digits)}%`;
}

export function formatText(value: string | null): string {
  return value === null || value.trim() === '' ? '—' : value;
}

export function truncate(value: string, max = 60): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
