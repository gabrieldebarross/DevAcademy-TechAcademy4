import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { Person, PersonProps } from './Person';
import { User } from './User';
import { UserRole } from './UserRole';

export interface InstructorProps extends PersonProps {
  readonly specialty: string;
  readonly bio?: string | null;
  readonly user?: User | null;
}

@Entity('instructors')
export class Instructor extends Person {
  @Column({ name: 'specialty', type: 'varchar', length: 120 })
  private _specialty!: string;

  @Column({ name: 'bio', type: 'varchar', length: 255, nullable: true })
  private _bio!: string | null;

  /**
   * Conta de acesso vinculada a este instrutor (opcional).
   *
   * É essa ligação que permite ao usuário com perfil INSTRUCTOR gerenciar os
   * próprios cursos e as matrículas das suas aulas.
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  private _user!: User | null;

  constructor(props?: InstructorProps) {
    super(props);

    if (props) {
      this.specialty = props.specialty;
      this.bio = props.bio ?? null;
      this.user = props.user ?? null;
    }
  }

  get specialty(): string {
    return this._specialty;
  }

  get bio(): string | null {
    return this._bio;
  }

  get user(): User | null {
    return this._user;
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

  set user(value: User | null) {
    if (value !== null && !(value instanceof User)) {
      throw new ValidationError('Conta de acesso inválida');
    }

    this._user = value;
  }

  override get role(): UserRole {
    return UserRole.INSTRUCTOR;
  }

  override describe(): string {
    return `${this.name} - ${this.specialty}`;
  }
}
