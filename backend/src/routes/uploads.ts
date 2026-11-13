import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadImage, addProductImage, deleteProductImage } from '../controllers/uploadController';
import { requireAuth } from '../middleware/auth';
import { env } from '../config/env';

// Ensure uploads folder exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (JPEG, PNG, WEBP, GIF) são permitidas'));
    }
  },
});

const router = Router();

router.post('/', requireAuth, upload.single('file'), uploadImage);
router.post('/products/:product_id', requireAuth, addProductImage);
router.delete('/products/images/:id', requireAuth, deleteProductImage);

export default router;

