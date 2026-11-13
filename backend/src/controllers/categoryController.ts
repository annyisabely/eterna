import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import slugify from '../utils/slugify';
import { Category } from '../models/types';

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query('SELECT * FROM categories ORDER BY sort_order ASC, name ASC');
    res.json({ status: 'ok', data: result.rows });
  } catch (err) { next(err); }
}

export async function getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Category>('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ status: 'error', message: 'Categoria não encontrada' }); return; }
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, image_url, is_active, sort_order } = req.body as Record<string, unknown>;
    const slug = slugify(name as string);
    const result = await query<Category>(
      `INSERT INTO categories (name, slug, description, image_url, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, slug, description ?? null, image_url ?? null, is_active ?? true, sort_order ?? 0]
    );
    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, image_url, is_active, sort_order } = req.body as Record<string, unknown>;
    const existing = await query<Category>('SELECT * FROM categories WHERE id = $1', [id]);
    if (!existing.rows[0]) { res.status(404).json({ status: 'error', message: 'Categoria não encontrada' }); return; }
    const c = existing.rows[0];
    const slug = name ? slugify(name as string) : c.slug;
    const result = await query<Category>(
      `UPDATE categories SET name=$1, slug=$2, description=$3, image_url=$4, is_active=$5, sort_order=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name ?? c.name, slug, description ?? c.description, image_url ?? c.image_url, is_active ?? c.is_active, sort_order ?? c.sort_order, id]
    );
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await query('UPDATE categories SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ status: 'ok', message: 'Categoria desativada' });
  } catch (err) { next(err); }
}
