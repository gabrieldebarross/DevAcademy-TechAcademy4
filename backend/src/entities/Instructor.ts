import { Column, Entity } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { Person, PersonProps } from './Person';

export interface InstructorProps extends PersonProps {
  readonly specialty: string;
  readonly bio?: string | null;
}

@Entity('instructors')
export class Instructor extends Person {
  @Column({ name: 'specialty', type: 'varchar', length: 120 })
  private _specialty!: string;

  @Column({ name: 'bio', type: 'varchar', length: 255, nullable: true })
  private _bio!: string | null;

  constructor(props?: InstructorProps) {
    super(props);

    if (props) {
      this.specialty = props.specialty;
      this.bio = props.bio ?? null;
    }
  }

  get specialty(): string {
    return this._specialty;
  }

  get bio(): string | null {
    return this._bio;
  }

  set specialty(value: string) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length < 3) {
      throw new ValidationError('A especialidade deve ter pelo menos 3 caracteres');
    }

    if (trimmed.length > 120) {
      throw new ValidationError('A especialidade deve ter no máximo 120 caracteres');
    }

    this._specialty = trimmed;
  }

  set bio(value: string | null) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length > 255) {
      throw new ValidationError('A bio deve ter no máximo 255 caracteres');
    }

    this._bio = trimmed.length === 0 ? null : trimmed;
  }

  override get role(): string {
    return 'instructor';
  }

  override describe(): string {
    return `${this.name} - ${this.specialty}`;
  }
}
