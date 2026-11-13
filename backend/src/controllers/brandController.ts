import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import slugify from '../utils/slugify';
import { Brand } from '../models/types';

export async function listBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query('SELECT * FROM brands WHERE is_active = true ORDER BY name ASC');
    res.json({ status: 'ok', data: result.rows });
  } catch (err) { next(err); }
}

export async function getBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Brand>('SELECT * FROM brands WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ status: 'error', message: 'Marca não encontrada' }); return; }
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function createBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, logo_url, is_active } = req.body as Record<string, unknown>;
    const slug = slugify(name as string);
    const result = await query<Brand>(
      `INSERT INTO brands (name, slug, logo_url, is_active) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, slug, logo_url ?? null, is_active ?? true]
    );
    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function updateBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await query<Brand>('SELECT * FROM brands WHERE id = $1', [id]);
    if (!existing.rows[0]) { res.status(404).json({ status: 'error', message: 'Marca não encontrada' }); return; }
    const b = existing.rows[0];
    const { name, logo_url, is_active } = req.body as Record<string, unknown>;
    const slug = name ? slugify(name as string) : b.slug;
    const result = await query<Brand>(
      `UPDATE brands SET name=$1, slug=$2, logo_url=$3, is_active=$4 WHERE id=$5 RETURNING *`,
      [name ?? b.name, slug, logo_url ?? b.logo_url, is_active ?? b.is_active, id]
    );
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function deleteBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await query('UPDATE brands SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ status: 'ok', message: 'Marca desativada' });
  } catch (err) { next(err); }
}
