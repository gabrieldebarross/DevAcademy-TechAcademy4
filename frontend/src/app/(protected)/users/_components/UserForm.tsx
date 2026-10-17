'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import {
  isValidCpf,
  isValidEmail,
  passwordPolicyMessage,
  validatePasswordStrength,
} from '@/utils/validators';
import type { UserRole } from '@/types';
import { userRoleLabel } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { CpfInput } from '@/components/ui/CpfInput';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';

const ROLE_OPTIONS: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

interface FormErrors {
  name?: string;
  email?: string;
  cpf?: string;
  password?: string;
}

/**
 * Criação de conta pelo ADMIN. A conta nasce ativa com uma senha base, e o
 * usuário é obrigado a trocá-la no primeiro acesso.
 */
export function UserForm() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'STUDENT' as UserRole,
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Informe o nome.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Informe o e-mail.';
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = 'Informe um e-mail válido.';
    }
    if (!form.cpf.trim()) {
      nextErrors.cpf = 'Informe o CPF.';
    } else if (!isValidCpf(form.cpf)) {
      nextErrors.cpf = 'Informe um CPF válido.';
    }

    const strength = validatePasswordStrength(form.password);
    if (!form.password) {
      nextErrors.password = 'Informe a senha base.';
    } else if (!strength.valid) {
      nextErrors.password = passwordPolicyMessage(strength.failures);
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await usersService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        password: form.password,
        role: form.role,
      });
      toast.success('Conta criada! O usuário deverá trocar a senha no primeiro acesso.');
      router.push('/users');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível criar a conta.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-2xl flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      noValidate
    >
      <FormField label="Nome" htmlFor="name" required error={errors.name}>
        <Input
          id="name"
          value={form.name}
          invalid={Boolean(errors.name)}
          onChange={(event) => update('name', event.target.value)}
        />
      </FormField>
      <FormField label="E-mail" htmlFor="email" required error={errors.email}>
        <Input
          id="email"
          type="email"
          value={form.email}
          invalid={Boolean(errors.email)}
          onChange={(event) => update('email', event.target.value)}
        />
      </FormField>
      <FormField label="CPF" htmlFor="cpf" required error={errors.cpf}>
        <CpfInput
          id="cpf"
          value={form.cpf}
          invalid={Boolean(errors.cpf)}
          onValueChange={(value) => update('cpf', value)}
        />
      </FormField>
      <FormField
        label="Perfil de acesso"
        htmlFor="role"
        required
        hint={
          form.role === 'INSTRUCTOR'
            ? 'Também cria o cadastro de instrutor (complete especialidade e bio em Instrutores).'
            : undefined
        }
      >
        <Select
          id="role"
          value={form.role}
          onChange={(event) => update('role', event.target.value as UserRole)}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {userRoleLabel(role)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Senha base"
        htmlFor="password"
        required
        error={errors.password}
        hint="O usuário deverá trocar esta senha no primeiro acesso."
      >
        <PasswordInput
          id="password"
          value={form.password}
          invalid={Boolean(errors.password)}
          onChange={(event) => update('password', event.target.value)}
        />
      </FormField>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/users')}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Criar conta
        </Button>
      </div>
    </form>
  );
}
