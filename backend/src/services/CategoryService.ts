import { CategoryInput } from '../dtos/category';
import { Category } from '../entities/Category';
import { ConflictError } from '../errors/ConflictError';
import { NotFoundError } from '../errors/NotFoundError';
import { PaginatedResult } from '../interfaces/PaginatedResult';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CourseRepository } from '../repositories/CourseRepository';

export class CategoryService {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly courses: CourseRepository,
  ) {}

  async create(input: CategoryInput): Promise<Category> {
    const name = (input.name ?? '').trim();

    if (await this.categories.findByName(name)) {
      throw new ConflictError('Já existe uma categoria com este nome');
    }

    const category = new Category({ name, description: input.description ?? null });

    return this.categories.save(category);
  }

  async list(page: number, limit: number): Promise<PaginatedResult<Category>> {
    return this.categories.findPaginated({ page, limit });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categories.findById(id);

    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, input: CategoryInput): Promise<Category> {
    const category = await this.findById(id);
    const name = (input.name ?? '').trim();
    const duplicated = await this.categories.findByName(name);

    if (duplicated && duplicated.id !== category.id) {
      throw new ConflictError('Já existe uma categoria com este nome');
    }

    category.name = name;
    category.description = input.description ?? null;

    return this.categories.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);

    if ((await this.courses.countByCategory(id)) > 0) {
      throw new ConflictError('Existem cursos vinculados a esta categoria');
    }

    await this.categories.remove(category);
  }
}
