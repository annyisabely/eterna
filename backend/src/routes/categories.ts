import { Router } from 'express';
import { body } from 'express-validator';
import { listCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', requireAuth, [body('name').notEmpty()], validate, createCategory);
router.put('/:id', requireAuth, validate, updateCategory);
router.delete('/:id', requireAuth, deleteCategory);

export default router;
