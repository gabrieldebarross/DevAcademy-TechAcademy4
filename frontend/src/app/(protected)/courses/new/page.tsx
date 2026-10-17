import { PageHeader } from '@/components/ui/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { CourseForm } from '../_components/CourseForm';

export default function NewCoursePage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <PageHeader title="Novo curso" description="Cadastre um novo curso." />
        <CourseForm />
      </div>
    </RoleGuard>
  );
}
