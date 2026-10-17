import { PageHeader } from '@/components/ui/PageHeader';
import { InstructorForm } from '../_components/InstructorForm';

export default function NewInstructorPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo instrutor"
        description="Cadastre um novo instrutor."
      />
      <InstructorForm />
    </div>
  );
}
