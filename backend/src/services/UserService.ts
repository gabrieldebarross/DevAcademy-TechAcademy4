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

    // The e-mail is immutable: it may be sent back, but never changed.
    if (typeof input.email === 'string' && input.email.trim().toLowerCase() !== user.email) {
      throw new ForbiddenError('Não é permitido alterar o e-mail');
    }

    // Each field is optional: the user may update the name, the CPF or the
    // password independently. Absent or empty fields are kept as they are.
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const cpf = normalizeCpf(typeof input.cpf === 'string' ? input.cpf : '');
    const password = typeof input.password === 'string' ? input.password : '';

    if (name.length === 0 && cpf.length === 0 && password.length === 0) {
      throw new ValidationError('Informe ao menos um campo para atualizar');
    }

    if (name.length > 0) {
      user.name = name;
    }

    if (cpf.length > 0) {
      const cpfOwner = await this.users.findByCpf(cpf);

      if (cpfOwner && cpfOwner.id !== user.id) {
        throw new ConflictError('CPF já cadastrado');
      }

      user.cpf = cpf;
    }

    if (password.length > 0) {
      User.assertStrongPassword(password);
      user.passwordHash = await this.hasher.hash(password);
    }

    return this.users.save(user);
  }
}
