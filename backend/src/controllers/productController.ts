import { Request, Response, NextFunction } from 'express';
import slugify from '../utils/slugify';
import { query } from '../config/database';
import { Product } from '../models/types';

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      category_id,
      brand_id,
      min_price,
      max_price,
      search,
      sort = 'newest',
      page = '1',
      limit = '20',
      is_active,
      is_featured,
    } = req.query as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page ?? '1', 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit ?? '20', 10)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = ['p.is_archived = false'];
    const params: unknown[] = [];

    if (category_id) { params.push(category_id); conditions.push(`p.category_id = $${params.length}`); }
    if (brand_id) { params.push(brand_id); conditions.push(`p.brand_id = $${params.length}`); }
    if (min_price) { params.push(parseFloat(min_price)); conditions.push(`p.price >= $${params.length}`); }
    if (max_price) { params.push(parseFloat(max_price)); conditions.push(`p.price <= $${params.length}`); }
    if (search) { params.push(`%${search}%`); conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`); }
    if (is_active !== undefined) { params.push(is_active === 'true'); conditions.push(`p.is_active = $${params.length}`); }
    if (is_featured !== undefined) { params.push(is_featured === 'true'); conditions.push(`p.is_featured = $${params.length}`); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap: Record<string, string> = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      newest: 'p.created_at DESC',
      popular: 'p.sold_count DESC',
      featured: 'p.is_featured DESC, p.created_at DESC',
    };
    const orderBy = sortMap[sort] ?? sortMap['newest'];

    const countResult = await query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    params.push(limitNum);
    params.push(offset);
    const dataResult = await query(
      `SELECT p.*, b.name AS brand_name, c.name AS category_name,
              (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) AS primary_image
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      status: 'ok',
      data: dataResult.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const result = await query<Product>(
      `SELECT p.*, b.name AS brand_name, b.slug AS brand_slug, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.is_archived = false`,
      [slug]
    );
    if (!result.rows[0]) {
      res.status(404).json({ status: 'error', message: 'Produto não encontrado' });
      return;
    }
    const product = result.rows[0];
    const images = await query('SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC', [product.id]);
    res.json({ status: 'ok', data: { ...product, images: images.rows } });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name, description, brand_id, category_id, price, promotional_price,
      sku, stock_quantity, min_stock_level, is_featured, is_active,
    } = req.body as Record<string, unknown>;

    const baseSlug = slugify(name as string);
    // Ensure uniqueness
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await query('SELECT id FROM products WHERE slug = $1', [slug]);
      if (existing.rowCount === 0) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const result = await query<Product>(
      `INSERT INTO products (name, slug, description, brand_id, category_id, price, promotional_price, sku, stock_quantity, min_stock_level, is_featured, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [name, slug, description ?? null, brand_id ?? null, category_id ?? null, price,
       promotional_price ?? null, sku ?? null, stock_quantity ?? 0, min_stock_level ?? 5,
       is_featured ?? false, is_active ?? true]
    );

    res.status(201).json({ status: 'ok', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await query<Product>('SELECT * FROM products WHERE id = $1', [id]);
    if (!existing.rows[0]) {
      res.status(404).json({ status: 'error', message: 'Produto não encontrado' });
      return;
    }
    const current = existing.rows[0];
    const {
      name, description, brand_id, category_id, price, promotional_price,
      sku, stock_quantity, min_stock_level, is_featured, is_active,
    } = req.body as Record<string, unknown>;

    let slug = current.slug;
    if (name && name !== current.name) {
      const baseSlug = slugify(name as string);
      slug = baseSlug;
      let attempt = 0;
      while (true) {
        const dup = await query('SELECT id FROM products WHERE slug = $1 AND id != $2', [slug, id]);
        if (dup.rowCount === 0) break;
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
    }

    const result = await query<Product>(
      `UPDATE products SET
        name = $1, slug = $2, description = $3, brand_id = $4, category_id = $5,
        price = $6, promotional_price = $7, sku = $8, stock_quantity = $9,
        min_stock_level = $10, is_featured = $11, is_active = $12, updated_at = NOW()
       WHERE id = $13 RETURNING *`,
      [
        name ?? current.name, slug, description ?? current.description,
        brand_id ?? current.brand_id, category_id ?? current.category_id,
        price ?? current.price, promotional_price ?? current.promotional_price,
        sku ?? current.sku, stock_quantity ?? current.stock_quantity,
        min_stock_level ?? current.min_stock_level, is_featured ?? current.is_featured,
        is_active ?? current.is_active, id
      ]
    );
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function archiveProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query<Product>(
      'UPDATE products SET is_archived = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ status: 'error', message: 'Produto não encontrado' });
      return;
    }
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
