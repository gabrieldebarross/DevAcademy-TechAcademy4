import { Request } from 'express';

import { User } from '../entities/User';
import { UnauthorizedError } from '../errors/UnauthorizedError';

/**
 * Returns the authenticated user attached by `ensureAuthenticated`,
 * failing loudly instead of using a non-null assertion.
 */
export function requireAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new UnauthorizedError('Não autenticado');
  }

  return req.user;
}
