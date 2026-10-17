'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { enrollmentService } from '@/services/enrollmentService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Enrollment, EnrollmentStatus, PaginationMeta } from '@/types';
import {
  enrollmentStatusLabel,
  formatCurrency,
  formatDate,
} from '@/utils/formatters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const LIMIT = 10;

const STATUS_COLORS: Record<
  EnrollmentStatus,
  'green' | 'yellow' | 'blue' | 'red'
> = {
  ACTIVE: 'green',
  SUSPENDED: 'yellow',
  COMPLETED: 'blue',
  CANCELLED: 'red',
};

export default function EnrollmentsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await enrollmentService.list(page, LIMIT);
      setItems(response.data);
      setMeta(response.meta);
    } catch (error) {
      setFailed(true);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível carregar as matrículas.';
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
      await enrollmentService.remove(target.id);
      toast.success('Matrícula excluída com sucesso!');
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
          : 'Não foi possível excluir a matrícula.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Array<Column<Enrollment>> = [
    { key: 'student', header: 'Aluno', render: (item) => item.student.name },
    { key: 'course', header: 'Curso', render: (item) => item.course.title },
    {
      key: 'price',
      header: 'Valor',
      render: (item) => formatCurrency(item.course.price),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge color={STATUS_COLORS[item.status]}>
          {enrollmentStatusLabel(item.status)}
        </Badge>
      ),
    },
    {
      key: 'enrolledAt',
      header: 'Matriculado em',
      render: (item) => formatDate(item.enrolledAt),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Link href={`/enrollments/${item.id}/edit`}>
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
        title="Matrículas"
        description="Gerencie as matrículas dos alunos."
        actions={
          <Link href="/enrollments/new">
            <Button>Nova matrícula</Button>
          </Link>
        }
      />

      {loading && <Spinner label="Carregando matrículas..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar as matrículas.
        </p>
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState title="Nenhuma matrícula cadastrada" />
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
        title="Excluir matrícula"
        message={`Tem certeza que deseja excluir a matrícula de "${target?.student.name ?? ''}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
