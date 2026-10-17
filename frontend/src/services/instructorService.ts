import { request } from './api';
import type { Instructor, PaginatedResponse } from '@/types';

export interface InstructorPayload {
  name: string;
  email: string;
  cpf: string;
  specialty: string;
  bio: string;
}

export const instructorService = {
  list(page = 1, limit = 10): Promise<PaginatedResponse<Instructor>> {
    return request<PaginatedResponse<Instructor>>(
      `/instructors?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string): Promise<Instructor> {
    return request<Instructor>(`/instructors/${id}`);
  },

  create(payload: InstructorPayload): Promise<Instructor> {
    return request<Instructor>('/instructors', {
      method: 'POST',
      body: payload,
    });
  },

  update(id: string, payload: InstructorPayload): Promise<Instructor> {
    return request<Instructor>(`/instructors/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/instructors/${id}`, { method: 'DELETE' });
  },
};
