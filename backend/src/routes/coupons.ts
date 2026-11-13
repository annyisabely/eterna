import { Router } from 'express';
import { body } from 'express-validator';
import { listCoupons, validateCoupon, createCoupon, updateCoupon } from '../controllers/couponController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public: validate at checkout
router.post(
  '/validate',
  [
    body('code').notEmpty().withMessage('Código obrigatório'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal inválido'),
  ],
  validate,
  validateCoupon
);

// Admin: CRUD
router.get('/', requireAuth, listCoupons);
router.post(
  '/',
  requireAuth,
  [
    body('code').notEmpty().withMessage('Código obrigatório'),
    body('type').isIn(['percentage', 'fixed']).withMessage('Tipo deve ser percentage ou fixed'),
    body('value').isFloat({ min: 0.01 }).withMessage('Valor inválido'),
  ],
  validate,
  createCoupon
);
router.put('/:id', requireAuth, validate, updateCoupon);

export default router;

