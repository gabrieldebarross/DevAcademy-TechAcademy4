'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { instructorService } from '@/services/instructorService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Instructor } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { InstructorForm } from '../../_components/InstructorForm';

export default function EditInstructorPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await instructorService.getById(params.id);
        if (active) {
          setInstructor(data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar o instrutor.';
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
    <RoleGuard allow={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Editar instrutor"
          description="Atualize os dados do instrutor."
        />
        {loading && <Spinner label="Carregando instrutor..." />}
        {!loading && instructor && <InstructorForm instructor={instructor} />}
        {!loading && !instructor && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Instrutor não encontrado.
          </p>
        )}
      </div>
    </RoleGuard>
  );
}
