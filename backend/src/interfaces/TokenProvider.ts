export interface TokenPayload {
  readonly sub: string;
  readonly email: string;
}

/**
 * Contrato usado pela camada de autenticação.
 * Os serviços dependem desta abstração, não de uma biblioteca concreta (DIP).
 */
export interface TokenProvider {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
