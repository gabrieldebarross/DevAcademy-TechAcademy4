import { Course, CourseLevel } from '../entities/Course';

export interface CourseInput {
  readonly title: string;
  readonly description: string;
  readonly workloadHours: number;
  readonly price: number;
  readonly level: CourseLevel;
  readonly categoryId: string;
  readonly instructorId: string;
}

export interface CourseResponse {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly workloadHours: number;
  readonly price: number;
  readonly level: CourseLevel;
  readonly category: { readonly id: string; readonly name: string };
  readonly instructor: { readonly id: string; readonly name: string };
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toCourseResponse(course: Course): CourseResponse {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    workloadHours: course.workloadHours,
    price: course.price,
    level: course.level,
    category: { id: course.category.id, name: course.category.name },
    instructor: { id: course.instructor.id, name: course.instructor.name },
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}
