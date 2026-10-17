import { AppError } from './AppError';

/** 403 - autenticado, mas sem permissão para executar a ação. */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly error = 'ForbiddenError';

  constructor(message = 'Acesso negado') {
    super(message);
  }
}
