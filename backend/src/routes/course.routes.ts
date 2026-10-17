import { Router } from 'express';

import * as CourseController from '../controllers/CourseController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', CourseController.list);
router.get('/:id', CourseController.show);
router.post('/', CourseController.create);
router.put('/:id', CourseController.update);
router.delete('/:id', CourseController.remove);

export default router;
