import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public: reading settings like WhatsApp number, store name, address
router.get('/', getSettings);

// Admin: updating settings
router.put('/', requireAuth, updateSettings);

export default router;

