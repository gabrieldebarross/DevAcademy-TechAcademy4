'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/categories', label: 'Categorias' },
  { href: '/instructors', label: 'Instrutores' },
  { href: '/courses', label: 'Cursos' },
  { href: '/enrollments', label: 'Matrículas' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-lg font-bold text-primary-700">
          DevAcademy
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 px-3 py-3">
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          Documentação da API
        </a>
      </div>
      <div className="border-t border-gray-200 px-6 py-4 text-xs text-gray-400">
        Painel administrativo
      </div>
    </aside>
  );
}
