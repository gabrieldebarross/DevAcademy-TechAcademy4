'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Course, PaginationMeta } from '@/types';
import { courseLevelLabel, formatCurrency } from '@/utils/formatters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const LIMIT = 10;

export default function CoursesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await courseService.list(page, LIMIT);
      setItems(response.data);
      setMeta(response.meta);
    } catch (error) {
      setFailed(true);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível carregar os cursos.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!target) {
      return;
    }
    setDeleting(true);
    try {
      await courseService.remove(target.id);
      toast.success('Curso excluído com sucesso!');
      setTarget(null);
      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        load();
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível excluir o curso.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Array<Column<Course>> = [
    { key: 'title', header: 'Título' },
    { key: 'category', header: 'Categoria', render: (item) => item.category.name },
    {
      key: 'instructor',
      header: 'Instrutor',
      render: (item) => item.instructor.name,
    },
    {
      key: 'level',
      header: 'Nível',
      render: (item) => <Badge color="blue">{courseLevelLabel(item.level)}</Badge>,
    },
    {
      key: 'price',
      header: 'Preço',
      render: (item) => formatCurrency(item.price),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Link href={`/courses/${item.id}/edit`}>
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setTarget(item)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cursos"
        description="Gerencie os cursos disponíveis."
        actions={
          <Link href="/courses/new">
            <Button>Novo curso</Button>
          </Link>
        }
      />

      {loading && <Spinner label="Carregando cursos..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar os cursos.
        </p>
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState title="Nenhum curso cadastrado" />
      )}

      {!loading && !failed && items.length > 0 && (
        <>
          <Table
            columns={columns}
            data={items}
            keyExtractor={(item) => item.id}
          />
          {meta && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Excluir curso"
        message={`Tem certeza que deseja excluir "${target?.title ?? ''}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
