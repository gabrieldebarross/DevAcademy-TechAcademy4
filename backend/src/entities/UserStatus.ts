/**
 * Situação da conta de acesso.
 *
 * PENDING  -> cadastro privilegiado aguardando aprovação de um ADMIN.
 * ACTIVE   -> conta liberada para login.
 * REJECTED -> cadastro recusado por um ADMIN.
 */
export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
}
