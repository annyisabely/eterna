import { Request, Response, NextFunction } from 'express';
import { pool, query } from '../config/database';
import { generateWhatsAppMessage } from '../services/whatsappService';
import { Coupon, Order, OrderItem, Product } from '../models/types';

type OrderStatus = Order['status'];

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_contact: ['pending_confirmation', 'cancelled'],
  pending_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_pickup', 'out_delivery'],
  ready_pickup: ['completed', 'cancelled'],
  out_delivery: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ETC-${date}-${rand}`;
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  const client = await pool.connect();
  try {
    const {
      cart_items,
      customer_name,
      customer_phone,
      customer_email,
      fulfillment_type,
      delivery_address,
      coupon_code,
      notes,
    } = req.body as {
      cart_items: Array<{ product_id: string; quantity: number }>;
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      fulfillment_type: 'pickup' | 'delivery';
      delivery_address?: string;
      coupon_code?: string;
      notes?: string;
    };

    if (!cart_items || cart_items.length === 0) {
      res.status(400).json({ status: 'error', message: 'Carrinho vazio' });
      return;
    }

    await client.query('BEGIN');

    // Fetch real prices from DB
    const productIds = cart_items.map((i) => i.product_id);
    const productsResult = await client.query<Product>(
      `SELECT * FROM products WHERE id = ANY($1::uuid[]) AND is_active = true AND is_archived = false`,
      [productIds]
    );
    const productsMap = new Map(productsResult.rows.map((p) => [p.id, p]));

    // Validate stock
    for (const item of cart_items) {
      const product = productsMap.get(item.product_id);
      if (!product) {
        await client.query('ROLLBACK');
        res.status(400).json({ status: 'error', message: `Produto ${item.product_id} não disponível` });
        return;
      }
      if (product.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        res.status(400).json({
          status: 'error',
          message: `Estoque insuficiente para: ${product.name}. Disponível: ${product.stock_quantity}`,
        });
        return;
      }
    }

    // Calculate subtotal using real prices
    let subtotal = 0;
    const orderItemsData = cart_items.map((item) => {
      const product = productsMap.get(item.product_id)!;
      const unitPrice = Number(product.promotional_price ?? product.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      return {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    // Validate coupon
    let coupon: Coupon | null = null;
    let discountAmount = 0;
    if (coupon_code) {
      const couponResult = await client.query<Coupon>(
        `SELECT * FROM coupons
         WHERE code = $1 AND is_active = true
           AND (valid_until IS NULL OR valid_until > NOW())
           AND (max_uses IS NULL OR used_count < max_uses)`,
        [coupon_code.toUpperCase()]
      );
      if (!couponResult.rows[0]) {
        await client.query('ROLLBACK');
        res.status(400).json({ status: 'error', message: 'Cupom inválido ou expirado' });
        return;
      }
      coupon = couponResult.rows[0];
      if (subtotal < Number(coupon.min_order_value)) {
        await client.query('ROLLBACK');
        res.status(400).json({
          status: 'error',
          message: `Pedido mínimo para este cupom: R$ ${Number(coupon.min_order_value).toFixed(2)}`,
        });
        return;
      }
      if (coupon.type === 'percentage') {
        discountAmount = (subtotal * Number(coupon.value)) / 100;
      } else {
        discountAmount = Math.min(Number(coupon.value), subtotal);
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let orderNumExists = true;
    while (orderNumExists) {
      const existing = await client.query('SELECT id FROM orders WHERE order_number = $1', [orderNumber]);
      if (existing.rowCount === 0) orderNumExists = false;
      else orderNumber = generateOrderNumber();
    }

    // Insert order
    const orderResult = await client.query<Order>(
      `INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, status, fulfillment_type, delivery_address, subtotal, discount_amount, total, coupon_id, coupon_code, notes)
       VALUES ($1,$2,$3,$4,'pending_contact',$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [orderNumber, customer_name, customer_phone, customer_email ?? null,
       fulfillment_type, delivery_address ?? null, subtotal, discountAmount, total,
       coupon?.id ?? null, coupon?.code ?? null, notes ?? null]
    );
    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItemsData) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id, item.product_id, item.product_name, item.product_sku, item.quantity, item.unit_price, item.total_price]
      );
    }

    // Deduct stock and record movements
    for (const item of orderItemsData) {
      const product = productsMap.get(item.product_id)!;
      const newQty = product.stock_quantity - item.quantity;
      await client.query(
        'UPDATE products SET stock_quantity = $1, sold_count = sold_count + $2, updated_at = NOW() WHERE id = $3',
        [newQty, item.quantity, item.product_id]
      );
      await client.query(
        `INSERT INTO inventory_movements (product_id, type, quantity, previous_quantity, new_quantity, reason, reference_id)
         VALUES ($1,'sale',$2,$3,$4,$5,$6)`,
        [item.product_id, item.quantity, product.stock_quantity, newQty, `Venda - Pedido ${orderNumber}`, order.id]
      );
    }

    // Increment coupon usage
    if (coupon) {
      await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [coupon.id]);
      await client.query(
        `INSERT INTO coupon_usages (coupon_id, order_id, customer_phone, discount_applied)
         VALUES ($1,$2,$3,$4)`,
        [coupon.id, order.id, customer_phone, discountAmount]
      );
    }

    // Status history
    await client.query(
      `INSERT INTO order_status_history (order_id, new_status, notes) VALUES ($1,'pending_contact','Pedido criado')`,
      [order.id]
    );

    await client.query('COMMIT');

    const whatsappUrl = generateWhatsAppMessage({
      ...order,
      items: orderItemsData,
    });

    res.status(201).json({
      status: 'ok',
      data: { ...order, items: orderItemsData },
      whatsapp_url: whatsappUrl,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page = '1', limit = '20', search } = req.query as Record<string, string | undefined>;
    const pageNum = Math.max(1, parseInt(page ?? '1', 10));
    const limitNum = Math.min(100, parseInt(limit ?? '20', 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: unknown[] = [];
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length} OR order_number ILIKE $${params.length})`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countResult = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM orders ${where}`, params);
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    params.push(limitNum); params.push(offset);
    const result = await query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ status: 'ok', data: result.rows, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const orderResult = await query<Order>('SELECT * FROM orders WHERE id = $1', [id]);
    if (!orderResult.rows[0]) {
      res.status(404).json({ status: 'error', message: 'Pedido não encontrado' });
      return;
    }
    const order = orderResult.rows[0];
    const items = await query<OrderItem>('SELECT * FROM order_items WHERE order_id = $1', [id]);
    const history = await query('SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC', [id]);
    res.json({ status: 'ok', data: { ...order, items: items.rows, history: history.rows } });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status: newStatus, notes, cancellation_reason } = req.body as {
      status: OrderStatus;
      notes?: string;
      cancellation_reason?: string;
    };

    await client.query('BEGIN');
    const orderResult = await client.query<Order>('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
    const order = orderResult.rows[0];
    if (!order) {
      await client.query('ROLLBACK');
      res.status(404).json({ status: 'error', message: 'Pedido não encontrado' });
      return;
    }

    const allowed = STATUS_TRANSITIONS[order.status as OrderStatus];
    if (!allowed.includes(newStatus)) {
      await client.query('ROLLBACK');
      res.status(400).json({
        status: 'error',
        message: `Transição inválida: ${order.status} → ${newStatus}`,
      });
      return;
    }

    const extraFields: Record<string, unknown> = {};
    if (newStatus === 'confirmed') extraFields['confirmed_at'] = new Date();
    if (newStatus === 'completed') extraFields['completed_at'] = new Date();
    if (newStatus === 'cancelled') {
      extraFields['cancelled_at'] = new Date();
      extraFields['cancellation_reason'] = cancellation_reason ?? null;

      // Restore stock on cancellation
      const items = await client.query<OrderItem>('SELECT * FROM order_items WHERE order_id = $1', [id]);
      for (const item of items.rows) {
        if (!item.product_id) continue;
        const pResult = await client.query<Product>('SELECT stock_quantity FROM products WHERE id = $1', [item.product_id]);
        const prev = pResult.rows[0]?.stock_quantity ?? 0;
        const newQty = prev + item.quantity;
        await client.query('UPDATE products SET stock_quantity = $1, updated_at = NOW() WHERE id = $2', [newQty, item.product_id]);
        await client.query(
          `INSERT INTO inventory_movements (product_id, type, quantity, previous_quantity, new_quantity, reason, reference_id, admin_id)
           VALUES ($1,'cancellation',$2,$3,$4,$5,$6,$7)`,
          [item.product_id, item.quantity, prev, newQty, `Cancelamento - Pedido ${order.order_number}`, id, req.admin!.id]
        );
      }
    }

    const setClause = Object.keys(extraFields)
      .map((k, i) => `${k} = $${i + 3}`)
      .join(', ');
    const extraValues = Object.values(extraFields);
    await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW()${setClause ? ', ' + setClause : ''} WHERE id = $2`,
      [newStatus, id, ...extraValues]
    );

    await client.query(
      `INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes) VALUES ($1,$2,$3,$4,$5)`,
      [id, order.status, newStatus, req.admin!.id, notes ?? null]
    );

    await client.query('COMMIT');
    const updated = await query<Order>('SELECT * FROM orders WHERE id = $1', [id]);
    res.json({ status: 'ok', data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}
