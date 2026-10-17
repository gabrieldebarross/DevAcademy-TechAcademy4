'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { usersService } from '@/services/usersService';
import { ApiError } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { Course, Enrollment, EnrollmentStatus, StudentSummary } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';

interface EnrollmentFormProps {
  enrollment?: Enrollment;
}

const STATUS_OPTIONS: Array<{ value: EnrollmentStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'SUSPENDED', label: 'Suspensa' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'CANCELLED', label: 'Cancelada' },
];

interface FormErrors {
  studentId?: string;
  courseId?: string;
  status?: string;
}

export function EnrollmentForm({ enrollment }: EnrollmentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(enrollment);

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState({
    studentId: enrollment?.student.id ?? '',
    courseId: enrollment?.course.id ?? '',
    status: (enrollment?.status ?? 'ACTIVE') as EnrollmentStatus,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const [userResponse, courseResponse] = await Promise.all([
          usersService.list(1, 50),
          courseService.list(1, 50),
        ]);
        if (active) {
          setStudents(userResponse.data);
          setCourses(courseResponse.data);
        }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar alunos e cursos.';
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
    if (!form.studentId) {
      nextErrors.studentId = 'Selecione um aluno.';
    }
    if (!form.courseId) {
      nextErrors.courseId = 'Selecione um curso.';
    }
    if (!form.status) {
      nextErrors.status = 'Selecione um status.';
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
        studentId: form.studentId,
        courseId: form.courseId,
        status: form.status,
      };
      if (enrollment) {
        await enrollmentService.update(enrollment.id, payload);
        toast.success('Matrícula atualizada com sucesso!');
      } else {
        await enrollmentService.create(payload);
        toast.success('Matrícula criada com sucesso!');
      }
      router.push('/enrollments');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a matrícula.';
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
      <FormField
        label="Aluno"
        htmlFor="studentId"
        required
        error={errors.studentId}
      >
        <Select
          id="studentId"
          value={form.studentId}
          invalid={Boolean(errors.studentId)}
          disabled={loadingOptions}
          onChange={(event) => update('studentId', event.target.value)}
        >
          <option value="">Selecione...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.email})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Curso"
        htmlFor="courseId"
        required
        error={errors.courseId}
      >
        <Select
          id="courseId"
          value={form.courseId}
          invalid={Boolean(errors.courseId)}
          disabled={loadingOptions}
          onChange={(event) => update('courseId', event.target.value)}
        >
          <option value="">Selecione...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Status" htmlFor="status" required error={errors.status}>
        <Select
          id="status"
          value={form.status}
          invalid={Boolean(errors.status)}
          onChange={(event) => update('status', event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/enrollments')}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Salvar alterações' : 'Criar matrícula'}
        </Button>
      </div>
    </form>
  );
}
