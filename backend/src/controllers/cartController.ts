import { Request, Response, NextFunction } from 'express';
import { pool, query } from '../config/database';
import { Cart, CartItem, Product } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export async function getOrCreateCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = (req.query.session_id as string) || uuidv4();
    let result = await query<Cart>('SELECT * FROM carts WHERE session_id = $1', [sessionId]);
    if (!result.rows[0]) {
      result = await query<Cart>(
        'INSERT INTO carts (session_id) VALUES ($1) RETURNING *',
        [sessionId]
      );
    }
    const cart = result.rows[0];
    const items = await query(
      `SELECT ci.*, p.name, p.slug, p.price, p.promotional_price, p.stock_quantity,
              (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) AS primary_image
       FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = $1`,
      [cart.id]
    );
    res.json({ status: 'ok', data: { ...cart, items: items.rows, session_id: sessionId } });
  } catch (err) { next(err); }
}

export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  const client = await pool.connect();
  try {
    const { session_id, product_id, quantity } = req.body as { session_id: string; product_id: string; quantity: number };
    await client.query('BEGIN');

    let cartResult = await client.query<Cart>('SELECT * FROM carts WHERE session_id = $1', [session_id]);
    if (!cartResult.rows[0]) {
      cartResult = await client.query<Cart>('INSERT INTO carts (session_id) VALUES ($1) RETURNING *', [session_id]);
    }
    const cart = cartResult.rows[0];

    const productResult = await client.query<Product>('SELECT * FROM products WHERE id = $1 AND is_active = true AND is_archived = false', [product_id]);
    if (!productResult.rows[0]) {
      await client.query('ROLLBACK');
      res.status(404).json({ status: 'error', message: 'Produto não disponível' });
      return;
    }
    const product = productResult.rows[0];
    if (product.stock_quantity < quantity) {
      await client.query('ROLLBACK');
      res.status(400).json({ status: 'error', message: `Estoque insuficiente. Disponível: ${product.stock_quantity}` });
      return;
    }

    const unitPrice = Number(product.promotional_price ?? product.price);
    await client.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity, price_at_time = EXCLUDED.price_at_time`,
      [cart.id, product_id, quantity, unitPrice]
    );
    await client.query('UPDATE carts SET updated_at = NOW() WHERE id = $1', [cart.id]);
    await client.query('COMMIT');

    const items = await query<CartItem>('SELECT * FROM cart_items WHERE cart_id = $1', [cart.id]);
    res.json({ status: 'ok', data: { cart_id: cart.id, session_id, items: items.rows } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { session_id, product_id } = req.body as { session_id: string; product_id: string };
    const cartResult = await query<Cart>('SELECT * FROM carts WHERE session_id = $1', [session_id]);
    if (!cartResult.rows[0]) { res.status(404).json({ status: 'error', message: 'Carrinho não encontrado' }); return; }
    await query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartResult.rows[0].id, product_id]);
    res.json({ status: 'ok' });
  } catch (err) { next(err); }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { session_id } = req.body as { session_id: string };
    const cartResult = await query<Cart>('SELECT * FROM carts WHERE session_id = $1', [session_id]);
    if (!cartResult.rows[0]) { res.status(404).json({ status: 'error', message: 'Carrinho não encontrado' }); return; }
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
    res.json({ status: 'ok' });
  } catch (err) { next(err); }
}
