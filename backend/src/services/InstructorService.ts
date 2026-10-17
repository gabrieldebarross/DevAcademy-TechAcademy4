import { InstructorInput } from '../dtos/instructor';
import { Instructor } from '../entities/Instructor';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { normalizeCpf } from '../validators/cpfValidator';

export class InstructorService {
  constructor(
    private readonly instructors: InstructorRepository,
    private readonly courses: CourseRepository,
  ) {}

  async create(input: InstructorInput): Promise<Instructor> {
    const email = (input.email ?? '').trim().toLowerCase();
    const cpf = normalizeCpf(input.cpf ?? '');

    if (await this.instructors.findByEmail(email)) {
      throw new ConflictError('E-mail já cadastrado');
    }

    if (await this.instructors.findByCpf(cpf)) {
      throw new ConflictError('CPF já cadastrado');
    }

    const instructor = new Instructor({
      name: input.name,
      email,
      cpf,
      specialty: input.specialty,
      bio: input.bio ?? null,
    });

    return this.instructors.save(instructor);
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
    const instructor = await this.findById(id);
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

    instructor.name = input.name;
    instructor.email = email;
    instructor.cpf = cpf;
    instructor.specialty = input.specialty;
    instructor.bio = input.bio ?? null;

    return this.instructors.save(instructor);
  }

  async remove(id: string): Promise<void> {
    const instructor = await this.findById(id);

    if ((await this.courses.countByInstructor(id)) > 0) {
      throw new ConflictError('Existem cursos vinculados a este instrutor');
    }

    await this.instructors.remove(instructor);
  }
}
