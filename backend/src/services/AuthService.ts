import { AuthResponse, LoginInput, RegisterInput, toAuthResponse } from '../dtos/auth';
import { User } from '../entities/User';
import { UserRole } from '../entities/UserRole';
import { UserStatus } from '../entities/UserStatus';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { PasswordHasher } from '../interfaces/PasswordHasher';
import { TokenProvider } from '../interfaces/TokenProvider';
import { UserRepository } from '../repositories/UserRepository';
import { normalizeCpf } from '../validators/cpfValidator';

/** Regras de cadastro e autenticação. */
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

    // Regra de domínio: a senha em texto puro nunca chega ao banco.
    User.assertStrongPassword(input.password);
    const passwordHash = await this.hasher.hash(input.password);

    // Cadastro público: o aluno entra ativo; perfis privilegiados ficam
    // pendentes e só conseguem logar após a aprovação de um ADMIN.
    const role = input.role ?? UserRole.STUDENT;
    const status = role === UserRole.STUDENT ? UserStatus.ACTIVE : UserStatus.PENDING;

    const user = new User({ name: input.name, email, cpf, passwordHash, role, status });

    return this.users.save(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const email = (input.email ?? '').trim().toLowerCase();
    const user = await this.users.findByEmail(email);

    // Mesma mensagem para e-mail desconhecido e senha errada: evita enumeração de usuários.
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const passwordMatches = await this.hasher.compare(input.password ?? '', user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    // Só contas aprovadas podem entrar; a checagem vem depois da senha para
    // não revelar a situação de uma conta a quem não a conhece.
    if (!user.isActive()) {
      throw new ForbiddenError(
        user.status === UserStatus.PENDING
          ? 'Cadastro aguardando aprovação de um administrador'
          : 'Cadastro recusado por um administrador',
      );
    }

    const token = this.tokens.generate({ sub: user.id, email: user.email });

    return toAuthResponse(token, user);
  }
}
