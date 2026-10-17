/**
 * Contract for password hashing.
 * The service layer depends on this abstraction, so the algorithm can be
 * replaced without touching the business rules (Dependency Inversion).
 */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}
