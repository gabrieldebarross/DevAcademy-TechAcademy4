import { Router } from 'express';

import * as InstructorController from '../controllers/InstructorController';
import { UserRole } from '../entities/UserRole';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { requirePasswordChanged } from '../middlewares/requirePasswordChanged';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

router.use(ensureAuthenticated, requirePasswordChanged);

// Leitura: qualquer usuário autenticado.
router.get('/', InstructorController.list);
router.get('/:id', InstructorController.show);

// Escrita: exclusiva do ADMIN.
router.post('/', requireRole(UserRole.ADMIN), InstructorController.create);
router.put('/:id', requireRole(UserRole.ADMIN), InstructorController.update);
router.delete('/:id', requireRole(UserRole.ADMIN), InstructorController.remove);

export default router;
