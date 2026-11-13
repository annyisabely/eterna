import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export async function getDashboardMetrics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      revenueResult,
      ordersResult,
      productsResult,
      customersResult,
      stockResult,
      topProductsResult,
      recentOrdersResult,
      salesByDayResult,
    ] = await Promise.all([
      // Revenue (completed orders)
      query<{ total_revenue: string }>(
        `SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE status = 'completed'`
      ),
      // Orders stats
      query<{ total_orders: string; orders_pending: string; orders_completed: string }>(
        `SELECT
          COUNT(*) AS total_orders,
          COUNT(*) FILTER (WHERE status NOT IN ('completed','cancelled')) AS orders_pending,
          COUNT(*) FILTER (WHERE status = 'completed') AS orders_completed
         FROM orders`
      ),
      // Products
      query<{ total_products: string }>(
        `SELECT COUNT(*) AS total_products FROM products WHERE NOT is_archived`
      ),
      // Customers
      query<{ total_customers: string }>(
        `SELECT COUNT(*) AS total_customers FROM customers`
      ),
      // Stock alerts
      query<{ low_stock_count: string; out_of_stock_count: string }>(
        `SELECT
          COUNT(*) FILTER (WHERE stock_quantity > 0 AND stock_quantity <= min_stock_level) AS low_stock_count,
          COUNT(*) FILTER (WHERE stock_quantity = 0) AS out_of_stock_count
         FROM products WHERE is_active AND NOT is_archived`
      ),
      // Top 5 products
      query(
        `SELECT p.id, p.name, p.slug, COALESCE(SUM(oi.quantity), 0) AS sold_qty, COALESCE(SUM(oi.total_price), 0) AS revenue
         FROM products p
         LEFT JOIN order_items oi ON oi.product_id = p.id
         LEFT JOIN orders o ON o.id = oi.order_id AND o.status IN ('completed','confirmed')
         WHERE NOT p.is_archived
         GROUP BY p.id, p.name, p.slug
         ORDER BY sold_qty DESC
         LIMIT 5`
      ),
      // Recent 10 orders
      query(
        `SELECT id, order_number, customer_name, customer_phone, status, total, created_at
         FROM orders ORDER BY created_at DESC LIMIT 10`
      ),
      // Sales by day (last 30 days)
      query(
        `SELECT DATE(created_at) AS day, COUNT(*) AS orders_count, COALESCE(SUM(total), 0) AS revenue
         FROM orders
         WHERE status IN ('completed','confirmed') AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY day ASC`
      ),
    ]);

    res.json({
      status: 'ok',
      data: {
        total_revenue: parseFloat(revenueResult.rows[0]?.total_revenue ?? '0'),
        total_orders: parseInt(ordersResult.rows[0]?.total_orders ?? '0'),
        orders_pending: parseInt(ordersResult.rows[0]?.orders_pending ?? '0'),
        orders_completed: parseInt(ordersResult.rows[0]?.orders_completed ?? '0'),
        total_products: parseInt(productsResult.rows[0]?.total_products ?? '0'),
        total_customers: parseInt(customersResult.rows[0]?.total_customers ?? '0'),
        low_stock_count: parseInt(stockResult.rows[0]?.low_stock_count ?? '0'),
        out_of_stock_count: parseInt(stockResult.rows[0]?.out_of_stock_count ?? '0'),
        top_products: topProductsResult.rows,
        recent_orders: recentOrdersResult.rows,
        sales_by_day: salesByDayResult.rows,
      },
    });
  } catch (err) {
    next(err);
  }
}
