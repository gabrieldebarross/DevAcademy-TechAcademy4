import { User } from '../entities/User';

declare global {
  // Permite que o middleware de autenticação anexe o usuário logado ao objeto
  // de requisição com segurança de tipos.
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
