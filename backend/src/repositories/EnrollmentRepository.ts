import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Enrollment } from '../entities/Enrollment';
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

  /** Used to block the deletion of a course that still has enrollments. */
  async countByCourse(courseId: string): Promise<number> {
    return this.repository.count({
      where: { _course: { _id: courseId } } as FindOptionsWhere<Enrollment>,
    });
  }
}
