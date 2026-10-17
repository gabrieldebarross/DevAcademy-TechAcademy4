import { NextFunction, Request, Response } from 'express';

import { UserRole } from '../entities/UserRole';
import { ForbiddenError } from '../errors/ForbiddenError';

/**
 * Autoriza a requisição conforme o perfil do usuário (RBAC).
 *
 * Deve ser usado sempre depois de `ensureAuthenticated`, que é quem carrega
 * `req.user` a partir do banco.
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user || !allowed.includes(user.role)) {
        throw new ForbiddenError('Seu perfil não tem permissão para esta ação');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
