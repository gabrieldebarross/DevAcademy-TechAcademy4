import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ValidationError } from '../errors/ValidationError';
import { BaseEntity } from './BaseEntity';
import { Category } from './Category';
import { Instructor } from './Instructor';
import { decimalTransformer } from './transformers';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface CourseProps {
  readonly title: string;
  readonly description: string;
  readonly workloadHours: number;
  readonly price: number;
  readonly level: CourseLevel;
  readonly category: Category;
  readonly instructor: Instructor;
}

@Entity('courses')
export class Course extends BaseEntity {
  private static readonly MAX_PRICE = 100000;

  @Column({ name: 'title', type: 'varchar', length: 140 })
  private _title!: string;

  @Column({ name: 'description', type: 'varchar', length: 500 })
  private _description!: string;

  @Column({ name: 'workload_hours', type: 'int' })
  private _workloadHours!: number;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  private _price!: number;

  @Column({ name: 'level', type: 'enum', enum: CourseLevel })
  private _level!: CourseLevel;

  @ManyToOne(() => Category, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  private _category!: Category;

  @ManyToOne(() => Instructor, { eager: true, nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'instructor_id' })
  private _instructor!: Instructor;

  constructor(props?: CourseProps) {
    super();

    if (props) {
      this.title = props.title;
      this.description = props.description;
      this.workloadHours = props.workloadHours;
      this.price = props.price;
      this.level = props.level;
      this.category = props.category;
      this.instructor = props.instructor;
    }
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get workloadHours(): number {
    return this._workloadHours;
  }

  get price(): number {
    return this._price;
  }

  get level(): CourseLevel {
    return this._level;
  }

  get category(): Category {
    return this._category;
  }

  get instructor(): Instructor {
    return this._instructor;
  }

  set title(value: string) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length < 3) {
      throw new ValidationError('O título do curso deve ter pelo menos 3 caracteres');
    }

    if (trimmed.length > 140) {
      throw new ValidationError('O título do curso deve ter no máximo 140 caracteres');
    }

    this._title = trimmed;
  }

  set description(value: string) {
    const trimmed = (value ?? '').trim();

    if (trimmed.length < 10) {
      throw new ValidationError('A descrição do curso deve ter pelo menos 10 caracteres');
    }

    if (trimmed.length > 500) {
      throw new ValidationError('A descrição do curso deve ter no máximo 500 caracteres');
    }

    this._description = trimmed;
  }

  set workloadHours(value: number) {
    if (!Number.isInteger(value) || value <= 0 || value > 2000) {
      throw new ValidationError('A carga horária deve ser um número inteiro entre 1 e 2000 horas');
    }

    this._workloadHours = value;
  }

  set price(value: number) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > Course.MAX_PRICE) {
      throw new ValidationError('O preço deve ser um número entre 0 e 100000');
    }

    this._price = value;
  }

  set level(value: CourseLevel) {
    if (!Object.values(CourseLevel).includes(value)) {
      throw new ValidationError('Nível de curso inválido');
    }

    this._level = value;
  }

  set category(value: Category) {
    if (!(value instanceof Category)) {
      throw new ValidationError('Categoria inválida');
    }

    this._category = value;
  }

  set instructor(value: Instructor) {
    if (!(value instanceof Instructor)) {
      throw new ValidationError('Instrutor inválido');
    }

    this._instructor = value;
  }
}
