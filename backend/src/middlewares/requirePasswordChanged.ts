import { NextFunction, Request, Response } from 'express';

import { ForbiddenError } from '../errors/ForbiddenError';

/**
 * Bloqueia as rotas de recursos enquanto o usuário ainda não trocou a senha
 * base definida no primeiro acesso.
 *
 * Precisa vir depois de `ensureAuthenticated` (que carrega `req.user`) e ser
 * aplicado somente às rotas que NÃO sejam o próprio perfil: a troca de senha
 * acontece em `PUT /users/me`, que fica liberado.
 */
export function requirePasswordChanged(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (req.user?.mustChangePassword) {
      throw new ForbiddenError('É necessário alterar a senha no primeiro acesso');
    }

    next();
  } catch (error) {
    next(error);
  }
}
