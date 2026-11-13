import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export async function getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const result = await query(
      `SELECT DATE(created_at) AS day,
              COUNT(*) AS orders_count,
              COALESCE(SUM(total), 0) AS revenue,
              COALESCE(SUM(discount_amount), 0) AS total_discounts
       FROM orders
       WHERE status IN ('completed','confirmed')
         AND created_at >= $1 AND created_at <= $2
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [fromDate, toDate]
    );
    const totals = await query(
      `SELECT COALESCE(SUM(total), 0) AS total_revenue,
              COUNT(*) AS total_orders,
              COALESCE(AVG(total), 0) AS avg_order_value
       FROM orders
       WHERE status IN ('completed','confirmed')
         AND created_at >= $1 AND created_at <= $2`,
      [fromDate, toDate]
    );
    res.json({ status: 'ok', data: { daily: result.rows, summary: totals.rows[0] } });
  } catch (err) {
    next(err);
  }
}

export async function getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to, limit = '10' } = req.query as { from?: string; to?: string; limit?: string };
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const limitNum = Math.min(50, parseInt(limit, 10));

    const result = await query(
      `SELECT oi.product_name, oi.product_id,
              SUM(oi.quantity) AS total_sold,
              SUM(oi.total_price) AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status IN ('completed','confirmed')
         AND o.created_at >= $1 AND o.created_at <= $2
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC
       LIMIT $3`,
      [fromDate, toDate, limitNum]
    );
    res.json({ status: 'ok', data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function exportInventoryCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      `SELECT p.sku, p.name, p.stock_quantity, p.min_stock_level, p.price,
              b.name AS brand, c.name AS category,
              CASE
                WHEN NOT p.is_active THEN 'Inativo'
                WHEN p.stock_quantity = 0 THEN 'Sem estoque'
                WHEN p.stock_quantity <= p.min_stock_level THEN 'Estoque baixo'
                ELSE 'Disponível'
              END AS status
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE NOT p.is_archived
       ORDER BY p.name ASC`
    );

    const header = 'SKU,Nome,Estoque,Estoque Mínimo,Preço,Marca,Categoria,Status\n';
    const rows = result.rows
      .map(
        (r) =>
          `"${r.sku ?? ''}","${r.name}","${r.stock_quantity}","${r.min_stock_level}","${r.price}","${r.brand ?? ''}","${r.category ?? ''}","${r.status}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="inventario.csv"');
    res.send('\uFEFF' + header + rows); // BOM for Excel
  } catch (err) {
    next(err);
  }
}
