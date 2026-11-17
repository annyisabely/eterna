import { Router } from 'express';
import { body } from 'express-validator';
import { getInventoryReport, getLowStock, addMovement, listMovements } from '../controllers/inventoryController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/report', requireAuth, getInventoryReport);
router.get('/low-stock', requireAuth, getLowStock);
router.get('/movements', requireAuth, listMovements);
router.post(
  '/movements',
  requireAuth,
  [
    body('product_id').notEmpty().withMessage('product_id obrigatório'),
    body('type').isIn(['in', 'out', 'adjustment']).withMessage('Tipo inválido (in, out, adjustment)'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantidade inválida'),
  ],
  validate,
  addMovement
);

export default router;

