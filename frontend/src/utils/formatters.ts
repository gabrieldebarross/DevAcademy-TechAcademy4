import type { CourseLevel, EnrollmentStatus } from '@/types';

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
 * Progressive mask used while the user types: keeps at most 11 digits and
 * formats them as `000.000.000-00`.
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
 * Progressive currency mask (Brazilian format) used while typing: every typed
 * digit is treated as a cent, so `1234` becomes `12,34` and `123456` becomes
 * `1.234,56`.
 */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  return formatCurrencyCents(Number.parseInt(digits, 10));
}

/**
 * Formats a numeric value already in reais (e.g. `1200.5`) into the masked
 * string `1.200,50`, used to pre-fill the field when editing.
 */
export function formatCurrencyInput(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  return formatCurrencyCents(Math.round(value * 100));
}

/** Parses the masked string (`1.234,56`) back to a number (`1234.56`). */
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
  ACTIVE: 'Ativa',
  SUSPENDED: 'Suspensa',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

export function enrollmentStatusLabel(status: EnrollmentStatus): string {
  return ENROLLMENT_STATUS_LABELS[status] ?? status;
}
