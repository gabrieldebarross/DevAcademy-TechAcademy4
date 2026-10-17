import { InstructorInput } from '../dtos/instructor';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';
import { UserRole } from '../entities/UserRole';
import { UserStatus } from '../entities/UserStatus';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { PasswordHasher } from '../interfaces/PasswordHasher';
import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { normalizeCpf } from '../validators/cpfValidator';

export class InstructorService {
  /** Especialidade padrão do cadastro criado automaticamente a partir da conta. */
  private static readonly DEFAULT_SPECIALTY = 'A definir';

  constructor(
    private readonly instructors: InstructorRepository,
    private readonly courses: CourseRepository,
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  /**
   * Mantém o cadastro de instrutor em sincronia com a conta de acesso.
   *
   * Um usuário ativo com perfil INSTRUCTOR precisa ter um cadastro de
   * instrutor (criado aqui com dados padrão, editáveis depois em
   * `/instructors`). Ao deixar de ser instrutor ativo, o cadastro é removido —
   * o que é bloqueado se houver cursos vinculados.
   */
  async syncProfileForUser(user: User): Promise<void> {
    const profile = await this.instructors.findByUserId(user.id);
    const shouldHaveProfile = user.role === UserRole.INSTRUCTOR && user.isActive();

    if (!shouldHaveProfile) {
      if (profile) {
        await this.removeProfile(profile);
      }
      return;
    }

    if (profile) {
      // Mantém apenas o nome em sincronia; especialidade, bio, e-mail e CPF
      // são editados em /instructors e não são sobrescritos aqui.
      if (profile.name !== user.name) {
        profile.name = user.name;
        await this.instructors.save(profile);
      }
      return;
    }

    await this.instructors.save(
      new Instructor({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        specialty: InstructorService.DEFAULT_SPECIALTY,
        bio: null,
        user,
      }),
    );
  }

  /** Valida, antes de salvar, que o usuário pode deixar de ser instrutor. */
  async assertProfileDetachable(userId: string): Promise<void> {
    const profile = await this.instructors.findByUserId(userId);

    if (profile && (await this.courses.countByInstructor(profile.id)) > 0) {
      throw new ConflictError(
        'Este usuário é instrutor de cursos; altere ou remova os cursos antes de mudar o perfil',
      );
    }
  }

  private async removeProfile(profile: Instructor): Promise<void> {
    if ((await this.courses.countByInstructor(profile.id)) > 0) {
      throw new ConflictError(
        'Este usuário é instrutor de cursos; altere ou remova os cursos antes de mudar o perfil',
      );
    }

    await this.instructors.remove(profile);
  }

  async create(input: InstructorInput): Promise<Instructor> {
    const email = (input.email ?? '').trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf ?? '');

    if (await this.instructors.findByEmail(email)) {
      throw new ConflictError('E-mail já cadastrado');
    }

    if (await this.instructors.findByCpf(cpf)) {
      throw new ConflictError('CPF já cadastrado');
    }

    // Criar um instrutor cria, junto, a conta de acesso: um instrutor sem
    // login não faria sentido. Aqui validamos que e-mail/CPF não pertencem a
    // outra conta e criamos o usuário INSTRUCTOR na mesma transação.
    if (await this.users.findByEmail(email)) {
      throw new ConflictError('Já existe uma conta de acesso com este e-mail');
    }

    if (await this.users.findByCpf(cpf)) {
      throw new ConflictError('Já existe uma conta de acesso com este CPF');
    }

    // Senha base: o instrutor é obrigado a trocá-la no primeiro acesso.
    User.assertStrongPassword(input.password ?? '');
    const passwordHash = await this.hasher.hash(input.password ?? '');

    const user = new User({
      name: input.name,
      email,
      cpf,
      passwordHash,
      role: UserRole.INSTRUCTOR,
      status: UserStatus.ACTIVE,
      mustChangePassword: true,
    });

    const instructor = new Instructor({
      name: input.name,
      email,
      cpf,
      specialty: input.specialty,
      bio: input.bio ?? null,
      user,
    });

    return this.instructors.saveWithUser(instructor, user);
  }

  async list(page: number, limit: number): Promise<PaginatedResult<Instructor>> {
    return this.instructors.findPaginated({ page, limit });
  }

  async findById(id: string): Promise<Instructor> {
    const instructor = await this.instructors.findById(id);

    if (!instructor) {
      throw new NotFoundError('Instrutor não encontrado');
    }

    return instructor;
  }

  async update(id: string, input: InstructorInput): Promise<Instructor> {
    const instructor = await this.instructors.findByIdWithUser(id);

    if (!instructor) {
      throw new NotFoundError('Instrutor não encontrado');
    }

    const email = (input.email ?? '').trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf ?? '');

    const emailOwner = await this.instructors.findByEmail(email);
    if (emailOwner && emailOwner.id !== instructor.id) {
      throw new ConflictError('E-mail já cadastrado');
    }

    const cpfOwner = await this.instructors.findByCpf(cpf);
    if (cpfOwner && cpfOwner.id !== instructor.id) {
      throw new ConflictError('CPF já cadastrado');
    }

    const user = instructor.user;

    instructor.name = input.name;
    instructor.email = email;
    instructor.cpf = cpf;
    instructor.specialty = input.specialty;
    instructor.bio = input.bio ?? null;

    // Mantém o nome da conta de acesso igual ao do cadastro. E-mail e CPF do
    // cadastro são apenas de contato e não alteram os dados de login.
    if (user) {
      user.name = input.name;
      return this.instructors.saveWithUser(instructor, user);
    }

    return this.instructors.save(instructor);
  }

  async remove(id: string): Promise<void> {
    const instructor = await this.instructors.findByIdWithUser(id);

    if (!instructor) {
      throw new NotFoundError('Instrutor não encontrado');
    }

    if ((await this.courses.countByInstructor(id)) > 0) {
      throw new ConflictError('Existem cursos vinculados a este instrutor');
    }

    // Remove também a conta de acesso: sem o perfil de instrutor, o login
    // não teria mais função.
    await this.instructors.removeWithUser(instructor, instructor.user ?? null);
  }
}
