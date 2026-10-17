import { AppError } from './AppError';

/** 400 - o payload está bem formado, mas quebra uma regra de domínio. */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly error = 'ValidationError';

  constructor(message = 'Dados inválidos') {
    super(message);
  }
}
