import { PageHeader } from '@/components/ui/PageHeader';
import { EnrollmentForm } from '../_components/EnrollmentForm';

export default function NewEnrollmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova matrícula"
        description="Matricule um aluno em um curso."
      />
      <EnrollmentForm />
    </div>
  );
}
