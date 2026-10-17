import { FindOptionsWhere } from 'typeorm';

import { AppDataSource } from '../database/data-source';
import { Instructor } from '../entities/Instructor';
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
}
