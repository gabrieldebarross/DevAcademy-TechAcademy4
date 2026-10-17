import { PageHeader } from '@/components/ui/PageHeader';
import { CategoryForm } from '../_components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Nova categoria"
        description="Cadastre uma nova categoria de cursos."
      />
      <CategoryForm />
    </div>
  );
}
