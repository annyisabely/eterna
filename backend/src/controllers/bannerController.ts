import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { Banner } from '../models/types';

export async function listBanners(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const onlyActive = req.query.active === 'true';
    const where = onlyActive ? 'WHERE is_active = true' : '';
    const result = await query(`SELECT * FROM banners ${where} ORDER BY sort_order ASC`);
    res.json({ status: 'ok', data: result.rows });
  } catch (err) { next(err); }
}

export async function createBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, subtitle, image_url, link_url, button_text, is_active, sort_order } = req.body as Record<string, unknown>;
    const result = await query<Banner>(
      `INSERT INTO banners (title, subtitle, image_url, link_url, button_text, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title ?? null, subtitle ?? null, image_url, link_url ?? null, button_text ?? null, is_active ?? true, sort_order ?? 0]
    );
    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await query<Banner>('SELECT * FROM banners WHERE id = $1', [id]);
    if (!existing.rows[0]) { res.status(404).json({ status: 'error', message: 'Banner não encontrado' }); return; }
    const b = existing.rows[0];
    const { title, subtitle, image_url, link_url, button_text, is_active, sort_order } = req.body as Record<string, unknown>;
    const result = await query<Banner>(
      `UPDATE banners SET title=$1, subtitle=$2, image_url=$3, link_url=$4, button_text=$5, is_active=$6, sort_order=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title ?? b.title, subtitle ?? b.subtitle, image_url ?? b.image_url, link_url ?? b.link_url, button_text ?? b.button_text, is_active ?? b.is_active, sort_order ?? b.sort_order, id]
    );
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await query('DELETE FROM banners WHERE id = $1', [req.params.id]);
    res.json({ status: 'ok', message: 'Banner removido' });
  } catch (err) { next(err); }
}
