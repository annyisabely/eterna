import { Router } from 'express';
import { body } from 'express-validator';
import { listBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', listBanners);
router.post(
  '/',
  requireAuth,
  [body('image_url').notEmpty().withMessage('image_url é obrigatório')],
  validate,
  createBanner
);
router.put('/:id', requireAuth, updateBanner);
router.delete('/:id', requireAuth, deleteBanner);

export default router;

