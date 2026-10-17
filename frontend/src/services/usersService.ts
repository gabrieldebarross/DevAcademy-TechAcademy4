import { request } from './api';
import type { PaginatedResponse, StudentSummary, User } from '@/types';

export interface UpdateProfilePayload {
  name?: string;
  cpf?: string;
  password?: string;
  email?: string;
}

export const usersService = {
  getMe(): Promise<User> {
    return request<User>('/users/me');
  },

  updateMe(payload: UpdateProfilePayload): Promise<User> {
    return request<User>('/users/me', { method: 'PUT', body: payload });
  },

  list(page = 1, limit = 50): Promise<PaginatedResponse<StudentSummary>> {
    return request<PaginatedResponse<StudentSummary>>(
      `/users?page=${page}&limit=${limit}`,
    );
  },
};
