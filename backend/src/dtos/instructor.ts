import { Instructor } from '../entities/Instructor';
import { UserRole } from '../entities/UserRole';

export interface InstructorInput {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly specialty: string;
  readonly bio?: string | null;
  /**
   * Senha base da conta de acesso criada junto com o instrutor.
   * Obrigatória na criação; ignorada na edição.
   */
  readonly password?: string;
}

export interface InstructorResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly specialty: string;
  readonly bio: string | null;
  readonly role: UserRole;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toInstructorResponse(instructor: Instructor): InstructorResponse {
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    cpf: instructor.cpf,
    specialty: instructor.specialty,
    bio: instructor.bio,
    role: instructor.role,
    createdAt: instructor.createdAt.toISOString(),
    updatedAt: instructor.updatedAt.toISOString(),
  };
}

/**
 * Representação pública do instrutor, sem o CPF.
 *
 * O CPF é dado pessoal: apenas o ADMIN, que administra os cadastros, recebe
 * esse campo. Os demais perfis (inclusive o aluno) usam este resumo.
 */
export interface InstructorSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly specialty: string;
  readonly bio: string | null;
  readonly role: UserRole;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function toInstructorSummary(instructor: Instructor): InstructorSummary {
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    specialty: instructor.specialty,
    bio: instructor.bio,
    role: instructor.role,
    createdAt: instructor.createdAt.toISOString(),
    updatedAt: instructor.updatedAt.toISOString(),
  };
}
