'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { courseService } from '@/services/courseService';
import { categoryService } from '@/services/categoryService';
import { instructorService } from '@/services/instructorService';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Category, Course, CourseLevel, Instructor } from '@/types';
import { formatCurrencyInput, parseCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { FormField } from '@/components/ui/FormField';

interface CourseFormProps {
  course?: Course;
}

const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

interface FormErrors {
  title?: string;
  description?: string;
  workloadHours?: string;
  price?: string;
  level?: string;
  categoryId?: string;
  instructorId?: string;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const isEdit = Boolean(course);

  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState({
    title: course?.title ?? '',
    description: course?.description ?? '',
    workloadHours: course ? String(course.workloadHours) : '',
    price: course ? formatCurrencyInput(course.price) : '',
    level: (course?.level ?? 'BEGINNER') as CourseLevel,
    categoryId: course?.category.id ?? '',
    instructorId: course?.instructor.id ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [categoryResponse, instructorResponse] = await Promise.all([
          categoryService.list(1, 50),
          instructorService.list(1, 50),
        ]);
        if (active) {
          setCategories(categoryResponse.data);
          setInstructors(instructorResponse.data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar categorias e instrutores.';
        toast.error(message);
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();
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
    if (!form.title.trim()) {
      nextErrors.title = 'Informe o título.';
    }
    if (!form.description.trim()) {
      nextErrors.description = 'Informe a descrição.';
    }
    const hours = Number(form.workloadHours);
    if (!form.workloadHours.trim() || Number.isNaN(hours) || hours <= 0) {
      nextErrors.workloadHours = 'Informe uma carga horária válida.';
    }
    const price = parseCurrency(form.price);
    if (Number.isNaN(price) || price < 0) {
      nextErrors.price = 'Informe um preço válido.';
    }
    if (!form.categoryId) {
      nextErrors.categoryId = 'Selecione uma categoria.';
    }
    if (!form.instructorId) {
      nextErrors.instructorId = 'Selecione um instrutor.';
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
        title: form.title.trim(),
        description: form.description.trim(),
        workloadHours: Number(form.workloadHours),
        price: parseCurrency(form.price),
        level: form.level,
        categoryId: form.categoryId,
        instructorId: form.instructorId,
      };
      if (course) {
        await courseService.update(course.id, payload);
        toast.success('Curso atualizado com sucesso!');
      } else {
        await courseService.create(payload);
        toast.success('Curso criado com sucesso!');
      }
      router.push('/courses');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar o curso.';
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
      <FormField label="Título" htmlFor="title" required error={errors.title}>
        <Input
          id="title"
          value={form.title}
          invalid={Boolean(errors.title)}
          onChange={(event) => update('title', event.target.value)}
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
          value={form.description}
          invalid={Boolean(errors.description)}
          onChange={(event) => update('description', event.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Carga horária (h)"
          htmlFor="workloadHours"
          required
          error={errors.workloadHours}
        >
          <Input
            id="workloadHours"
            type="number"
            min={1}
            value={form.workloadHours}
            invalid={Boolean(errors.workloadHours)}
            onChange={(event) => update('workloadHours', event.target.value)}
          />
        </FormField>
        <FormField label="Preço (R$)" htmlFor="price" required error={errors.price}>
          <CurrencyInput
            id="price"
            value={form.price}
            invalid={Boolean(errors.price)}
            onValueChange={(value) => update('price', value)}
          />
        </FormField>
      </div>
      <FormField label="Nível" htmlFor="level" required>
        <Select
          id="level"
          value={form.level}
          onChange={(event) => update('level', event.target.value)}
        >
          {LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Categoria"
        htmlFor="categoryId"
        required
        error={errors.categoryId}
      >
        <Select
          id="categoryId"
          value={form.categoryId}
          invalid={Boolean(errors.categoryId)}
          disabled={loadingOptions}
          onChange={(event) => update('categoryId', event.target.value)}
        >
          <option value="">Selecione...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Instrutor"
        htmlFor="instructorId"
        required
        error={errors.instructorId}
        hint={
          isAdmin
            ? undefined
            : 'Como instrutor, você mantém os seus próprios cursos.'
        }
      >
        <Select
          id="instructorId"
          value={form.instructorId}
          invalid={Boolean(errors.instructorId)}
          disabled={!isAdmin || loadingOptions}
          onChange={(event) => update('instructorId', event.target.value)}
        >
          <option value="">Selecione...</option>
          {(isAdmin
            ? instructors
            : instructors.filter((item) => item.id === course?.instructor.id)
          ).map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/courses')}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Salvar alterações' : 'Criar curso'}
        </Button>
      </div>
    </form>
  );
}
