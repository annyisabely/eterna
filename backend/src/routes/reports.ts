import { Router } from 'express';
import { getSalesReport, getTopProducts, exportInventoryCSV } from '../controllers/reportController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/sales', requireAuth, getSalesReport);
router.get('/top-products', requireAuth, getTopProducts);
router.get('/inventory-csv', requireAuth, exportInventoryCSV);

export default router;

