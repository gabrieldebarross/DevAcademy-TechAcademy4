export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

/** Envelope devolvido por todo endpoint de listagem paginada. */
export interface PaginatedResult<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;
}
