import { Router } from 'express';

import * as UserController from '../controllers/UserController';
import { UserRole } from '../entities/UserRole';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { requirePasswordChanged } from '../middlewares/requirePasswordChanged';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Toda rota abaixo exige um token válido.
router.use(ensureAuthenticated);

// Perfil do próprio usuário: sempre liberado, inclusive para trocar a senha
// base do primeiro acesso.
router.get('/me', UserController.me);
router.put('/me', UserController.updateMe);

// Daqui para baixo, é preciso já ter trocado a senha do primeiro acesso.
// Listagem de usuários (para escolher um aluno): ADMIN e INSTRUCTOR.
router.get(
  '/',
  requirePasswordChanged,
  requireRole(UserRole.ADMIN, UserRole.INSTRUCTOR),
  UserController.list,
);

// Criação de conta com senha base: exclusiva do ADMIN.
router.post('/', requirePasswordChanged, requireRole(UserRole.ADMIN), UserController.create);

// Troca de perfil de acesso: exclusiva do ADMIN.
router.patch(
  '/:id/role',
  requirePasswordChanged,
  requireRole(UserRole.ADMIN),
  UserController.changeRole,
);

// Aprovação/recusa de cadastro pendente: exclusiva do ADMIN.
router.patch(
  '/:id/status',
  requirePasswordChanged,
  requireRole(UserRole.ADMIN),
  UserController.changeStatus,
);

export default router;
