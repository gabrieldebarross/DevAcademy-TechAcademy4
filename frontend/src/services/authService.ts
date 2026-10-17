import { request } from './api';
import type { User, UserRole } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  cpf: string;
  password: string;
  /** Perfil pretendido; perfis privilegiados ficam pendentes de aprovação. */
  role?: UserRole;
}

export const authService = {
  login(payload: LoginPayload): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },

  register(payload: RegisterPayload): Promise<User> {
    return request<User>('/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },
};
