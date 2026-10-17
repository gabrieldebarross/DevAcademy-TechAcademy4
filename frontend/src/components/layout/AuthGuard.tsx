'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

/** Rota liberada enquanto o usuário precisa trocar a senha do primeiro acesso. */
const CHANGE_PASSWORD_PATH = '/change-password';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, restoring, mustChangePassword } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (restoring) {
      return;
    }

    if (!token) {
      router.replace('/login');
      return;
    }

    // Bloqueia a navegação até a senha base ser trocada. O backend reforça
    // isso respondendo 403 nas demais rotas.
    const onChangePasswordPage = pathname?.startsWith(CHANGE_PASSWORD_PATH);

    if (mustChangePassword && !onChangePasswordPage) {
      router.replace(CHANGE_PASSWORD_PATH);
    }
  }, [restoring, token, mustChangePassword, pathname, router]);

  const onChangePasswordPage = pathname?.startsWith(CHANGE_PASSWORD_PATH);

  if (restoring || !token || (mustChangePassword && !onChangePasswordPage)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando sessão..." />
      </div>
    );
  }

  return <>{children}</>;
}
