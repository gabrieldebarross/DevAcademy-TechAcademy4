const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calculateCheckDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateCheckDigit(9);
  const secondDigit = calculateCheckDigit(10);

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
}

export interface PasswordStrength {
  valid: boolean;
  failures: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const failures: string[] = [];

  if (password.length < 8) {
    failures.push('ter pelo menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    failures.push('conter uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    failures.push('conter uma letra minúscula');
  }
  if (!/\d/.test(password)) {
    failures.push('conter um número');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    failures.push('conter um símbolo');
  }

  return { valid: failures.length === 0, failures };
}

export function passwordPolicyMessage(failures: string[]): string {
  if (failures.length === 0) {
    return '';
  }
  return `A senha deve ${failures.join(', ')}.`;
}
