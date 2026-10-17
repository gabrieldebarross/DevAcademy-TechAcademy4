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

const DESCRIPTIONS: Record<string, string> = {
  ADMIN: 'Visão geral do painel administrativo da DevAcademy.',
  INSTRUCTOR: 'Acompanhe os cursos que você leciona e as matrículas das suas aulas.',
  STUDENT: 'Veja os cursos disponíveis e as suas matrículas.',
};

export default function DashboardPage() {
  const { user, role, isAdmin, isInstructor } = useAuth();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!role) {
      return;
    }

    let active = true;

    async function load() {
      try {
        // Cursos e matrículas já chegam filtrados pelo perfil: o instrutor vê
        // só o que leciona e o aluno só as próprias matrículas.
        const [courses, enrollments] = await Promise.all([
          courseService.list(1, 1),
          enrollmentService.list(1, 1),
        ]);

        const nextStats: Stat[] = [];

        if (isAdmin) {
          const [categories, instructors] = await Promise.all([
            categoryService.list(1, 1),
            instructorService.list(1, 1),
          ]);
          nextStats.push(
            { label: 'Categorias', value: categories.meta.total, href: '/categories' },
            { label: 'Instrutores', value: instructors.meta.total, href: '/instructors' },
          );
        }

        nextStats.push(
          {
            label: isInstructor ? 'Meus cursos' : 'Cursos disponíveis',
            value: courses.meta.total,
            href: '/courses',
          },
          {
            label: isInstructor
              ? 'Matrículas nas minhas aulas'
              : isAdmin
                ? 'Matrículas'
                : 'Minhas matrículas',
            value: enrollments.meta.total,
            href: '/enrollments',
          },
        );

        if (active) {
          setStats(nextStats);
        }
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
  }, [role, isAdmin, isInstructor]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Olá${user ? `, ${user.name}` : ''}!`}
        description={role ? DESCRIPTIONS[role] : undefined}
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
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary-200"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 font-display text-4xl font-bold text-primary-800">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
