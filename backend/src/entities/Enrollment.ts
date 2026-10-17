import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { BaseEntity } from './BaseEntity';
import { Course } from './Course';
import { User } from './User';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface EnrollmentProps {
  readonly student: User;
  readonly course: Course;
  readonly status?: EnrollmentStatus;
}

/** A student can only be enrolled once in the same course. */
@Entity('enrollments')
@Unique('UQ_enrollment_student_course', ['_student', '_course'])
export class Enrollment extends BaseEntity {
  @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  private _student!: User;

  @ManyToOne(() => Course, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  private _course!: Course;

  @Column({ name: 'status', type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  private _status!: EnrollmentStatus;

  @CreateDateColumn({ name: 'enrolled_at' })
  private _enrolledAt!: Date;

  constructor(props?: EnrollmentProps) {
    super();

    if (props) {
      this.student = props.student;
      this.course = props.course;
      this.status = props.status ?? EnrollmentStatus.ACTIVE;
    }
  }

  get student(): User {
    return this._student;
  }

  get course(): Course {
    return this._course;
  }

  get status(): EnrollmentStatus {
    return this._status;
  }

  get enrolledAt(): Date {
    return this._enrolledAt;
  }

  set student(value: User) {
    if (!(value instanceof User)) {
      throw new ValidationError('Aluno inválido');
    }

    this._student = value;
  }

  set course(value: Course) {
    if (!(value instanceof Course)) {
      throw new ValidationError('Curso inválido');
    }

    this._course = value;
  }

  set status(value: EnrollmentStatus) {
    if (!Object.values(EnrollmentStatus).includes(value)) {
      throw new ValidationError('Status de matrícula inválido');
    }

    this._status = value;
  }
}
