import { AuthResponse, LoginInput, RegisterInput, toAuthResponse } from '../dtos/auth';
import { User } from '../entities/User';
import { ConflictError } from '../errors/ConflictError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { PasswordHasher } from '../interfaces/PasswordHasher';
import { TokenProvider } from '../interfaces/TokenProvider';
import { UserRepository } from '../repositories/UserRepository';
import { normalizeCpf } from '../validators/cpfValidator';

/** Registration and authentication rules. */
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenProvider,
  ) {}

  async register(input: RegisterInput): Promise<User> {
    const email = (input.email ?? '').trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf ?? '');

    if (await this.users.findByEmail(email)) {
      throw new ConflictError('E-mail já cadastrado');
    }

    if (await this.users.findByCpf(cpf)) {
      throw new ConflictError('CPF já cadastrado');
    }

    // Domain rule: the plain password never reaches the database.
    User.assertStrongPassword(input.password);
    const passwordHash = await this.hasher.hash(input.password);

    const user = new User({ name: input.name, email, cpf, passwordHash });

    return this.users.save(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const email = (input.email ?? '').trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    // Same message for unknown e-mail and wrong password: no user enumeration.
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const passwordMatches = await this.hasher.compare(input.password ?? '', user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const token = this.tokens.generate({ sub: user.id, email: user.email });

    return toAuthResponse(token, user);
  }
}
