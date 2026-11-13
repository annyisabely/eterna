import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { Customer } from '../models/types';

export async function listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, page = '1', limit = '20' } = req.query as Record<string, string | undefined>;
    const pageNum = Math.max(1, parseInt(page ?? '1', 10));
    const limitNum = Math.min(100, parseInt(limit ?? '20', 10));
    const offset = (pageNum - 1) * limitNum;

    const params: unknown[] = [];
    const where = search
      ? (params.push(`%${search}%`), `WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1`)
      : '';

    const countResult = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM customers ${where}`, params);
    params.push(limitNum); params.push(offset);
    const result = await query(
      `SELECT * FROM customers ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ status: 'ok', data: result.rows, pagination: { total: parseInt(countResult.rows[0]?.total ?? '0'), page: pageNum, limit: limitNum } });
  } catch (err) { next(err); }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Customer>('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) { res.status(404).json({ status: 'error', message: 'Cliente não encontrado' }); return; }
    const orders = await query('SELECT id, order_number, status, total, created_at FROM orders WHERE customer_id = $1 OR customer_phone = $2 ORDER BY created_at DESC', [req.params.id, result.rows[0].phone]);
    res.json({ status: 'ok', data: { ...result.rows[0], orders: orders.rows } });
  } catch (err) { next(err); }
}
