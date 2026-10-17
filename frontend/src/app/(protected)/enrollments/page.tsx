'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { enrollmentService } from '@/services/enrollmentService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
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

type StatusColor = 'green' | 'yellow' | 'orange' | 'blue' | 'red' | 'gray';

const STATUS_COLORS: Record<EnrollmentStatus, StatusColor> = {
  PENDING: 'orange',
  ACTIVE: 'green',
  SUSPENDED: 'yellow',
  COMPLETED: 'blue',
  CANCELLED: 'gray',
};

export default function EnrollmentsPage() {
  const toast = useToast();
  const { isAdmin, isInstructor, isStudent } = useAuth();
  // ADMIN e INSTRUCTOR criam e aprovam; o aluno solicita e acompanha as suas.
  const canWrite = isAdmin || isInstructor;

  const [items, setItems] = useState<Enrollment[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

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

  /** Aprova uma solicitação pendente, promovendo-a para ACTIVE. */
  async function approve(item: Enrollment) {
    setApprovingId(item.id);
    try {
      await enrollmentService.update(item.id, {
        studentId: item.student.id,
        courseId: item.course.id,
        status: 'ACTIVE',
      });
      toast.success('Matrícula aprovada!');
      load();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível aprovar a matrícula.';
      toast.error(message);
    } finally {
      setApprovingId(null);
    }
  }

  async function confirmDelete() {
    if (!target) {
      return;
    }
    setDeleting(true);
    try {
      await enrollmentService.remove(target.id);
      toast.success(
        isStudent ? 'Solicitação cancelada.' : 'Matrícula excluída com sucesso!',
      );
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
          : 'Não foi possível concluir a ação.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Array<Column<Enrollment>> = [];

  // O aluno só enxerga as próprias matrículas, então a coluna é redundante.
  if (!isStudent) {
    columns.push({
      key: 'student',
      header: 'Aluno',
      render: (item) => item.student.name,
    });
  }

  columns.push(
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
      header: 'Solicitado em',
      render: (item) => formatDate(item.enrolledAt),
    },
  );

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: 'Ações',
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          {item.status === 'PENDING' && (
            <Button
              size="sm"
              loading={approvingId === item.id}
              onClick={() => approve(item)}
            >
              Aprovar
            </Button>
          )}
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
    });
  } else if (isStudent) {
    columns.push({
      key: 'actions',
      header: 'Ações',
      render: (item) =>
        item.status === 'PENDING' ? (
          <Button variant="danger" size="sm" onClick={() => setTarget(item)}>
            Cancelar solicitação
          </Button>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isStudent ? 'Minhas matrículas' : 'Matrículas'}
        description={
          isAdmin
            ? 'Gerencie as matrículas e aprove as solicitações dos alunos.'
            : isInstructor
              ? 'Aprove as solicitações e gerencie as matrículas das suas aulas.'
              : 'Acompanhe o status das suas solicitações e matrículas.'
        }
        help="O aluno solicita a própria matrícula (nasce Pendente) e pode cancelá-la enquanto pendente. ADMIN e INSTRUCTOR aprovam; o INSTRUCTOR só gerencia as matrículas das suas aulas."
        actions={
          canWrite || isStudent ? (
            <Link href="/enrollments/new">
              <Button>
                {isStudent ? 'Solicitar matrícula' : 'Nova matrícula'}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {loading && <Spinner label="Carregando matrículas..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar as matrículas.
        </p>
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState
          title={isStudent ? 'Você ainda não tem matrículas' : 'Nenhuma matrícula cadastrada'}
          description={
            isStudent
              ? 'Solicite a sua matrícula em um curso disponível.'
              : 'Comece cadastrando uma nova matrícula.'
          }
        />
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
        title={isStudent ? 'Cancelar solicitação' : 'Excluir matrícula'}
        message={
          isStudent
            ? `Deseja cancelar a sua solicitação de matrícula em "${target?.course.title ?? ''}"?`
            : `Tem certeza que deseja excluir a matrícula de "${target?.student.name ?? ''}"? Esta ação não pode ser desfeita.`
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
