import { Column } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { isValidCpf, normalizeCpf } from '../validators/cpfValidator';
import { isValidEmail } from '../validators/emailValidator';
import { BaseEntity } from './BaseEntity';
import { UserRole } from './UserRole';

export interface PersonProps {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
}

/**
 * Comportamento compartilhado por todas as pessoas do sistema.
 *
 * Reutilizar estes três campos validados em `User` e `Instructor` é reuso real
 * de código, o que justifica a classe abstrata no lugar de declarações repetidas.
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

  /** Perfil de acesso da pessoa, retornado pela API. */
  abstract get role(): UserRole;

  /** Resumo polimórfico: cada especialização descreve a si mesma. */
  abstract describe(): string;
}
