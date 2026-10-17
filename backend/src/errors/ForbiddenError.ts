import { AppError } from './AppError';

/** 403 - authenticated, but not allowed to perform the action. */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly error = 'ForbiddenError';

  constructor(message = 'Acesso negado') {
    super(message);
  }
}
