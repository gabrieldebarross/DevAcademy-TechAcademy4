import { Column, Entity } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { passwordPolicyMessage, validatePasswordStrength } from '../validators/passwordValidator';
import { Person, PersonProps } from './Person';

export interface UserProps extends PersonProps {
  readonly passwordHash: string;
}

@Entity('users')
export class User extends Person {
  private static readonly MIN_HASH_LENGTH = 20;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  private _passwordHash!: string;

  constructor(props?: UserProps) {
    super(props);

    if (props) {
      this.passwordHash = props.passwordHash;
    }
  }

  /**
   * The hash is required to verify credentials, but it is never part of any
   * response: the mapping layer simply does not read it.
   */
  get passwordHash(): string {
    return this._passwordHash;
  }

  set passwordHash(value: string) {
    if (typeof value !== 'string' || value.length < User.MIN_HASH_LENGTH) {
      throw new ValidationError('Hash de senha inválido');
    }

    this._passwordHash = value;
  }

  override get role(): string {
    return 'user';
  }

  override describe(): string {
    return `${this.name} <${this.email}>`;
  }

  /**
   * Domain rule: a plain password must satisfy the strength policy.
   * The plain value never reaches the entity, only its bcrypt hash does.
   */
  static assertStrongPassword(plainPassword: unknown): void {
    const result = validatePasswordStrength(plainPassword);

    if (!result.valid) {
      throw new ValidationError(passwordPolicyMessage(result.failures));
    }
  }
}
