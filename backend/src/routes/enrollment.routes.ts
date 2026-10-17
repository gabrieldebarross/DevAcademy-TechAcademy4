import { Router } from 'express';

import * as EnrollmentController from '../controllers/EnrollmentController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', EnrollmentController.list);
router.get('/:id', EnrollmentController.show);
router.post('/', EnrollmentController.create);
router.put('/:id', EnrollmentController.update);
router.delete('/:id', EnrollmentController.remove);

export default router;
