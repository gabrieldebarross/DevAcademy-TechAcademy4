import type { CourseLevel, EnrollmentStatus, UserRole, UserStatus } from '@/types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) {
    return cpf;
  }
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Máscara progressiva usada enquanto o usuário digita: mantém no máximo 11
 * dígitos e os formata como `000.000.000-00`.
 */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Máscara progressiva de moeda (formato brasileiro) usada durante a digitação:
 * cada dígito digitado é tratado como centavo, então `1234` vira `12,34` e
 * `123456` vira `1.234,56`.
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  return formatCurrencyCents(Number.parseInt(digits, 10));
}

/**
 * Formata um valor numérico já em reais (ex.: `1200.5`) na string mascarada
 * `1.200,50`, usada para pré-preencher o campo na edição.
 */
export function formatCurrencyInput(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  return formatCurrencyCents(Math.round(value * 100));
}

/** Converte a string mascarada (`1.234,56`) de volta para número (`1234.56`). */
export function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) {
    return Number.NaN;
  }

  return Number.parseInt(digits, 10) / 100;
}

function formatCurrencyCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export function courseLevelLabel(level: CourseLevel): string {
  return COURSE_LEVEL_LABELS[level] ?? level;
}

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativa',
  SUSPENDED: 'Suspensa',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export function enrollmentStatusLabel(status: EnrollmentStatus): string {
  return ENROLLMENT_STATUS_LABELS[status] ?? status;
}

const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  INSTRUCTOR: 'Instrutor',
  STUDENT: 'Aluno',
};

export function userRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role] ?? role;
}

const USER_STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativo',
  REJECTED: 'Recusado',
};

export function userStatusLabel(status: UserStatus): string {
  return USER_STATUS_LABELS[status] ?? status;
}
