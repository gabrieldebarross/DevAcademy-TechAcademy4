'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { instructorService } from '@/services/instructorService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { isValidCpf, isValidEmail } from '@/utils/validators';
import type { Instructor } from '@/types';
import { Button } from '@/components/ui/Button';
import { CpfInput } from '@/components/ui/CpfInput';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { FormField } from '@/components/ui/FormField';

interface InstructorFormProps {
  instructor?: Instructor;
}

interface FormErrors {
  name?: string;
  email?: string;
  cpf?: string;
  specialty?: string;
  bio?: string;
}

export function InstructorForm({ instructor }: InstructorFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(instructor);

  const [form, setForm] = useState({
    name: instructor?.name ?? '',
    email: instructor?.email ?? '',
    cpf: instructor?.cpf ?? '',
    specialty: instructor?.specialty ?? '',
    bio: instructor?.bio ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
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
    if (!form.specialty.trim()) {
      nextErrors.specialty = 'Informe a especialidade.';
    }
    if (!form.bio.trim()) {
      nextErrors.bio = 'Informe a biografia.';
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
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        specialty: form.specialty.trim(),
        bio: form.bio.trim(),
      };
      if (instructor) {
        await instructorService.update(instructor.id, payload);
        toast.success('Instrutor atualizado com sucesso!');
      } else {
        await instructorService.create(payload);
        toast.success('Instrutor criado com sucesso!');
      }
      router.push('/instructors');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar o instrutor.';
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
        label="Especialidade"
        htmlFor="specialty"
        required
        error={errors.specialty}
      >
        <Input
          id="specialty"
          value={form.specialty}
          invalid={Boolean(errors.specialty)}
          onChange={(event) => update('specialty', event.target.value)}
          placeholder="Ex.: React e Node.js"
        />
      </FormField>
      <FormField label="Biografia" htmlFor="bio" required error={errors.bio}>
        <TextArea
          id="bio"
          rows={4}
          value={form.bio}
          invalid={Boolean(errors.bio)}
          onChange={(event) => update('bio', event.target.value)}
        />
      </FormField>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/instructors')}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Salvar alterações' : 'Criar instrutor'}
        </Button>
      </div>
    </form>
  );
}
