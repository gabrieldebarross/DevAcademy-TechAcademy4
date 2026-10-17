import { InstructorInput, toInstructorResponse } from '../dtos/instructor';
import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { InstructorService } from '../services/InstructorService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

const service = new InstructorService(new InstructorRepository(), new CourseRepository());

export const list = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const result = await service.list(page, limit);

  res.status(200).json({ data: result.data.map(toInstructorResponse), meta: result.meta });
});

export const show = asyncHandler(async (req, res) => {
  const instructor = await service.findById(req.params.id);

  res.status(200).json(toInstructorResponse(instructor));
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
