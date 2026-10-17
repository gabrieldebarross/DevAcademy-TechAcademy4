import { Router } from 'express';

import * as CategoryController from '../controllers/CategoryController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.show);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

export default router;
