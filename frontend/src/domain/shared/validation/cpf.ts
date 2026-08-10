const CPF_LENGTH = 11;

function checkDigit(digits: readonly number[], weight: number): number {
  const sum = digits.reduce((total, digit, index) => total + digit * (weight - index), 0);
  const remainder = (sum * 10) % CPF_LENGTH;

  return remainder === 10 ? 0 : remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');

  if (digits.length !== CPF_LENGTH) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const numbers = [...digits].map(Number);
  const first = checkDigit(numbers.slice(0, 9), 10);
  const second = checkDigit(numbers.slice(0, 10), 11);

  return first === numbers[9] && second === numbers[10];
}
