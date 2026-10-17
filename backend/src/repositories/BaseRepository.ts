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
 * Repositório genérico com as operações compartilhadas por todo recurso.
 *
 * Por ser genérico (`T`) elimina duplicação mantendo total segurança de tipos:
 * um `CategoryRepository` devolve `Category`, um `EnrollmentRepository` devolve
 * `Enrollment`, e ambos reutilizam exatamente a mesma lógica de paginação.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async findById(id: string): Promise<T | null> {
    // O TypeORM resolve filtros pelo nome da propriedade na metadata, daí `_id`.
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
