import { User } from '../entities/User';

declare global {
  // Allows the authentication middleware to attach the logged user to the
  // request object in a type safe way.
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
