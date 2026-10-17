import { Router } from 'express';

import * as CategoryController from '../controllers/CategoryController';
import { UserRole } from '../entities/UserRole';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { requirePasswordChanged } from '../middlewares/requirePasswordChanged';
import { requireRole } from '../middlewares/requireRole';

const router = Router();

// Toda rota abaixo exige um token válido e a senha do primeiro acesso já trocada.
router.use(ensureAuthenticated, requirePasswordChanged);

// Leitura: qualquer usuário autenticado.
router.get('/', CategoryController.list);
router.get('/:id', CategoryController.show);

// Escrita: exclusiva do ADMIN.
router.post('/', requireRole(UserRole.ADMIN), CategoryController.create);
router.put('/:id', requireRole(UserRole.ADMIN), CategoryController.update);
router.delete('/:id', requireRole(UserRole.ADMIN), CategoryController.remove);

export default router;
