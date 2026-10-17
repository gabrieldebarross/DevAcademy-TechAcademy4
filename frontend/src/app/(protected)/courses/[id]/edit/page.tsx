'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Course } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { CourseForm } from '../../_components/CourseForm';

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await courseService.getById(params.id);
        if (active) {
          setCourse(data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar o curso.';
        toast.error(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      load();
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar curso" description="Atualize os dados do curso." />
      {loading && <Spinner label="Carregando curso..." />}
      {!loading && course && <CourseForm course={course} />}
      {!loading && !course && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Curso não encontrado.
        </p>
      )}
    </div>
  );
}
