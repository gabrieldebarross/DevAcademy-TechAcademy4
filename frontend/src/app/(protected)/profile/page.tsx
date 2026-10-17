'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { usersService } from '@/services/usersService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import {
  isValidCpf,
  passwordPolicyMessage,
  validatePasswordStrength,
} from '@/utils/validators';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { CpfInput } from '@/components/ui/CpfInput';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormField } from '@/components/ui/FormField';

interface FormErrors {
  name?: string;
  cpf?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const profile = await usersService.getMe();
        if (!active) {
          return;
        }
        setEmail(profile.email);
        setForm((current) => ({
          ...current,
          name: profile.name,
          cpf: profile.cpf,
        }));
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar o perfil.';
        toast.error(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = 'Informe o nome.';
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
      const updated = await usersService.updateMe({
        name: form.name,
        cpf: form.cpf,
        password: form.password,
        email,
      });
      updateUser(updated);
      toast.success('Perfil atualizado com sucesso!');
      setForm((current) => ({
        ...current,
        password: '',
        confirmPassword: '',
      }));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível atualizar o perfil.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <Spinner label="Carregando perfil..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meu perfil"
        description="Atualize os seus dados de acesso."
      />

      <form
        onSubmit={handleSubmit}
        className="flex max-w-2xl flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <FormField label="E-mail" htmlFor="email" hint="O e-mail não pode ser alterado.">
          <Input id="email" value={email} disabled readOnly />
        </FormField>
        <FormField label="Nome" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            value={form.name}
            invalid={Boolean(errors.name)}
            onChange={(event) => update('name', event.target.value)}
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
            onChange={(event) => update('password', event.target.value)}
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
            onChange={(event) => update('confirmPassword', event.target.value)}
          />
        </FormField>
        <div className="flex justify-end gap-3">
          <Button type="submit" loading={submitting}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
