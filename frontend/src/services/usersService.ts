import { request } from './api';
import type {
  PaginatedResponse,
  StudentSummary,
  User,
  UserRole,
  UserStatus,
} from '@/types';

export interface UpdateProfilePayload {
  name?: string;
  cpf?: string;
  password?: string;
  email?: string;
}

/** Filtros opcionais da listagem de usuários. */
export interface ListUsersParams {
  role?: UserRole;
  status?: UserStatus;
}

/** Dados para o ADMIN criar uma conta com senha base. */
export interface CreateUserPayload {
  name: string;
  email: string;
  cpf: string;
  password: string;
  role: UserRole;
}

function buildUsersQuery(page: number, limit: number, params: ListUsersParams): string {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (params.role) {
    search.set('role', params.role);
  }

  if (params.status) {
    search.set('status', params.status);
  }

  return search.toString();
}

export const usersService = {
  getMe(): Promise<User> {
    return request<User>('/users/me');
  },

  updateMe(payload: UpdateProfilePayload): Promise<User> {
    return request<User>('/users/me', { method: 'PUT', body: payload });
  },

  list(
    page = 1,
    limit = 50,
    params: ListUsersParams = {},
  ): Promise<PaginatedResponse<StudentSummary>> {
    return request<PaginatedResponse<StudentSummary>>(
      `/users?${buildUsersQuery(page, limit, params)}`,
    );
  },

  /** Cria uma conta com senha base (exclusivo do ADMIN). */
  create(payload: CreateUserPayload): Promise<User> {
    return request<User>('/users', { method: 'POST', body: payload });
  },

  /** Troca o perfil de acesso de um usuário (exclusivo do ADMIN). */
  changeRole(id: string, role: UserRole): Promise<User> {
    return request<User>(`/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    });
  },

  /** Aprova ou recusa um cadastro pendente (exclusivo do ADMIN). */
  changeStatus(id: string, status: UserStatus): Promise<User> {
    return request<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },
};
