import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { Coupon } from '../models/types';

export async function listCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ status: 'ok', data: result.rows });
  } catch (err) { next(err); }
}

export async function validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, subtotal } = req.body as { code: string; subtotal: number };
    const result = await query<Coupon>(
      `SELECT * FROM coupons
       WHERE code = $1 AND is_active = true
         AND (valid_until IS NULL OR valid_until > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase()]
    );
    if (!result.rows[0]) {
      res.status(400).json({ status: 'error', message: 'Cupom inválido ou expirado' });
      return;
    }
    const coupon = result.rows[0];
    if (subtotal < Number(coupon.min_order_value)) {
      res.status(400).json({ status: 'error', message: `Valor mínimo para este cupom: R$ ${Number(coupon.min_order_value).toFixed(2)}` });
      return;
    }
    const discount = coupon.type === 'percentage'
      ? (subtotal * Number(coupon.value)) / 100
      : Math.min(Number(coupon.value), subtotal);
    res.json({ status: 'ok', data: { coupon, discount } });
  } catch (err) { next(err); }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, description, type, value, min_order_value, max_uses, valid_from, valid_until, is_active } = req.body as Record<string, unknown>;
    const result = await query<Coupon>(
      `INSERT INTO coupons (code, description, type, value, min_order_value, max_uses, valid_from, valid_until, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [(code as string).toUpperCase(), description ?? null, type, value, min_order_value ?? 0, max_uses ?? null, valid_from ?? new Date(), valid_until ?? null, is_active ?? true]
    );
    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}

export async function updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await query<Coupon>('SELECT * FROM coupons WHERE id = $1', [id]);
    if (!existing.rows[0]) { res.status(404).json({ status: 'error', message: 'Cupom não encontrado' }); return; }
    const c = existing.rows[0];
    const { description, type, value, min_order_value, max_uses, valid_until, is_active } = req.body as Record<string, unknown>;
    const result = await query<Coupon>(
      `UPDATE coupons SET description=$1, type=$2, value=$3, min_order_value=$4, max_uses=$5, valid_until=$6, is_active=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [description ?? c.description, type ?? c.type, value ?? c.value, min_order_value ?? c.min_order_value, max_uses ?? c.max_uses, valid_until ?? c.valid_until, is_active ?? c.is_active, id]
    );
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) { next(err); }
}
