import { compare, hash } from 'bcryptjs';

import { env } from '../config/env';
import { PasswordHasher } from '../interfaces/PasswordHasher';

/** bcrypt implementation of the `PasswordHasher` contract. */
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return hash(plainPassword, env.bcryptSaltRounds);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return compare(plainPassword, passwordHash);
  }
}
