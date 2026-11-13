import { Router } from 'express';
import { listCustomers, getCustomer } from '../controllers/customerController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, listCustomers);
router.get('/:id', requireAuth, getCustomer);

export default router;

