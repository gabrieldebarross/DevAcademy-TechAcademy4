const CPF_LENGTH = 11;

function checkDigit(digits: readonly number[]): number {
  const firstWeight = digits.length + 1;

  const sum = digits.reduce(
    (accumulator, digit, index) => accumulator + digit * (firstWeight - index),
    0,
  );

  const rest = (sum * 10) % 11;

  return rest === 10 ? 0 : rest;
}

/**
 * Validates a CPF using the official check digit algorithm.
 * Accepts formatted (`123.456.789-09`) or raw (`12345678909`) values.
 */
export function isValidCpf(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== CPF_LENGTH) {
    return false;
  }

  // Sequences such as 111.111.111-11 pass the math but are not valid CPFs.
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split('').map(Number);

  const firstCheckDigit = checkDigit(digits.slice(0, 9));
  const secondCheckDigit = checkDigit(digits.slice(0, 10));

  return firstCheckDigit === digits[9] && secondCheckDigit === digits[10];
}

/** Removes every non digit character, storing CPFs in a canonical format. */
export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '');
}
