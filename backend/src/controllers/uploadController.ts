import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'Nenhum arquivo enviado' });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ status: 'ok', data: { url, filename: req.file.filename } });
  } catch (err) { next(err); }
}

export async function addProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { product_id } = req.params;
    const { url, alt_text, sort_order, is_primary } = req.body as Record<string, unknown>;
    if (is_primary) {
      await query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [product_id]);
    }
    const result = await query(
      `INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [product_id, url, alt_text ?? null, sort_order ?? 0, is_primary ?? false]
    );
    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function deleteProductImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM product_images WHERE id = $1 RETURNING *', [id]);
    if (!result.rows[0]) { res.status(404).json({ status: 'error', message: 'Imagem não encontrada' }); return; }
    // Try to delete file from disk
    const imgUrl = result.rows[0].url as string;
    const filename = path.basename(imgUrl);
    const filePath = path.join(env.UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
    res.json({ status: 'ok', message: 'Imagem removida' });
  } catch (err) { next(err); }
}
