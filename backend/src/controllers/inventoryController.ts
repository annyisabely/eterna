import { Request, Response, NextFunction } from 'express';
import { pool, query } from '../config/database';

export async function getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.sku, p.stock_quantity, p.min_stock_level, p.is_active,
              b.name AS brand_name, c.name AS category_name,
              CASE
                WHEN NOT p.is_active THEN 'inactive'
                WHEN p.stock_quantity = 0 THEN 'out_of_stock'
                WHEN p.stock_quantity <= p.min_stock_level THEN 'low_stock'
                ELSE 'available'
              END AS stock_status
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE NOT p.is_archived
       ORDER BY stock_quantity ASC`
    );
    res.json({ status: 'ok', data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.sku, p.stock_quantity, p.min_stock_level
       FROM products p
       WHERE p.is_active AND NOT p.is_archived AND p.stock_quantity <= p.min_stock_level
       ORDER BY p.stock_quantity ASC`
    );
    res.json({ status: 'ok', data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function addMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
  const client = await pool.connect();
  try {
    const { product_id, type, quantity, reason } = req.body as {
      product_id: string;
      type: 'in' | 'out' | 'adjustment';
      quantity: number;
      reason?: string;
    };

    await client.query('BEGIN');
    const pResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [product_id]);
    const product = pResult.rows[0];
    if (!product) {
      await client.query('ROLLBACK');
      res.status(404).json({ status: 'error', message: 'Produto não encontrado' });
      return;
    }

    const prev = product.stock_quantity as number;
    let newQty: number;
    if (type === 'in') {
      newQty = prev + quantity;
    } else if (type === 'out') {
      newQty = prev - quantity;
    } else {
      // adjustment: quantity is the absolute new value
      newQty = quantity;
    }

    if (newQty < 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ status: 'error', message: 'Estoque não pode ficar negativo' });
      return;
    }

    await client.query('UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2', [newQty, product_id]);
    const movResult = await client.query(
      `INSERT INTO inventory_movements (product_id, type, quantity, previous_quantity, new_quantity, reason, admin_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [product_id, type, Math.abs(type === 'adjustment' ? newQty - prev : quantity), prev, newQty, reason ?? null, req.admin!.id]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, old_values, new_values, ip_address)
       VALUES ($1,'inventory_movement','product',$2,$3,$4,$5)`,
      [req.admin!.id, product_id, JSON.stringify({ stock_quantity: prev }), JSON.stringify({ stock_quantity: newQty }), req.ip]
    );

    await client.query('COMMIT');
    res.status(201).json({ status: 'ok', data: movResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function listMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { product_id, page = '1', limit = '50' } = req.query as Record<string, string | undefined>;
    const pageNum = Math.max(1, parseInt(page ?? '1', 10));
    const limitNum = Math.min(200, parseInt(limit ?? '50', 10));
    const offset = (pageNum - 1) * limitNum;

    const params: unknown[] = [];
    const where = product_id ? (params.push(product_id), `WHERE im.product_id = $1`) : '';

    params.push(limitNum); params.push(offset);
    const result = await query(
      `SELECT im.*, p.name AS product_name FROM inventory_movements im
       JOIN products p ON p.id = im.product_id
       ${where}
       ORDER BY im.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ status: 'ok', data: result.rows });
  } catch (err) {
    next(err);
  }
}
