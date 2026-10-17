import { User } from '../entities/User';
import { UserRole } from '../entities/UserRole';
import { UserResponse, toUserResponse } from './user';

export interface RegisterInput {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
  /**
   * Perfil pretendido no cadastro. Aluno entra ativo na hora; perfis
   * privilegiados ficam pendentes de aprovação de um ADMIN.
   */
  readonly role?: UserRole;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly user: UserResponse;
}

export function toAuthResponse(token: string, user: User): AuthResponse {
  return { token, user: toUserResponse(user) };
}
