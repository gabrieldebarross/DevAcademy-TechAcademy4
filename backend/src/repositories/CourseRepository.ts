import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Course } from '../entities/Course';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { BaseRepository } from './BaseRepository';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(AppDataSource.getRepository(Course));
  }

  /** Usado para bloquear a exclusão de uma categoria que ainda tem cursos. */
  async countByCategory(categoryId: string): Promise<number> {
    return this.repository.count({
      where: { _category: { _id: categoryId } } as FindOptionsWhere<Course>,
    });
  }

  /** Usado para bloquear a exclusão de um instrutor que ainda tem cursos. */
  async countByInstructor(instructorId: string): Promise<number> {
    return this.repository.count({
      where: { _instructor: { _id: instructorId } } as FindOptionsWhere<Course>,
    });
  }

  /** Cursos de um instrutor (visão do perfil INSTRUCTOR). */
  async findPaginatedByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Course>> {
    return this.findPaginated({
      page,
      limit,
      where: { _instructor: { _id: instructorId } } as FindOptionsWhere<Course>,
    });
  }
}
