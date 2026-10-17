'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { categoryService } from '@/services/categoryService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { FormField } from '@/components/ui/FormField';

interface CategoryFormProps {
  category?: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: { name?: string; description?: string } = {};
    if (!name.trim()) {
      nextErrors.name = 'Informe o nome.';
    }
    if (!description.trim()) {
      nextErrors.description = 'Informe a descrição.';
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
      const payload = { name: name.trim(), description: description.trim() };
      if (category) {
        await categoryService.update(category.id, payload);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoryService.create(payload);
        toast.success('Categoria criada com sucesso!');
      }
      router.push('/categories');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a categoria.';
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
          value={name}
          invalid={Boolean(errors.name)}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Programação"
        />
      </FormField>
      <FormField
        label="Descrição"
        htmlFor="description"
        required
        error={errors.description}
      >
        <TextArea
          id="description"
          rows={4}
          value={description}
          invalid={Boolean(errors.description)}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descreva a categoria"
        />
      </FormField>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/categories')}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Salvar alterações' : 'Criar categoria'}
        </Button>
      </div>
    </form>
  );
}
