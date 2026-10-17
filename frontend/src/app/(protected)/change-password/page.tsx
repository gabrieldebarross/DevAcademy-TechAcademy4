'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/usersService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { passwordPolicyMessage, validatePasswordStrength } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

/**
 * Troca de senha obrigatória do primeiro acesso.
 *
 * A conta criada pelo ADMIN nasce com uma senha base; enquanto ela não for
 * trocada, o backend responde 403 nas demais rotas e o AuthGuard redireciona
 * para cá.
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const { updateUser } = useAuth();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    const strength = validatePasswordStrength(form.password);

    if (!form.password) {
      nextErrors.password = 'Informe a nova senha.';
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
      const updated = await usersService.updateMe({ password: form.password });
      updateUser(updated);
      toast.success('Senha alterada com sucesso!');
      router.replace('/dashboard');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível alterar a senha. Tente novamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="animate-slide-up rounded-3xl border border-gray-200 bg-white p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Troque a sua senha
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Esta é a sua primeira entrada. Por segurança, defina uma nova senha antes de
          continuar usando o sistema.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <FormField
            label="Nova senha"
            htmlFor="password"
            required
            error={errors.password}
            hint="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo."
          >
            <PasswordInput
              id="password"
              value={form.password}
              invalid={Boolean(errors.password)}
              onChange={(event) => setForm((c) => ({ ...c, password: event.target.value }))}
            />
          </FormField>
          <FormField
            label="Confirmar nova senha"
            htmlFor="confirmPassword"
            required
            error={errors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              value={form.confirmPassword}
              invalid={Boolean(errors.confirmPassword)}
              onChange={(event) =>
                setForm((c) => ({ ...c, confirmPassword: event.target.value }))
              }
            />
          </FormField>
          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Salvar nova senha
          </Button>
        </form>
      </div>
    </div>
  );
}
