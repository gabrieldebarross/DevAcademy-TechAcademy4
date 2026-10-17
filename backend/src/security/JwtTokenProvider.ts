import { JwtPayload, SignOptions, sign, verify } from 'jsonwebtoken';

import { env } from '../config/env';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { TokenPayload, TokenProvider } from '../interfaces/TokenProvider';

/** Implementação de `TokenProvider` com jsonwebtoken. */
export class JwtTokenProvider implements TokenProvider {
  private readonly expiresIn: SignOptions['expiresIn'];

  constructor() {
    this.expiresIn = env.jwt.expiresIn as SignOptions['expiresIn'];
  }

  generate(payload: TokenPayload): string {
    return sign({ email: payload.email }, env.jwt.secret, {
      subject: payload.sub,
      expiresIn: this.expiresIn,
    });
  }

  verify(token: string): TokenPayload {
    let decoded: string | JwtPayload;

    try {
      decoded = verify(token, env.jwt.secret);
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado');
    }

    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      throw new UnauthorizedError('Token inválido');
    }

    return { sub: decoded.sub, email: String(decoded.email ?? '') };
  }
}
