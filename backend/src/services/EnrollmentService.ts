import { EnrollmentInput } from '../dtos/enrollment';
import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';
import { User } from '../entities/User';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { UserRepository } from '../repositories/UserRepository';

export class EnrollmentService {
  constructor(
    private readonly enrollments: EnrollmentRepository,
    private readonly users: UserRepository,
    private readonly courses: CourseRepository,
  ) {}

  async create(input: EnrollmentInput): Promise<Enrollment> {
    const student = await this.resolveStudent(input.studentId);
    const course = await this.resolveCourse(input.courseId);

    if (await this.enrollments.findByStudentAndCourse(student.id, course.id)) {
      throw new ConflictError('Aluno já matriculado neste curso');
    }

    const enrollment = new Enrollment({ student, course, status: input.status });

    return this.enrollments.save(enrollment);
  }

  async list(page: number, limit: number): Promise<PaginatedResult<Enrollment>> {
    return this.enrollments.findPaginated({ page, limit });
  }

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollments.findById(id);

    if (!enrollment) {
      throw new NotFoundError('Matrícula não encontrada');
    }

    return enrollment;
  }

  async update(id: string, input: EnrollmentInput): Promise<Enrollment> {
    const enrollment = await this.findById(id);
    const student = await this.resolveStudent(input.studentId);
    const course = await this.resolveCourse(input.courseId);

    const duplicated = await this.enrollments.findByStudentAndCourse(student.id, course.id);

    if (duplicated && duplicated.id !== enrollment.id) {
      throw new ConflictError('Aluno já matriculado neste curso');
    }

    enrollment.student = student;
    enrollment.course = course;
    enrollment.status = input.status ?? enrollment.status;

    return this.enrollments.save(enrollment);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findById(id);

    await this.enrollments.remove(enrollment);
  }

  private async resolveStudent(studentId: string): Promise<User> {
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
