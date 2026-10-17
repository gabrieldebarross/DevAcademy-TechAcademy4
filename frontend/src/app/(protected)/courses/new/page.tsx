import { PageHeader } from '@/components/ui/PageHeader';
import { CourseForm } from '../_components/CourseForm';

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Novo curso" description="Cadastre um novo curso." />
      <CourseForm />
    </div>
  );
}
