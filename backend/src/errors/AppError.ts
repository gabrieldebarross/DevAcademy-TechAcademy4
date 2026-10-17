/**
 * Classe base de todo erro esperado da aplicação.
 *
 * Por ser abstrata, obriga cada exceção concreta a definir o próprio código de
 * status HTTP e o rótulo do erro (polimorfismo por um contrato comum), que o
 * middleware global de erros usa para montar a resposta da API.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  /** Identificador estável devolvido no corpo da resposta. */
  abstract readonly error: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, new.target);
  }
}
