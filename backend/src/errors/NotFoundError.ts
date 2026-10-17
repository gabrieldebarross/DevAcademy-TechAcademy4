import { AppError } from './AppError';

/** 404 - the requested resource does not exist. */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly error = 'NotFoundError';

  constructor(message = 'Recurso não encontrado') {
    super(message);
  }
}
