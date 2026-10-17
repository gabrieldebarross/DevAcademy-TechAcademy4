import { UpdateProfileInput } from '../dtos/user';
import { User } from '../entities/User';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { PasswordHasher } from '../interfaces/PasswordHasher';
import { UserRepository } from '../repositories/UserRepository';
import { normalizeCpf } from '../validators/cpfValidator';

/** Rules of the authenticated user profile (read and update own data). */
export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findById(id);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  /** Read-only listing used to pick a student when creating an enrollment. */
  async list(page: number, limit: number): Promise<PaginatedResult<User>> {
    return this.users.findPaginated({ page, limit });
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.findById(userId);

    // Every field is mandatory, except the e-mail which is immutable.
    if (
      typeof input.name !== 'string' ||
      typeof input.cpf !== 'string' ||
      typeof input.password !== 'string'
    ) {
      throw new ValidationError('Nome, CPF e senha são obrigatórios');
    }

    if (typeof input.email === 'string' && input.email.trim().toLowerCase() !== user.email) {
      throw new ForbiddenError('Não é permitido alterar o e-mail');
    }

    const cpf = normalizeCpf(input.cpf);
    const cpfOwner = await this.users.findByCpf(cpf);

    if (cpfOwner && cpfOwner.id !== user.id) {
      throw new ConflictError('CPF já cadastrado');
    }

    User.assertStrongPassword(input.password);

    user.name = input.name;
    user.cpf = cpf;
    user.passwordHash = await this.hasher.hash(input.password);

    return this.users.save(user);
  }
}
