'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { token, restoring } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!restoring && !token) {
      router.replace('/login');
    }
  }, [restoring, token, router]);

  if (restoring || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Verificando sessão..." />
      </div>
    );
  }

  return <>{children}</>;
}
