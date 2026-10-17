import { Router } from 'express';

import * as UserController from '../controllers/UserController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const router = Router();

// Every route below requires a valid token.
router.use(ensureAuthenticated);

router.get('/', UserController.list);
router.get('/me', UserController.me);
router.put('/me', UserController.updateMe);

export default router;
