import { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../errors/UnauthorizedError';
import { UserRepository } from '../repositories/UserRepository';
import { JwtTokenProvider } from '../security/JwtTokenProvider';

const tokenProvider = new JwtTokenProvider();
const users = new UserRepository();

const BEARER_PREFIX = 'Bearer ';

/**
 * Validates the JWT sent in the Authorization header and loads the current
 * user into `req.user`. Every resource route goes through this middleware.
 */
export async function ensureAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedError('Token de acesso não informado');
    }

    const token = authorization.slice(BEARER_PREFIX.length).trim();
    const payload = tokenProvider.verify(token);
    const user = await users.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
