import { CourseRepository } from '../repositories/CourseRepository';
import { InstructorRepository } from '../repositories/InstructorRepository';
import { UserRepository } from '../repositories/UserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { InstructorService } from '../services/InstructorService';

/**
 * Reconcilia os cadastros de instrutor com as contas de acesso na inicialização.
 *
 * Garante que toda conta ativa com perfil INSTRUCTOR tenha o cadastro de
 * instrutor correspondente — inclusive contas criadas antes de a sincronização
 * automática existir. Cadastros já existentes não são sobrescritos: apenas o
 * nome é mantido em sincronia.
 */
export async function reconcileInstructorProfiles(): Promise<void> {
  const users = new UserRepository();
  const service = new InstructorService(
    new InstructorRepository(),
    new CourseRepository(),
    users,
    new BcryptPasswordHasher(),
  );

  const instructors = await users.findActiveInstructors();

  for (const user of instructors) {
    try {
      await service.syncProfileForUser(user);
    } catch (error) {
      // Uma falha isolada não deve impedir a API de subir.
      console.error(`Falha ao reconciliar o instrutor ${user.email}:`, error);
    }
  }
}
