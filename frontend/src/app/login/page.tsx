'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { isValidEmail } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormField } from '@/components/ui/FormField';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = 'Informe o e-mail.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Informe um e-mail válido.';
    }
    if (!password) {
      nextErrors.password = 'Informe a senha.';
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
      const { token, user } = await authService.login({ email, password });
      signIn(token, user);
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível entrar. Tente novamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-primary-700">DevAcademy</h1>
          <p className="mt-1 text-sm text-gray-500">
            Acesse o painel administrativo
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="E-mail" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              invalid={Boolean(errors.email)}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@devacademy.com"
            />
          </FormField>
          <FormField
            label="Senha"
            htmlFor="password"
            required
            error={errors.password}
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(errors.password)}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
            />
          </FormField>
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Entrar
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-medium text-primary-700 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
