import { User } from '../entities/User';
import { UserResponse, toUserResponse } from './user';

export interface RegisterInput {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
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
