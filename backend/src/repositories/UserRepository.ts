import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { _email: email } as FindOptionsWhere<User> });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.repository.findOne({ where: { _cpf: cpf } as FindOptionsWhere<User> });
  }
}
