import { NextFunction, Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { env } from '../config/env';
import { AppError } from '../errors/AppError';

interface ErrorBody {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
}

/**
 * Ponto único que traduz exceções em respostas HTTP.
 * Erros esperados mantêm o próprio código de status (polimorfismo via `AppError`).
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    const body: ErrorBody = {
      statusCode: error.statusCode,
      error: error.error,
      message: error.message,
    };

    res.status(error.statusCode).json(body);
    return;
  }

  if (error instanceof QueryFailedError) {
    const body: ErrorBody = {
      statusCode: 409,
      error: 'ConflictError',
      message: 'Não foi possível concluir a operação por conflito de dados',
    };

    res.status(409).json(body);
    return;
  }

  const body: ErrorBody = {
    statusCode: 500,
    error: 'InternalServerError',
    message:
      env.nodeEnv === 'production'
        ? 'Erro interno do servidor'
        : error instanceof Error
          ? error.message
          : 'Erro inesperado',
  };

  res.status(500).json(body);
}

/** Responde a rotas não encontradas com o mesmo formato de erro da API. */
export function notFoundHandler(req: Request, res: Response): void {
  const body: ErrorBody = {
    statusCode: 404,
    error: 'NotFoundError',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  };

  res.status(404).json(body);
}
