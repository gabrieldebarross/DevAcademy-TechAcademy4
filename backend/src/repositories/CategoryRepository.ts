import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Category } from '../entities/Category';
import { BaseRepository } from './BaseRepository';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(AppDataSource.getRepository(Category));
  }

  async findByName(name: string): Promise<Category | null> {
    return this.repository.findOne({ where: { _name: name } as FindOptionsWhere<Category> });
  }
}
