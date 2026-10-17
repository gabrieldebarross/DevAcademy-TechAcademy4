const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_EMAIL_LENGTH = 160;

/** Valida um endereço de e-mail com expressão regular. */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') {
    return false;
  }

  const candidate = email.trim();

  if (candidate.length === 0 || candidate.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return EMAIL_REGEX.test(candidate);
}
