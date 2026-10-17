import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Course } from '../entities/Course';
import { BaseRepository } from './BaseRepository';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(AppDataSource.getRepository(Course));
  }

  /** Used to block the deletion of a category that still has courses. */
  async countByCategory(categoryId: string): Promise<number> {
    return this.repository.count({
      where: { _category: { _id: categoryId } } as FindOptionsWhere<Course>,
    });
  }

  /** Used to block the deletion of an instructor that still has courses. */
  async countByInstructor(instructorId: string): Promise<number> {
    return this.repository.count({
      where: { _instructor: { _id: instructorId } } as FindOptionsWhere<Course>,
    });
  }
}
