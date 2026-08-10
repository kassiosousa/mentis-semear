const CPF_DIGITS = 11;
const PHONE_DIGITS = 11;
const DATE_DIGITS = 8;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, CPF_DIGITS);
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(
    (group) => group !== '',
  );
  const checkDigits = digits.slice(9);
  const head = groups.join('.');

  return checkDigits === '' ? head : `${head}-${checkDigits}`;
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, PHONE_DIGITS);

  if (digits === '') return '';
  if (digits.length <= 2) return `(${digits}`;

  const area = digits.slice(0, 2);
  const number = digits.slice(2);
  const cut = number.length > 4 ? number.length - 4 : number.length;
  const prefix = number.slice(0, cut);
  const suffix = number.slice(cut);

  return suffix === '' ? `(${area}) ${prefix}` : `(${area}) ${prefix}-${suffix}`;
}

export function maskDate(value: string): string {
  const digits = onlyDigits(value).slice(0, DATE_DIGITS);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter((part) => part !== '')
    .join('/');
}

export function toIsoDate(masked: string): string {
  const digits = onlyDigits(masked);
  if (digits.length !== DATE_DIGITS) return '';

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4);
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const exists =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return exists ? `${year}-${month}-${day}` : '';
}
