import { CourseInput } from '../dtos/course';
import { Category } from '../entities/Category';
import { Course } from '../entities/Course';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { buildPaginationMeta } from '../utils/pagination';

/**
 * Cursos com autorização por perfil:
 *
 * ADMIN      -> cria, edita e remove qualquer curso.
 * INSTRUCTOR -> edita e remove apenas os cursos do próprio perfil de instrutor.
 *
 * A autorização de criação fica no middleware (`requireRole`), que é mais
 * barata; já a propriedade precisa do recurso carregado e por isso vive aqui.
 */
export class CourseService {
  constructor(
    private readonly courses: CourseRepository,
    private readonly categories: CategoryRepository,
    private readonly instructors: InstructorRepository,
    private readonly enrollments: EnrollmentRepository,
  ) {}

  async create(input: CourseInput): Promise<Course> {
    const category = await this.resolveCategory(input.categoryId);
    const instructor = await this.resolveInstructor(input.instructorId);

    const course = new Course({
      title: input.title,
      description: input.description,
      workloadHours: input.workloadHours,
      price: input.price,
      level: input.level,
      category,
      instructor,
    });

    return this.courses.save(course);
  }

  async list(actor: User, page: number, limit: number): Promise<PaginatedResult<Course>> {
    // ADMIN e STUDENT enxergam o catálogo completo; o INSTRUCTOR apenas os
    // cursos que leciona — o que ele pode gerenciar.
    if (actor.isAdmin() || actor.isStudent()) {
      return this.courses.findPaginated({ page, limit });
    }

    const profile = await this.instructors.findByUserId(actor.id);

    if (!profile) {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }

    return this.courses.findPaginatedByInstructor(profile.id, page, limit);
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courses.findById(id);

    if (!course) {
      throw new NotFoundError('Curso não encontrado');
    }

    return course;
  }

  async update(actor: User, id: string, input: CourseInput): Promise<Course> {
    const course = await this.findById(id);
    const ownedInstructor = await this.assertCanManage(actor, course);
    const category = await this.resolveCategory(input.categoryId);

    // Um instrutor não pode transferir o curso para outra pessoa; ele mantém
    // o próprio perfil. Só o ADMIN escolhe livremente o instrutor.
    const instructor = actor.isAdmin()
      ? await this.resolveInstructor(input.instructorId)
      : ownedInstructor;

    course.title = input.title;
    course.description = input.description;
    course.workloadHours = input.workloadHours;
    course.price = input.price;
    course.level = input.level;
    course.category = category;
    course.instructor = instructor;

    return this.courses.save(course);
  }

  async remove(actor: User, id: string): Promise<void> {
    const course = await this.findById(id);

    await this.assertCanManage(actor, course);

    if ((await this.enrollments.countByCourse(id)) > 0) {
      throw new ConflictError('Existem matrículas vinculadas a este curso');
    }

    await this.courses.remove(course);
  }

  /**
   * ADMIN pode tudo; INSTRUCTOR apenas nos cursos do próprio perfil.
   * Devolve o perfil de instrutor do ator para reuso na atualização.
   */
  private async assertCanManage(actor: User, course: Course): Promise<Instructor> {
    if (actor.isAdmin()) {
      return course.instructor;
    }

    const profile = await this.instructors.findByUserId(actor.id);

    if (!profile || course.instructor.id !== profile.id) {
      throw new ForbiddenError('Você só pode alterar os seus próprios cursos');
    }

    return profile;
  }

  private async resolveCategory(categoryId: string): Promise<Category> {
    const category = await this.categories.findById(categoryId ?? '');

    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return category;
  }

  private async resolveInstructor(instructorId: string): Promise<Instructor> {
    const instructor = await this.instructors.findById(instructorId ?? '');

    if (!instructor) {
      throw new NotFoundError('Instrutor não encontrado');
    }

    return instructor;
  }
}
