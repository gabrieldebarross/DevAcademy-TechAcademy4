import { CategoryInput, toCategoryResponse } from '../dtos/category';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { CategoryService } from '../services/CategoryService';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';

const service = new CategoryService(new CategoryRepository(), new CourseRepository());

export const list = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const result = await service.list(page, limit);

  res.status(200).json({ data: result.data.map(toCategoryResponse), meta: result.meta });
});

export const show = asyncHandler(async (req, res) => {
  const category = await service.findById(req.params.id);

  res.status(200).json(toCategoryResponse(category));
});

export const create = asyncHandler(async (req, res) => {
  const category = await service.create(req.body as CategoryInput);

  res.status(201).json(toCategoryResponse(category));
});

export const update = asyncHandler(async (req, res) => {
  const category = await service.update(req.params.id, req.body as CategoryInput);

  res.status(200).json(toCategoryResponse(category));
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);

  res.status(204).send();
});
