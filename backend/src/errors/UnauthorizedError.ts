import { AppError } from './AppError';

/** 401 - missing, invalid or expired credentials. */
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly error = 'UnauthorizedError';

  constructor(message = 'Não autenticado') {
    super(message);
  }
}
