import { Router } from 'express';
import { body } from 'express-validator';
import { createOrder, listOrders, getOrder, updateOrderStatus } from '../controllers/orderController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public: create order
router.post(
  '/',
  [
    body('cart_items').isArray({ min: 1 }).withMessage('Carrinho vazio'),
    body('cart_items.*.product_id').notEmpty().withMessage('product_id obrigatório'),
    body('cart_items.*.quantity').isInt({ min: 1 }).withMessage('Quantidade inválida'),
    body('customer_name').notEmpty().withMessage('Nome obrigatório'),
    body('customer_phone').notEmpty().withMessage('Telefone obrigatório'),
    body('fulfillment_type').isIn(['pickup', 'delivery']).withMessage('Tipo de entrega inválido'),
  ],
  validate,
  createOrder
);

// Admin
router.get('/', requireAuth, listOrders);
router.get('/:id', requireAuth, getOrder);
router.patch(
  '/:id/status',
  requireAuth,
  [body('status').notEmpty().withMessage('Status obrigatório')],
  validate,
  updateOrderStatus
);

export default router;
