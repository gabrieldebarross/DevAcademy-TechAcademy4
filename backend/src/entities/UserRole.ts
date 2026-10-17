/**
 * Perfis de acesso do sistema (RBAC).
 *
 * ADMIN      -> administra todos os recursos.
 * INSTRUCTOR -> gerencia os próprios cursos e as matrículas das suas aulas.
 * STUDENT    -> consulta cursos e vê apenas as próprias matrículas.
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}
