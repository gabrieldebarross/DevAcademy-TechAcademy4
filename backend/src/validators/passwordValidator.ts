export interface PasswordPolicyResult {
  readonly valid: boolean;
  readonly failures: string[];
}

interface PasswordRule {
  readonly test: (password: string) => boolean;
  readonly requirement: string;
}

const MIN_LENGTH = 8;

const PASSWORD_RULES: readonly PasswordRule[] = [
  { test: (password) => password.length >= MIN_LENGTH, requirement: `pelo menos ${MIN_LENGTH} caracteres` },
  { test: (password) => /[A-Z]/.test(password), requirement: 'uma letra maiúscula' },
  { test: (password) => /[a-z]/.test(password), requirement: 'uma letra minúscula' },
  { test: (password) => /\d/.test(password), requirement: 'um número' },
  { test: (password) => /[^A-Za-z0-9]/.test(password), requirement: 'um caractere especial' },
];

/**
 * Password strength policy: every rule must pass.
 * Returns the list of unmet requirements so the API can explain the failure.
 */
export function validatePasswordStrength(value: unknown): PasswordPolicyResult {
  const password = typeof value === 'string' ? value : '';

  const failures = PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.requirement,
  );

  return { valid: failures.length === 0, failures };
}

export function passwordPolicyMessage(failures: readonly string[]): string {
  return `A senha deve conter ${failures.join(', ')}`;
}
