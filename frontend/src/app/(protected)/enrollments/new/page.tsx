'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { EnrollmentForm } from '../_components/EnrollmentForm';

export default function NewEnrollmentPage() {
  const { isStudent } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isStudent ? 'Solicitar matrícula' : 'Nova matrícula'}
        description={
          isStudent
            ? 'Escolha um curso para solicitar a sua matrícula.'
            : 'Matricule um aluno em um curso.'
        }
      />
      <EnrollmentForm />
    </div>
  );
}
