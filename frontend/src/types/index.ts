export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  createdAt: string;
}

/** Minimal user data returned by the user listing (no CPF). */
export interface StudentSummary {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  cpf: string;
  specialty: string;
  bio: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Course {
  id: string;
  title: string;
  description: string;
  workloadHours: number;
  price: number;
  level: CourseLevel;
  category: { id: string; name: string };
  instructor: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  student: { id: string; name: string; email: string };
  course: { id: string; title: string; price: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
