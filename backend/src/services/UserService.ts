import { FindOptionsWhere } from 'typeorm';

import { CreateUserInput, ListUsersFilter, UpdateProfileInput } from '../dtos/user';
import { User } from '../entities/User';
import { UserRole } from '../entities/UserRole';
import { UserStatus } from '../entities/UserStatus';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { PasswordHasher } from '../interfaces/PasswordHasher';
import { UserRepository } from '../repositories/UserRepository';
import { normalizeCpf } from '../validators/cpfValidator';
import { InstructorService } from './InstructorService';

/** Regras do perfil do usuário autenticado (leitura e edição dos próprios dados). */
export class UserService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly instructors: InstructorService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.users.findById(id);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  /** Listagem somente-leitura usada para escolher o aluno ao criar uma matrícula. */
  async list(
    page: number,
    limit: number,
    filters: ListUsersFilter = {},
  ): Promise<PaginatedResult<User>> {
    const where: FindOptionsWhere<User> = {};
    const raw = where as Record<string, unknown>;

    // As colunas de enum são declaradas em propriedades privadas (`_role`),
    // então a chave da query usa esse nome, como no restante do repositório.
    if (filters.role) {
      raw._role = filters.role;
    }

    if (filters.status) {
      raw._status = filters.status;
    }

    return this.users.findPaginated({ page, limit, where });
  }

  /**
   * Cria uma conta com o perfil escolhido pelo ADMIN. A conta já nasce ativa,
   * mas com uma senha base: o usuário é obrigado a trocá-la no primeiro acesso.
   */
  async create(input: CreateUserInput): Promise<User> {
    const email = (input.email ?? '').trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf ?? '');

    if (await this.users.findByEmail(email)) {
      throw new ConflictError('E-mail já cadastrado');
    }

    if (await this.users.findByCpf(cpf)) {
      throw new ConflictError('CPF já cadastrado');
    }

    User.assertStrongPassword(input.password);
    const passwordHash = await this.hasher.hash(input.password);

    const user = new User({
      name: input.name,
      email,
      cpf,
      passwordHash,
      role: input.role,
      status: UserStatus.ACTIVE,
      mustChangePassword: true,
    });

    const saved = await this.users.save(user);

    // Um usuário criado já como INSTRUCTOR ativo ganha o cadastro de instrutor.
    await this.instructors.syncProfileForUser(saved);

    return saved;
  }

  /**
   * Aprova ou recusa um cadastro. Um cadastro pendente só passa a logar depois
   * de aprovado; a recusa mantém o registro para auditoria e permite reaprovar.
   */
  async changeStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.findById(userId);

    // Se a mudança desativa um instrutor, valida antes de salvar.
    if (status !== UserStatus.ACTIVE) {
      await this.instructors.assertProfileDetachable(user.id);
    }

    user.status = status;

    const saved = await this.users.save(user);
    await this.instructors.syncProfileForUser(saved);

    return saved;
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.findById(userId);

    // O e-mail é imutável: pode ser reenviado, mas nunca alterado.
    if (typeof input.email === 'string' && input.email.trim().toLowerCase() !== user.email) {
      throw new ForbiddenError('Não é permitido alterar o e-mail');
    }

    // Cada campo é opcional: nome, CPF e senha são atualizados de forma
    // independente. Campos ausentes ou vazios permanecem como estão.
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
      // O usuário definiu uma senha própria: libera as demais rotas.
      user.mustChangePassword = false;
    }

    const saved = await this.users.save(user);

    // Mantém o cadastro de instrutor espelhando nome/e-mail/CPF da conta.
    await this.instructors.syncProfileForUser(saved);

    return saved;
  }

  /**
   * Troca o perfil de acesso de um usuário (RBAC).
   * A rota é restrita ao ADMIN pelo middleware; a validação do valor ocorre
   * no setter da entidade, que recusa perfis desconhecidos.
   */
  async changeRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(userId);

    // Ao deixar de ser INSTRUCTOR, o cadastro de instrutor é removido; se
    // houver cursos vinculados, a troca é bloqueada antes de salvar.
    if (role !== UserRole.INSTRUCTOR) {
      await this.instructors.assertProfileDetachable(user.id);
    }

    user.role = role;

    const saved = await this.users.save(user);
    await this.instructors.syncProfileForUser(saved);

    return saved;
  }
}
