import { request } from './api';
import type { Course, CourseLevel, PaginatedResponse } from '@/types';

export interface CoursePayload {
  title: string;
  description: string;
  workloadHours: number;
  price: number;
  level: CourseLevel;
  categoryId: string;
  instructorId: string;
}

export const courseService = {
  list(page = 1, limit = 10): Promise<PaginatedResponse<Course>> {
    return request<PaginatedResponse<Course>>(
      `/courses?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string): Promise<Course> {
    return request<Course>(`/courses/${id}`);
  },

  create(payload: CoursePayload): Promise<Course> {
    return request<Course>('/courses', { method: 'POST', body: payload });
  },

  update(id: string, payload: CoursePayload): Promise<Course> {
    return request<Course>(`/courses/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/courses/${id}`, { method: 'DELETE' });
  },
};
