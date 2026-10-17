import { EnrollmentInput } from '../dtos/enrollment';
import { Course } from '../entities/Course';
import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';
import { ConflictError } from '../errors/ConflictError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { buildPaginationMeta } from '../utils/pagination';

/**
 * Matrículas com autorização por perfil:
 *
 * ADMIN      -> gerencia qualquer matrícula e aprova solicitações.
 * INSTRUCTOR -> cria/aprova as matrículas das suas próprias aulas.
 * STUDENT    -> solicita a própria matrícula (nasce PENDING) e vê as suas.
 */
export class EnrollmentService {
  constructor(
    private readonly enrollments: EnrollmentRepository,
    private readonly users: UserRepository,
    private readonly courses: CourseRepository,
    private readonly instructors: InstructorRepository,
  ) {}

  async list(actor: User, page: number, limit: number): Promise<PaginatedResult<Enrollment>> {
    if (actor.isAdmin()) {
      return this.enrollments.findPaginated({ page, limit });
    }

    if (actor.isStudent()) {
      return this.enrollments.findPaginatedByStudent(actor.id, page, limit);
    }

    const profile = await this.instructors.findByUserId(actor.id);

    // Instrutor sem perfil vinculado simplesmente não enxerga matrícula alguma.
    if (!profile) {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }

    return this.enrollments.findPaginatedByInstructor(profile.id, page, limit);
  }

  async findById(actor: User, id: string): Promise<Enrollment> {
    const enrollment = await this.enrollments.findById(id);

    if (!enrollment) {
      throw new NotFoundError('Matrícula não encontrada');
    }

    await this.assertCanRead(actor, enrollment);

    return enrollment;
  }

  async create(actor: User, input: EnrollmentInput): Promise<Enrollment> {
    const course = await this.resolveCourse(input.courseId);

    // O aluno solicita a própria matrícula: ela nasce PENDING e só passa a
    // valer quando o ADMIN ou o instrutor da aula aprova.
    if (actor.isStudent()) {
      if (await this.enrollments.findByStudentAndCourse(actor.id, course.id)) {
        throw new ConflictError('Você já solicitou ou possui matrícula neste curso');
      }

      const request = new Enrollment({
        student: actor,
        course,
        status: EnrollmentStatus.PENDING,
      });

      return this.enrollments.save(request);
    }

    const student = await this.resolveStudent(input.studentId);

    await this.assertCanEnrollInCourse(actor, course);

    if (await this.enrollments.findByStudentAndCourse(student.id, course.id)) {
      throw new ConflictError('Aluno já matriculado neste curso');
    }

    const enrollment = new Enrollment({
      student,
      course,
      status: input.status ?? EnrollmentStatus.ACTIVE,
    });

    return this.enrollments.save(enrollment);
  }

  async update(actor: User, id: string, input: EnrollmentInput): Promise<Enrollment> {
    const enrollment = await this.findById(actor, id);
    const student = await this.resolveStudent(input.studentId);
    const course = await this.resolveCourse(input.courseId);

    // O instrutor precisa ser dono da matrícula atual e do curso de destino.
    await this.assertOwnsEnrollment(actor, enrollment);
    await this.assertCanEnrollInCourse(actor, course);

    const duplicated = await this.enrollments.findByStudentAndCourse(student.id, course.id);

    if (duplicated && duplicated.id !== enrollment.id) {
      throw new ConflictError('Aluno já matriculado neste curso');
    }

    enrollment.student = student;
    enrollment.course = course;
    enrollment.status = input.status ?? enrollment.status;

    return this.enrollments.save(enrollment);
  }

  async remove(actor: User, id: string): Promise<void> {
    const enrollment = await this.findById(actor, id);

    if (actor.isStudent()) {
      // O aluno só desfaz o próprio pedido enquanto ele está pendente.
      if (enrollment.status !== EnrollmentStatus.PENDING) {
        throw new ForbiddenError('Você só pode cancelar solicitações pendentes');
      }
    } else {
      await this.assertOwnsEnrollment(actor, enrollment);
    }

    await this.enrollments.remove(enrollment);
  }

  /** Leitura: ADMIN vê tudo, o aluno vê o que é seu e o instrutor o que é seu. */
  private async assertCanRead(actor: User, enrollment: Enrollment): Promise<void> {
    if (actor.isAdmin()) {
      return;
    }

    if (actor.isStudent()) {
      if (enrollment.student.id !== actor.id) {
        throw new ForbiddenError('Você só pode ver as suas próprias matrículas');
      }

      return;
    }

    const profile = await this.resolveInstructorProfile(actor);

    if (enrollment.course.instructor.id !== profile.id) {
      throw new ForbiddenError('Você só pode ver as matrículas das suas aulas');
    }
  }

  /** Escrita sobre uma matrícula já existente (editar/remover). */
  private async assertOwnsEnrollment(actor: User, enrollment: Enrollment): Promise<void> {
    if (actor.isAdmin()) {
      return;
    }

    const profile = await this.resolveInstructorProfile(actor);

    if (enrollment.course.instructor.id !== profile.id) {
      throw new ForbiddenError('Você só pode gerenciar as matrículas das suas aulas');
    }
  }

  /** Criação de matrícula: o instrutor só matricula nas próprias aulas. */
  private async assertCanEnrollInCourse(actor: User, course: Course): Promise<void> {
    if (actor.isAdmin()) {
      return;
    }

    const profile = await this.resolveInstructorProfile(actor);

    if (course.instructor.id !== profile.id) {
      throw new ForbiddenError('Você só pode matricular alunos nas suas próprias aulas');
    }
  }

  private async resolveInstructorProfile(actor: User): Promise<Instructor> {
    const profile = await this.instructors.findByUserId(actor.id);

    if (!profile) {
      throw new ForbiddenError('Sua conta não está vinculada a um perfil de instrutor');
    }

    return profile;
  }

  private async resolveStudent(studentId?: string): Promise<User> {
    const student = await this.users.findById(studentId ?? '');

    if (!student) {
      throw new NotFoundError('Aluno não encontrado');
    }

    return student;
  }

  private async resolveCourse(courseId: string): Promise<Course> {
    const course = await this.courses.findById(courseId ?? '');

    if (!course) {
      throw new NotFoundError('Curso não encontrado');
    }

    return course;
  }
}
