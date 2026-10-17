'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface CanProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza os filhos apenas quando o perfil do usuário está na lista.
 * Uso: `<Can roles={['ADMIN']}><Button>Nova categoria</Button></Can>`.
 */
export function Can({ roles, children, fallback = null }: CanProps) {
  const { hasRole } = useAuth();

  return <>{hasRole(...roles) ? children : fallback}</>;
}
