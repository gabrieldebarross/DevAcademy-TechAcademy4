import { request } from './api';
import type { Enrollment, EnrollmentStatus, PaginatedResponse } from '@/types';

export interface EnrollmentPayload {
  /** Obrigatório para ADMIN/INSTRUCTOR; ignorado quando o aluno solicita. */
  studentId?: string;
  courseId: string;
  status?: EnrollmentStatus;
}

export const enrollmentService = {
  list(page = 1, limit = 10): Promise<PaginatedResponse<Enrollment>> {
    return request<PaginatedResponse<Enrollment>>(
      `/enrollments?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string): Promise<Enrollment> {
    return request<Enrollment>(`/enrollments/${id}`);
  },

  create(payload: EnrollmentPayload): Promise<Enrollment> {
    return request<Enrollment>('/enrollments', {
      method: 'POST',
      body: payload,
    });
  },

  update(id: string, payload: EnrollmentPayload): Promise<Enrollment> {
    return request<Enrollment>(`/enrollments/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/enrollments/${id}`, { method: 'DELETE' });
  },
};
