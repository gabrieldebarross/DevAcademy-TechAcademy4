import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * Classe base compartilhada por todas as entidades do sistema.
 *
 * Garante um modelo único e protegido de identidade: as colunas são privadas,
 * geradas pelo banco e só podem ser lidas por getters, de modo que nenhuma
 * outra camada consiga alterar um identificador ou um carimbo de data/hora.
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  private _id!: string;

  @CreateDateColumn({ name: 'created_at' })
  private _createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  private _updatedAt!: Date;

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
