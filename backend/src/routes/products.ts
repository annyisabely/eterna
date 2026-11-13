import { Router } from 'express';
import { body, param, query as qVal } from 'express-validator';
import {
  listProducts, getProduct, createProduct, updateProduct, archiveProduct,
} from '../controllers/productController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public
router.get('/', listProducts);
router.get('/:slug', getProduct);

// Admin
router.post(
  '/',
  requireAuth,
  [
    body('name').notEmpty().withMessage('Nome obrigatório'),
    body('price').isFloat({ min: 0 }).withMessage('Preço inválido'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Estoque inválido'),
  ],
  validate,
  createProduct
);
router.put('/:id', requireAuth, validate, updateProduct);
router.patch('/:id/archive', requireAuth, archiveProduct);

export default router;
