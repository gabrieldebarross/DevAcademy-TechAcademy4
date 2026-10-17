import { AppError } from './AppError';

/** 409 - the request conflicts with the current state of the resource. */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly error = 'ConflictError';

  constructor(message = 'Conflito de dados') {
    super(message);
  }
}
