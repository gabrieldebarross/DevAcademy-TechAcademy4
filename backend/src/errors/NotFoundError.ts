import { AppError } from './AppError';

/** 404 - o recurso solicitado não existe. */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly error = 'NotFoundError';

  constructor(message = 'Recurso não encontrado') {
    super(message);
  }
}
