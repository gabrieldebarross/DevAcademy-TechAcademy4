import { compare, hash } from 'bcryptjs';

import { env } from '../config/env';
import { PasswordHasher } from '../interfaces/PasswordHasher';

/** Implementação de `PasswordHasher` com bcrypt. */
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, env.bcryptSaltRounds);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainPassword, passwordHash);
  }
}
