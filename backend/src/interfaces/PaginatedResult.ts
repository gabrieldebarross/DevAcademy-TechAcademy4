export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

/** Envelope returned by every paginated list endpoint. */
export interface PaginatedResult<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;
}
