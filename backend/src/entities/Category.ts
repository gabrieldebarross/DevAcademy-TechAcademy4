import { Column, Entity } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { BaseEntity } from './BaseEntity';

export interface CategoryProps {
  readonly name: string;
  readonly description?: string | null;
}

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 80, unique: true })
  private _name!: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: true })
  private _description!: string | null;

  constructor(props?: CategoryProps) {
    super();

    if (props) {
      this.name = props.name;
      this.description = props.description ?? null;
    }
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  set name(value: string) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length < 3) {
      throw new ValidationError('O nome da categoria deve ter pelo menos 3 caracteres');
    }

    if (trimmed.length > 80) {
      throw new ValidationError('O nome da categoria deve ter no máximo 80 caracteres');
    }

    this._name = trimmed;
  }

  set description(value: string | null) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length > 255) {
      throw new ValidationError('A descrição deve ter no máximo 255 caracteres');
    }

    this._description = trimmed.length === 0 ? null : trimmed;
  }
}
