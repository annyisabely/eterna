import { Router } from 'express';
import { body } from 'express-validator';
import { getOrCreateCart, addToCart, removeFromCart, clearCart } from '../controllers/cartController';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getOrCreateCart);
router.post(
  '/items',
  [
    body('session_id').notEmpty().withMessage('session_id é obrigatório'),
    body('product_id').notEmpty().withMessage('product_id obrigatório'),
    body('quantity').isInt({ min: 1 }).withMessage('quantity deve ser no mínimo 1'),
  ],
  validate,
  addToCart
);
router.delete(
  '/items',
  [
    body('session_id').notEmpty().withMessage('session_id é obrigatório'),
    body('product_id').notEmpty().withMessage('product_id obrigatório'),
  ],
  validate,
  removeFromCart
);
router.delete(
  '/clear',
  [body('session_id').notEmpty().withMessage('session_id é obrigatório')],
  validate,
  clearCart
);

export default router;

