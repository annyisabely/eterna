import { Router } from 'express';
import { body } from 'express-validator';
import { login, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha obrigatória'),
  ],
  validate,
  login
);

router.get('/me', requireAuth, me);

export default router;
