'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usersService } from '@/services/usersService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { PaginationMeta, StudentSummary, UserRole, UserStatus } from '@/types';
import { userRoleLabel, userStatusLabel } from '@/utils/formatters';
import { PageHeader } from '@/components/ui/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const LIMIT = 10;
const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];

const STATUS_COLORS: Record<UserStatus, 'green' | 'orange' | 'red'> = {
  ACTIVE: 'green',
  PENDING: 'orange',
  REJECTED: 'red',
};

export default function UsersPage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <UsersContent />
    </RoleGuard>
  );
}

/** Gestão de contas, perfis e aprovações, exclusiva do ADMIN. */
function UsersContent() {
  const toast = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<StudentSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await usersService.list(page, LIMIT);
      setItems(response.data);
      setMeta(response.meta);
    } catch (error) {
      setFailed(true);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível carregar os usuários.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(target: StudentSummary, role: UserRole) {
    if (role === target.role) {
      return;
    }
    setSavingId(target.id);
    try {
      const updated = await usersService.changeRole(target.id, role);
      setItems((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, role: updated.role } : item,
        ),
      );
      toast.success(
        `Perfil de ${updated.name} agora é ${userRoleLabel(updated.role)}.`,
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível alterar o perfil de acesso.';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  async function changeStatus(target: StudentSummary, status: UserStatus) {
    setSavingId(target.id);
    try {
      const updated = await usersService.changeStatus(target.id, status);
      setItems((current) =>
        current.map((item) =>
          item.id === updated.id ? { ...item, status: updated.status } : item,
        ),
      );
      toast.success(
        status === 'ACTIVE'
          ? `Cadastro de ${updated.name} aprovado.`
          : `Cadastro de ${updated.name} recusado.`,
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível alterar a situação da conta.';
      toast.error(message);
    } finally {
      setSavingId(null);
    }
  }

  const columns: Array<Column<StudentSummary>> = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'role',
      header: 'Perfil de acesso',
      render: (item) => {
        // O próprio administrador não altera o seu perfil, para não se
        // bloquear fora do painel por engano.
        const isSelf = item.id === user?.id;
        return (
          <Select
            aria-label={`Perfil de ${item.name}`}
            value={item.role}
            disabled={isSelf || savingId === item.id}
            title={isSelf ? 'Você não pode alterar o seu próprio perfil.' : undefined}
            className="max-w-48"
            onChange={(event) => changeRole(item, event.target.value as UserRole)}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {userRoleLabel(role)}
              </option>
            ))}
          </Select>
        );
      },
    },
    {
      key: 'status',
      header: 'Situação',
      render: (item) => {
        const isSelf = item.id === user?.id;
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={STATUS_COLORS[item.status]}>{userStatusLabel(item.status)}</Badge>
            {!isSelf && item.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  loading={savingId === item.id}
                  onClick={() => changeStatus(item, 'ACTIVE')}
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={savingId === item.id}
                  onClick={() => changeStatus(item, 'REJECTED')}
                >
                  Recusar
                </Button>
              </>
            )}
            {!isSelf && item.status === 'REJECTED' && (
              <Button
                size="sm"
                variant="secondary"
                loading={savingId === item.id}
                onClick={() => changeStatus(item, 'ACTIVE')}
              >
                Reaprovar
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Defina o perfil de acesso e aprove cadastros pendentes."
        help="Exclusivo do ADMIN. Você pode criar contas com uma senha base (troca obrigatória no 1º acesso), trocar perfis e aprovar ou recusar cadastros de INSTRUCTOR/ADMIN."
        actions={
          <Link href="/users/new">
            <Button>Novo usuário</Button>
          </Link>
        }
      />

      {loading && <Spinner label="Carregando usuários..." />}

      {!loading && failed && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível carregar os usuários.
        </p>
      )}

      {!loading && !failed && items.length === 0 && (
        <EmptyState title="Nenhum usuário cadastrado" />
      )}

      {!loading && !failed && items.length > 0 && (
        <>
          <Table columns={columns} data={items} keyExtractor={(item) => item.id} />
          {meta && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
