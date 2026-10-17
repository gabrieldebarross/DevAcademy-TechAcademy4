'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/categoryService';
import { instructorService } from '@/services/instructorService';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';

interface Stat {
  label: string;
  value: number;
  href: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [categories, instructors, courses, enrollments] =
          await Promise.all([
            categoryService.list(1, 1),
            instructorService.list(1, 1),
            courseService.list(1, 1),
            enrollmentService.list(1, 1),
          ]);
        if (!active) {
          return;
        }
        setStats([
          { label: 'Categorias', value: categories.meta.total, href: '/categories' },
          { label: 'Instrutores', value: instructors.meta.total, href: '/instructors' },
          { label: 'Cursos', value: courses.meta.total, href: '/courses' },
          { label: 'Matrículas', value: enrollments.meta.total, href: '/enrollments' },
        ]);
      } catch {
        if (active) {
          setFailed(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Olá${user ? `, ${user.name}` : ''}!`}
        description="Visão geral do painel administrativo da DevAcademy."
      />

      {loading && <Spinner label="Carregando indicadores..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar os indicadores.
        </p>
      )}

      {!loading && !failed && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary-300 hover:shadow"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
