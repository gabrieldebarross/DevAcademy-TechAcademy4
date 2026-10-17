import { PageHeader } from '@/components/ui/PageHeader';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserForm } from '../_components/UserForm';

export default function NewUserPage() {
  return (
    <RoleGuard allow={['ADMIN']}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Nova conta"
          description="Crie uma conta com perfil e senha base. O usuário trocará a senha no primeiro acesso."
        />
        <UserForm />
      </div>
    </RoleGuard>
  );
}
