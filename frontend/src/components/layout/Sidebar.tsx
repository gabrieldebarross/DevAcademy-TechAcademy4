'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userRoleLabel } from '@/utils/formatters';
import type { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  roles: UserRole[];
  studentLabel?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    href: '/categories',
    label: 'Categorias',
    roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    href: '/instructors',
    label: 'Instrutores',
    roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    href: '/courses',
    label: 'Cursos',
    roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  {
    href: '/enrollments',
    label: 'Matrículas',
    roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
    studentLabel: 'Minhas matrículas',
  },
  // A gestão de perfis é exclusiva do administrador.
  { href: '/users', label: 'Usuários', roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasRole, isStudent, role } = useAuth();

  const items = NAV_ITEMS.filter((item) => hasRole(...item.roles));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 font-display text-sm font-bold text-white">
          DA
        </span>
        <Link
          href="/dashboard"
          className="font-display text-lg font-bold text-gray-900"
        >
          DevAcademy
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-primary-50 text-primary-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {active && (
                <span
                  className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary-700"
                  aria-hidden="true"
                />
              )}
              {isStudent && item.studentLabel ? item.studentLabel : item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 px-3 py-3">
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          Documentação da API
        </a>
      </div>
      <div className="flex items-center gap-2 border-t border-gray-100 px-6 py-4 text-xs text-gray-400">
        <span>Perfil:</span>
        <span className="font-medium text-gray-500">
          {role ? userRoleLabel(role) : 'Painel administrativo'}
        </span>
      </div>
    </aside>
  );
}
