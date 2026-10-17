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
 * Valida um CPF pelo algoritmo oficial dos dígitos verificadores.
 * Aceita valor formatado (`123.456.789-09`) ou apenas dígitos (`12345678909`).
 */
export function isValidCpf(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== CPF_LENGTH) {
    return false;
  }

  // Sequências como 111.111.111-11 passam na conta, mas não são CPFs válidos.
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split('').map(Number);

  const firstCheckDigit = checkDigit(digits.slice(0, 9));
  const secondCheckDigit = checkDigit(digits.slice(0, 10));

  return firstCheckDigit === digits[9] && secondCheckDigit === digits[10];
}

/** Remove todo caractere que não seja dígito, guardando CPFs em formato canônico. */
export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '');
}
