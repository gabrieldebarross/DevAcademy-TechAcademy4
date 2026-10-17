import { AppError } from './AppError';

/** 400 - the payload is well formed but breaks a domain rule. */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly error = 'ValidationError';

  constructor(message = 'Dados inválidos') {
    super(message);
  }
}
