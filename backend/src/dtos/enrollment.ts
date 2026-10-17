import { Enrollment, EnrollmentStatus } from '../entities/Enrollment';

export interface EnrollmentInput {
  readonly studentId: string;
  readonly courseId: string;
  readonly status?: EnrollmentStatus;
}

export interface EnrollmentResponse {
  readonly id: string;
  readonly status: EnrollmentStatus;
  readonly enrolledAt: string;
  readonly student: { readonly id: string; readonly name: string; readonly email: string };
  readonly course: { readonly id: string; readonly title: string; readonly price: number };
}

export function toEnrollmentResponse(enrollment: Enrollment): EnrollmentResponse {
  return {
    id: enrollment.id,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    student: {
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
    },
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      price: enrollment.course.price,
    },
  };
}
