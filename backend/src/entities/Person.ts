import { Column } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { isValidCpf, normalizeCpf } from '../validators/cpfValidator';
import { isValidEmail } from '../validators/emailValidator';
import { BaseEntity } from './BaseEntity';

export interface PersonProps {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
}

/**
 * Shared behaviour of every person in the system.
 *
 * Reusing these three validated fields in `User` and `Instructor` is real code
 * reuse, which justifies the abstract class instead of duplicated declarations.
 */
export abstract class Person extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 120 })
  private _name!: string;

  @Column({ name: 'email', type: 'varchar', length: 160, unique: true })
  private _email!: string;

  @Column({ name: 'cpf', type: 'varchar', length: 11, unique: true })
  private _cpf!: string;

  protected constructor(props?: PersonProps) {
    super();

    if (props) {
      this.name = props.name;
      this.email = props.email;
      this.cpf = props.cpf;
    }
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get cpf(): string {
    return this._cpf;
  }

  set name(value: string) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length < 3) {
      throw new ValidationError('O nome deve ter pelo menos 3 caracteres');
    }

    if (trimmed.length > 120) {
      throw new ValidationError('O nome deve ter no máximo 120 caracteres');
    }

    this._name = trimmed;
  }

  set email(value: string) {
    const normalized = (value ?? '').trim().toLowerCase();

    if (!isValidEmail(normalized)) {
      throw new ValidationError('E-mail inválido');
    }

    this._email = normalized;
  }

  set cpf(value: string) {
    const normalized = normalizeCpf(value ?? '');

    if (!isValidCpf(normalized)) {
      throw new ValidationError('CPF inválido');
    }

    this._cpf = normalized;
  }

  /** Identifier of the person specialization, returned by the API. */
  abstract get role(): string;

  /** Polymorphic summary: each specialization describes itself. */
  abstract describe(): string;
}
