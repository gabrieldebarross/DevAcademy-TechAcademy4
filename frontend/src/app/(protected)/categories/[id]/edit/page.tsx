'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { categoryService } from '@/services/categoryService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Category } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { CategoryForm } from '../../_components/CategoryForm';

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await categoryService.getById(params.id);
        if (active) {
          setCategory(data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar a categoria.';
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
          title="Editar categoria"
          description="Atualize os dados da categoria."
        />
        {loading && <Spinner label="Carregando categoria..." />}
        {!loading && category && <CategoryForm category={category} />}
        {!loading && !category && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            Categoria não encontrada.
          </p>
        )}
      </div>
    </RoleGuard>
  );
}
