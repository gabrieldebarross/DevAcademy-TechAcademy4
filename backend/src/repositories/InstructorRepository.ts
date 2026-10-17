import { FindOptionsRelations, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Instructor } from '../entities/Instructor';
import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';

export class InstructorRepository extends BaseRepository<Instructor> {
  constructor() {
    super(AppDataSource.getRepository(Instructor));
  }

  async findByEmail(email: string): Promise<Instructor | null> {
    return this.repository.findOne({ where: { _email: email } as FindOptionsWhere<Instructor> });
  }

  async findByCpf(cpf: string): Promise<Instructor | null> {
    return this.repository.findOne({ where: { _cpf: cpf } as FindOptionsWhere<Instructor> });
  }

  /**
   * Perfil de instrutor vinculado a uma conta de acesso.
   * Base das regras de propriedade (o instrutor só gerencia o que é dele).
   */
  async findByUserId(userId: string): Promise<Instructor | null> {
    return this.repository.findOne({
      where: { _user: { _id: userId } } as FindOptionsWhere<Instructor>,
    });
  }

  /** Carrega o instrutor junto da conta de acesso vinculada (se houver). */
  async findByIdWithUser(id: string): Promise<Instructor | null> {
    return this.repository.findOne({
      where: { _id: id } as FindOptionsWhere<Instructor>,
      relations: { _user: true } as unknown as FindOptionsRelations<Instructor>,
    });
  }

  /**
   * Salva o instrutor e a conta de acesso na mesma transação, para que nunca
   * exista um instrutor sem conta (ou uma conta órfã) por falha no meio.
   */
  async saveWithUser(instructor: Instructor, user: User): Promise<Instructor> {
    return this.repository.manager.transaction(async (manager) => {
      await manager.save(user);
      return manager.save(instructor);
    });
  }

  /**
   * Remove o instrutor e a conta de acesso vinculada na mesma transação.
   * A conta é apagada junto porque o acesso não faz mais sentido sem o perfil.
   */
  async removeWithUser(instructor: Instructor, user: User | null): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      await manager.remove(instructor);

      if (user) {
        await manager.remove(user);
      }
    });
  }
}
