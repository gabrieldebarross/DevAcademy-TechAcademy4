import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Enrollment } from '../entities/Enrollment';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { BaseRepository } from './BaseRepository';

export class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() {
    super(AppDataSource.getRepository(Enrollment));
  }

  async findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    return this.repository.findOne({
      where: {
        _student: { _id: studentId },
        _course: { _id: courseId },
      } as FindOptionsWhere<Enrollment>,
    });
  }

  /** Usado para bloquear a exclusão de um curso que ainda tem matrículas. */
  async countByCourse(courseId: string): Promise<number> {
    return this.repository.count({
      where: { _course: { _id: courseId } } as FindOptionsWhere<Enrollment>,
    });
  }

  /** Matrículas do próprio aluno (visão do perfil STUDENT). */
  async findPaginatedByStudent(
    studentId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Enrollment>> {
    return this.findPaginated({
      page,
      limit,
      where: { _student: { _id: studentId } } as FindOptionsWhere<Enrollment>,
    });
  }

  /** Matrículas dos cursos de um instrutor (visão do perfil INSTRUCTOR). */
  async findPaginatedByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Enrollment>> {
    return this.findPaginated({
      page,
      limit,
      where: { _course: { _instructor: { _id: instructorId } } } as FindOptionsWhere<Enrollment>,
    });
  }
}
