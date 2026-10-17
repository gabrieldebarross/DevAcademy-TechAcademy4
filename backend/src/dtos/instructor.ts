import { Instructor } from '../entities/Instructor';

export interface InstructorInput {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly specialty: string;
  readonly bio?: string | null;
}

export interface InstructorResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly specialty: string;
  readonly bio: string | null;
  readonly role: string;
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
