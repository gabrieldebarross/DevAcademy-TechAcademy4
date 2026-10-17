'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { categoryService } from '@/services/categoryService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Category, PaginationMeta } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const LIMIT = 10;

export default function CategoriesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await categoryService.list(page, LIMIT);
      setItems(response.data);
      setMeta(response.meta);
    } catch (error) {
      setFailed(true);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível carregar as categorias.';
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
      await categoryService.remove(target.id);
      toast.success('Categoria excluída com sucesso!');
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
          : 'Não foi possível excluir a categoria.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Array<Column<Category>> = [
    { key: 'name', header: 'Nome' },
    {
      key: 'description',
      header: 'Descrição',
      render: (item) => (
        <span className="line-clamp-2 max-w-md text-gray-600">
          {item.description}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Link href={`/categories/${item.id}/edit`}>
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setTarget(item)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias de cursos."
        actions={
          <Link href="/categories/new">
            <Button>Nova categoria</Button>
          </Link>
        }
      />

      {loading && <Spinner label="Carregando categorias..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar as categorias.
        </p>
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState title="Nenhuma categoria cadastrada" />
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
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${target?.name ?? ''}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
