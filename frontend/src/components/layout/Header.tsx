'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { userRoleLabel } from '@/utils/formatters';
import type { UserRole } from '@/types';

const ROLE_COLORS: Record<UserRole, 'blue' | 'green' | 'gray'> = {
  ADMIN: 'blue',
  INSTRUCTOR: 'green',
  STUDENT: 'gray',
};

/** Iniciais do nome, usadas como avatar textual. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part.charAt(0).toUpperCase()).join('');
  return letters || '?';
}

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 font-display text-xs font-bold text-white">
          DA
        </span>
        <span className="font-display text-base font-bold text-gray-900">
          DevAcademy
        </span>
      </Link>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <Badge color={ROLE_COLORS[user.role]}>
              {userRoleLabel(user.role)}
            </Badge>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition hover:bg-gray-100 sm:pr-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700 text-xs font-semibold text-white">
                {initials(user.name)}
              </span>
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                {user.name}
              </span>
            </Link>
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={signOut}>
          Sair
        </Button>
      </div>
    </header>
  );
}
