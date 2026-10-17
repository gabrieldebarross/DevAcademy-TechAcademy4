import { CourseInput, toCourseResponse } from '../dtos/course';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { CourseService } from '../services/CourseService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { requireAuthenticatedUser } from '../utils/requireAuthenticatedUser';

const service = new CourseService(
  new CourseRepository(),
  new CategoryRepository(),
  new InstructorRepository(),
  new EnrollmentRepository(),
);

export const list = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const { page, limit } = parsePagination(req.query);
  const result = await service.list(actor, page, limit);

  res.status(200).json({ data: result.data.map(toCourseResponse), meta: result.meta });
});

export const show = asyncHandler(async (req, res) => {
  const course = await service.findById(req.params.id);

  res.status(200).json(toCourseResponse(course));
});

export const create = asyncHandler(async (req, res) => {
  const course = await service.create(req.body as CourseInput);

  res.status(201).json(toCourseResponse(course));
});

export const update = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const course = await service.update(actor, req.params.id, req.body as CourseInput);

  res.status(200).json(toCourseResponse(course));
});

export const remove = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);

  await service.remove(actor, req.params.id);

  res.status(204).send();
});
