import { Router } from 'express';

import * as CourseController from '../controllers/CourseController';
import { UserRole } from '../entities/UserRole';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { requirePasswordChanged } from '../middlewares/requirePasswordChanged';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Toda rota abaixo exige um token válido e a senha do primeiro acesso já trocada.
router.use(ensureAuthenticated, requirePasswordChanged);

router.get('/', CourseController.list);
router.get('/:id', CourseController.show);

// Criação: somente ADMIN.
// Edição/remoção: ADMIN ou INSTRUCTOR (que só altera os próprios cursos).
router.post('/', requireRole(UserRole.ADMIN), CourseController.create);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.INSTRUCTOR), CourseController.update);
router.delete('/:id', requireRole(UserRole.ADMIN, UserRole.INSTRUCTOR), CourseController.remove);

export default router;
