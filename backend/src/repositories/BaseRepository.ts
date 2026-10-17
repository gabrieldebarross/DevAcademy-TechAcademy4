import { FindOptionsOrder, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

import { PaginatedResult } from '../interfaces/PaginatedResult';
import { buildPaginationMeta } from '../utils/pagination';

export interface ListOptions<T> {
  readonly page: number;
  readonly limit: number;
  readonly where?: FindOptionsWhere<T>;
  readonly order?: FindOptionsOrder<T>;
}

/**
 * Generic repository with the operations shared by every resource.
 *
 * Being generic (`T`) it removes duplication while keeping full type safety:
 * a `CategoryRepository` returns `Category`, an `EnrollmentRepository` returns
 * `Enrollment`, and both reuse the exact same pagination logic.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    // TypeORM resolves filters by metadata property name, hence `_id`.
    const where = { _id: id } as unknown as FindOptionsWhere<T>;

    return this.repository.findOne({ where });
  }

  async findPaginated(options: ListOptions<T>): Promise<PaginatedResult<T>> {
    const defaultOrder = { _createdAt: 'DESC' } as unknown as FindOptionsOrder<T>;

    const [data, total] = await this.repository.findAndCount({
      where: options.where,
      order: options.order ?? defaultOrder,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return { data, meta: buildPaginationMeta(options.page, options.limit, total) };
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  async remove(entity: T): Promise<void> {
    await this.repository.remove(entity);
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }
}
