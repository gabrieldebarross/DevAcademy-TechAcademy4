import { Router } from 'express';

import * as InstructorController from '../controllers/InstructorController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', InstructorController.list);
router.get('/:id', InstructorController.show);
router.post('/', InstructorController.create);
router.put('/:id', InstructorController.update);
router.delete('/:id', InstructorController.remove);

export default router;
