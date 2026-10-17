import { AppError } from './AppError';

/** 409 - a requisição conflita com o estado atual do recurso. */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly error = 'ConflictError';

  constructor(message = 'Conflito de dados') {
    super(message);
  }
}
