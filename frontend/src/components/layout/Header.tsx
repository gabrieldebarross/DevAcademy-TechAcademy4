'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <Link href="/dashboard" className="text-base font-bold text-primary-700 md:hidden">
        DevAcademy
      </Link>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        {user && (
          <Link
            href="/profile"
            className="text-sm font-medium text-gray-700 hover:text-primary-700"
          >
            {user.name}
          </Link>
        )}
        <Button variant="secondary" size="sm" onClick={signOut}>
          Sair
        </Button>
      </div>
    </header>
  );
}
