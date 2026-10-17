import { request } from './api';
import type { Category, PaginatedResponse } from '@/types';

export interface CategoryPayload {
  name: string;
  description: string;
}

export const categoryService = {
  list(page = 1, limit = 10): Promise<PaginatedResponse<Category>> {
    return request<PaginatedResponse<Category>>(
      `/categories?page=${page}&limit=${limit}`,
    );
  },

  getById(id: string): Promise<Category> {
    return request<Category>(`/categories/${id}`);
  },

  create(payload: CategoryPayload): Promise<Category> {
    return request<Category>('/categories', { method: 'POST', body: payload });
  },

  update(id: string, payload: CategoryPayload): Promise<Category> {
    return request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/categories/${id}`, { method: 'DELETE' });
  },
};
