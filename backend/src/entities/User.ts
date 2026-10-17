import { Column, Entity } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { passwordPolicyMessage, validatePasswordStrength } from '../validators/passwordValidator';
import { Person, PersonProps } from './Person';
import { UserRole } from './UserRole';
import { UserStatus } from './UserStatus';

export interface UserProps extends PersonProps {
  readonly passwordHash: string;
  readonly role?: UserRole;
  readonly status?: UserStatus;
  readonly mustChangePassword?: boolean;
}

@Entity('users')
export class User extends Person {
  private static readonly MIN_HASH_LENGTH = 20;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  private _passwordHash!: string;

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  private _role!: UserRole;

  @Column({ name: 'status', type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  private _status!: UserStatus;

  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  private _mustChangePassword!: boolean;

  constructor(props?: UserProps) {
    super(props);

    if (props) {
      this.passwordHash = props.passwordHash;
      this.role = props.role ?? UserRole.STUDENT;
      this.status = props.status ?? UserStatus.ACTIVE;
      this.mustChangePassword = props.mustChangePassword ?? false;
    }
  }

  /**
   * O hash é necessário para conferir as credenciais, mas nunca faz parte de
   * nenhuma resposta: a camada de mapeamento simplesmente não o lê.
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

  /** Perfil de acesso do usuário, usado nas decisões de autorização. */
  override get role(): UserRole {
    return this._role;
  }

  set role(value: UserRole) {
    if (!Object.values(UserRole).includes(value)) {
      throw new ValidationError('Perfil de usuário inválido');
    }

    this._role = value;
  }

  isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  isInstructor(): boolean {
    return this._role === UserRole.INSTRUCTOR;
  }

  isStudent(): boolean {
    return this._role === UserRole.STUDENT;
  }

  /** Situação da conta (aprovada, pendente ou recusada). */
  get status(): UserStatus {
    return this._status;
  }

  set status(value: UserStatus) {
    if (!Object.values(UserStatus).includes(value)) {
      throw new ValidationError('Situação de usuário inválida');
    }

    this._status = value;
  }

  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  isPending(): boolean {
    return this._status === UserStatus.PENDING;
  }

  /**
   * Indica que a senha ainda é a base definida por um administrador e precisa
   * ser trocada no primeiro acesso (bloqueia as demais rotas no backend).
   */
  get mustChangePassword(): boolean {
    return this._mustChangePassword;
  }

  set mustChangePassword(value: boolean) {
    this._mustChangePassword = Boolean(value);
  }

  override describe(): string {
    return `${this.name} <${this.email}>`;
  }

  /**
   * Regra de domínio: a senha em texto puro precisa atender à política de força.
   * O valor puro nunca chega à entidade, apenas o seu hash bcrypt.
   */
  static assertStrongPassword(plainPassword: unknown): void {
    const result = validatePasswordStrength(plainPassword);

    if (!result.valid) {
      throw new ValidationError(passwordPolicyMessage(result.failures));
    }
  }
}
