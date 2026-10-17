import { PageHeader } from '@/components/ui/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { InstructorForm } from '../_components/InstructorForm';

export default function NewInstructorPage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Novo instrutor"
          description="Cadastre um instrutor e crie a conta de acesso dele (perfil INSTRUCTOR)."
        />
        <InstructorForm />
      </div>
    </RoleGuard>
  );
}
