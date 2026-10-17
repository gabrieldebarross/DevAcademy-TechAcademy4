/**
 * Contrato para o hash de senhas.
 * A camada de serviço depende desta abstração, então o algoritmo pode ser
 * trocado sem tocar nas regras de negócio (Inversão de Dependência).
 */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}
