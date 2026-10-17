export interface TokenPayload {
  readonly sub: string;
  readonly email: string;
}

/**
 * Contract used by the authentication layer.
 * Services depend on this abstraction, not on a concrete library (DIP).
 */
export interface TokenProvider {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
