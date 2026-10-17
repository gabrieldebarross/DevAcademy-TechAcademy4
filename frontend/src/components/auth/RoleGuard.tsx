'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
}

/**
 * Protege uma tela por perfil de acesso.
 *
 * É uma barreira de experiência: o usuário nem chega ao formulário. A
 * autorização de verdade continua no backend, que responde 403.
 */
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { role, restoring } = useAuth();

  if (restoring) {
    return <Spinner label="Verificando permissões..." />;
  }

  if (!role || !allow.includes(role)) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <div>
          <h2 className="text-lg font-semibold text-amber-900">Acesso restrito</h2>
          <p className="mt-1 text-sm text-amber-800">
            Seu perfil não tem permissão para acessar esta tela.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm">
            Voltar ao dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
