'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { enrollmentService } from '@/services/enrollmentService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Enrollment } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { EnrollmentForm } from '../../_components/EnrollmentForm';

export default function EditEnrollmentPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await enrollmentService.getById(params.id);
        if (active) {
          setEnrollment(data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar a matrícula.';
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
      <PageHeader
        title="Editar matrícula"
        description="Atualize os dados da matrícula."
      />
      {loading && <Spinner label="Carregando matrícula..." />}
      {!loading && enrollment && <EnrollmentForm enrollment={enrollment} />}
      {!loading && !enrollment && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Matrícula não encontrada.
        </p>
      )}
    </div>
  );
}
