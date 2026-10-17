import { EnrollmentInput, toEnrollmentResponse } from '../dtos/enrollment';
import { CourseRepository } from '../repositories/CourseRepository';
import { EnrollmentRepository } from '../repositories/EnrollmentRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { EnrollmentService } from '../services/EnrollmentService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { requireAuthenticatedUser } from '../utils/requireAuthenticatedUser';

const service = new EnrollmentService(
  new EnrollmentRepository(),
  new UserRepository(),
  new CourseRepository(),
  new InstructorRepository(),
);

export const list = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const { page, limit } = parsePagination(req.query);
  const result = await service.list(actor, page, limit);

  res.status(200).json({ data: result.data.map(toEnrollmentResponse), meta: result.meta });
});

export const show = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const enrollment = await service.findById(actor, req.params.id);

  res.status(200).json(toEnrollmentResponse(enrollment));
});

export const create = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const enrollment = await service.create(actor, req.body as EnrollmentInput);

  res.status(201).json(toEnrollmentResponse(enrollment));
});

export const update = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const enrollment = await service.update(actor, req.params.id, req.body as EnrollmentInput);

  res.status(200).json(toEnrollmentResponse(enrollment));
});

export const remove = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);

  await service.remove(actor, req.params.id);

  res.status(204).send();
});
