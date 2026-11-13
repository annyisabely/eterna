import { Router } from 'express';
import { body } from 'express-validator';
import { listBrands, getBrand, createBrand, updateBrand, deleteBrand } from '../controllers/brandController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', listBrands);
router.get('/:id', getBrand);
router.post('/', requireAuth, [body('name').notEmpty()], validate, createBrand);
router.put('/:id', requireAuth, validate, updateBrand);
router.delete('/:id', requireAuth, deleteBrand);

export default router;
