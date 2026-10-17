import { CourseInput } from '../dtos/course';
import { Category } from '../entities/Category';
import { Course } from '../entities/Course';
import { Instructor } from '../entities/Instructor';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';

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

  async list(page: number, limit: number): Promise<PaginatedResult<Course>> {
    return this.courses.findPaginated({ page, limit });
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courses.findById(id);

    if (!course) {
      throw new NotFoundError('Curso não encontrado');
    }

    return course;
  }

  async update(id: string, input: CourseInput): Promise<Course> {
    const course = await this.findById(id);
    const category = await this.resolveCategory(input.categoryId);
    const instructor = await this.resolveInstructor(input.instructorId);

    course.title = input.title;
    course.description = input.description;
    course.workloadHours = input.workloadHours;
    course.price = input.price;
    course.level = input.level;
    course.category = category;
    course.instructor = instructor;

    return this.courses.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findById(id);

    if ((await this.enrollments.countByCourse(id)) > 0) {
      throw new ConflictError('Existem matrículas vinculadas a este curso');
    }

    await this.courses.remove(course);
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
