/**
 * Base class of every expected application error.
 *
 * Being abstract, it forces each concrete exception to define its own HTTP
 * status code and error label (polymorphism through a common contract), which
 * the global error middleware uses to build the API response.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  /** Stable identifier returned in the response body. */
  abstract readonly error: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, new.target);
  }
}
