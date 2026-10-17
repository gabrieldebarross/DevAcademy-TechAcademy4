'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { instructorService } from '@/services/instructorService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Instructor, PaginationMeta } from '@/types';
import { formatCpf } from '@/utils/formatters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const LIMIT = 10;

export default function InstructorsPage() {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Instructor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<Instructor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await instructorService.list(page, LIMIT);
      setItems(response.data);
      setMeta(response.meta);
    } catch (error) {
      setFailed(true);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível carregar os instrutores.';
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
      await instructorService.remove(target.id);
      toast.success('Instrutor excluído com sucesso!');
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
          : 'Não foi possível excluir o instrutor.';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  const columns: Array<Column<Instructor>> = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
  ];

  // O CPF é dado pessoal: só o ADMIN o enxerga.
  if (isAdmin) {
    columns.push({
      key: 'cpf',
      header: 'CPF',
      render: (item) => formatCpf(item.cpf ?? ''),
    });
  }

  columns.push({ key: 'specialty', header: 'Especialidade' });

  // As ações de escrita só aparecem para quem tem permissão (RBAC).
  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Link href={`/instructors/${item.id}/edit`}>
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
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Instrutores"
        description={
          isAdmin ? 'Gerencie os instrutores da escola.' : 'Instrutores da escola.'
        }
        help="Todos os perfis leem os instrutores, e o CPF só é exibido ao ADMIN. Criar/editar/excluir é exclusivo do ADMIN. Criar um instrutor cria a conta de acesso, e um usuário com perfil INSTRUCTOR também aparece aqui (complete especialidade/bio na edição)."
        actions={
          isAdmin ? (
            <Link href="/instructors/new">
              <Button>Novo instrutor</Button>
            </Link>
          ) : undefined
        }
      />

      {loading && <Spinner label="Carregando instrutores..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar os instrutores.
        </p>
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState title="Nenhum instrutor cadastrado" />
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
        title="Excluir instrutor"
        message={`Tem certeza que deseja excluir "${target?.name ?? ''}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
