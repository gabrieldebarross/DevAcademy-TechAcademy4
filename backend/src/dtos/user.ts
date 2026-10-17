import { User } from '../entities/User';

export interface UpdateProfileInput {
  readonly name?: string;
  readonly email?: string;
  readonly cpf?: string;
  readonly password?: string;
}

/** Public representation of a user. The password hash is never included. */
export interface UserResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly role: string;
  readonly createdAt: string;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Minimal representation used when picking a student for an enrollment.
 * It intentionally omits the CPF so the listing never exposes personal data
 * of other users.
 */
export interface UserSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export function toUserSummary(user: User): UserSummary {
  return { id: user.id, name: user.name, email: user.email };
}
