'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import {
  isValidCpf,
  isValidEmail,
  passwordPolicyMessage,
  validatePasswordStrength,
} from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { CpfInput } from '@/components/ui/CpfInput';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { userRoleLabel } from '@/utils/formatters';
import type { UserRole } from '@/types';

interface FormErrors {
  name?: string;
  email?: string;
  cpf?: string;
  password?: string;
  confirmPassword?: string;
}

const ROLE_OPTIONS: UserRole[] = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'STUDENT' as UserRole,
    password: '',
    confirmPassword: '',
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
      nextErrors.password = 'Informe a senha.';
    } else if (!strength.valid) {
      nextErrors.password = passwordPolicyMessage(strength.failures);
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'As senhas não coincidem.';
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
      await authService.register({
        name: form.name,
        email: form.email,
        cpf: form.cpf,
        password: form.password,
        role: form.role,
      });

      // Perfis privilegiados não entram direto: aguardam aprovação do ADMIN.
      if (form.role === 'STUDENT') {
        toast.success('Cadastro realizado com sucesso! Faça login.');
      } else {
        toast.success(
          'Cadastro enviado! Aguarde a aprovação de um administrador para entrar.',
        );
      }

      router.push('/login');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível cadastrar. Tente novamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50 px-4 py-10">
      <div className="w-full max-w-md animate-slide-up rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-700 font-display text-lg font-bold text-white">
            DA
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">
            DevAcademy
          </h1>
          <p className="mt-1 text-sm text-gray-500">Crie a sua conta</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Nome" htmlFor="name" required error={errors.name}>
            <Input
              id="name"
              value={form.name}
              invalid={Boolean(errors.name)}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Seu nome completo"
            />
          </FormField>
          <FormField label="E-mail" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              type="email"
              value={form.email}
              invalid={Boolean(errors.email)}
              onChange={(event) => update('email', event.target.value)}
              placeholder="voce@devacademy.com"
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
            label="Perfil desejado"
            htmlFor="role"
            required
            hint="Aluno entra direto. Instrutor e administrador dependem de aprovação."
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
            label="Senha"
            htmlFor="password"
            required
            error={errors.password}
            hint="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo."
          >
            <PasswordInput
              id="password"
              value={form.password}
              invalid={Boolean(errors.password)}
              onChange={(event) => update('password', event.target.value)}
            />
          </FormField>
          <FormField
            label="Confirmar senha"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              value={form.confirmPassword}
              invalid={Boolean(errors.confirmPassword)}
              onChange={(event) => update('confirmPassword', event.target.value)}
            />
          </FormField>
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Cadastrar
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-primary-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
