import { Request } from 'express';

import { PaginationMeta } from '../interfaces/PaginatedResult';

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function toPositiveInteger(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number.NaN;

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

/** Lê `?page=` e `?limit=` da query string, com padrões seguros. */
export function parsePagination(query: Request['query']): PaginationParams {
  const page = toPositiveInteger(query.page, DEFAULT_PAGE);
  const limit = Math.min(toPositiveInteger(query.limit, DEFAULT_LIMIT), MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
