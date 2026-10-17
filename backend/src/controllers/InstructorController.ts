import {
  InstructorInput,
  toInstructorResponse,
  toInstructorSummary,
} from '../dtos/instructor';
import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { InstructorService } from '../services/InstructorService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { requireAuthenticatedUser } from '../utils/requireAuthenticatedUser';

const service = new InstructorService(
  new InstructorRepository(),
  new CourseRepository(),
  new UserRepository(),
  new BcryptPasswordHasher(),
);

/** O CPF só é exposto ao ADMIN; os demais perfis recebem o resumo sem CPF. */
export const list = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const { page, limit } = parsePagination(req.query);
  const result = await service.list(page, limit);
  const data = actor.isAdmin()
    ? result.data.map(toInstructorResponse)
    : result.data.map(toInstructorSummary);

  res.status(200).json({ data, meta: result.meta });
});

export const show = asyncHandler(async (req, res) => {
  const actor = requireAuthenticatedUser(req);
  const instructor = await service.findById(req.params.id);

  res
    .status(200)
    .json(
      actor.isAdmin()
        ? toInstructorResponse(instructor)
        : toInstructorSummary(instructor),
    );
});

export const create = asyncHandler(async (req, res) => {
  const instructor = await service.create(req.body as InstructorInput);

  res.status(201).json(toInstructorResponse(instructor));
});

export const update = asyncHandler(async (req, res) => {
  const instructor = await service.update(req.params.id, req.body as InstructorInput);

  res.status(200).json(toInstructorResponse(instructor));
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);

  res.status(204).send();
});
