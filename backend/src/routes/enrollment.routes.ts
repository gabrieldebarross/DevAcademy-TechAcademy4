import { Router } from 'express';

import * as EnrollmentController from '../controllers/EnrollmentController';
import { UserRole } from '../entities/UserRole';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { requirePasswordChanged } from '../middlewares/requirePasswordChanged';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.use(ensureAuthenticated, requirePasswordChanged);

// Leitura: ADMIN vê todas, INSTRUCTOR as das suas aulas e STUDENT as próprias
// (o filtro por perfil é aplicado no serviço).
router.get('/', EnrollmentController.list);
router.get('/:id', EnrollmentController.show);

// O aluno solicita a própria matrícula (nasce PENDING); ADMIN e INSTRUCTOR
// criam matrículas e as aprovam alterando o status.
router.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
  EnrollmentController.create,
);
router.put(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.INSTRUCTOR),
  EnrollmentController.update,
);
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
  EnrollmentController.remove,
);

export default router;
