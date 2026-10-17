import { PageHeader } from '@/components/ui/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { CategoryForm } from '../_components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Nova categoria"
          description="Cadastre uma nova categoria de cursos."
        />
        <CategoryForm />
      </div>
    </RoleGuard>
  );
}
