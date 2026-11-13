import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import brandRoutes from './routes/brands';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import couponRoutes from './routes/coupons';
import customerRoutes from './routes/customers';
import dashboardRoutes from './routes/dashboard';
import inventoryRoutes from './routes/inventory';
import reportRoutes from './routes/reports';
import settingsRoutes from './routes/settings';
import uploadRoutes from './routes/uploads';
import bannerRoutes from './routes/banners';

const app = express();

// Security & utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`Origem CORS não permitida: ${origin}`));
  },
  credentials: true,
}));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// Rate limiting on public API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'Eterna Cosméticos',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/banners', bannerRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server if not running inside test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`[Eterna Cosméticos API] Servidor rodando na porta ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[Eterna Cosméticos API] Healthcheck: http://localhost:${env.PORT}/api/health`);
  });
}

export default app;

