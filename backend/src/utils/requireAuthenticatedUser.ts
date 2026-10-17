import { Request } from 'express';

import { User } from '../entities/User';
import { UnauthorizedError } from '../errors/UnauthorizedError';

/**
 * Devolve o usuário autenticado anexado por `ensureAuthenticated`,
 * falhando explicitamente em vez de usar uma asserção não-nula.
 */
export function requireAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new UnauthorizedError('Não autenticado');
  }

  return req.user;
}
