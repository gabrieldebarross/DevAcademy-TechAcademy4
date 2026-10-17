import { User } from '../entities/User';
import { UserRole } from '../entities/UserRole';
import { UserStatus } from '../entities/UserStatus';

export interface UpdateProfileInput {
  readonly name?: string;
  readonly email?: string;
  readonly cpf?: string;
  readonly password?: string;
}

/** Entrada da troca de perfil de acesso (exclusiva do ADMIN). */
export interface ChangeRoleInput {
  readonly role: UserRole;
}

/** Entrada da criação de conta pelo ADMIN (senha base + troca no 1º acesso). */
export interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
  readonly role: UserRole;
}

/** Entrada da aprovação/recusa de um cadastro pendente (exclusiva do ADMIN). */
export interface UpdateUserStatusInput {
  readonly status: UserStatus;
}

/** Filtros opcionais da listagem de usuários. */
export interface ListUsersFilter {
  readonly role?: UserRole;
  readonly status?: UserStatus;
}

/** Representação pública de um usuário. O hash da senha nunca é incluído. */
export interface UserResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly mustChangePassword: boolean;
  readonly createdAt: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    role: user.role,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Representação mínima usada ao escolher um aluno para uma matrícula.
 * Omite o CPF de propósito, para a listagem nunca expor dados pessoais de
 * outros usuários. O perfil e a situação são mantidos para a tela de admin
 * gerenciar perfis e aprovar cadastros.
 */
export interface UserSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly mustChangePassword: boolean;
}

export function toUserSummary(user: User): UserSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
  };
}
