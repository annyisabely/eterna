import api from './client';

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  promotional_price?: string | number | null;
  sku?: string;
  stock_quantity: number;
  min_stock_level: number;
  is_featured: boolean;
  is_active: boolean;
  sold_count?: number;
  brand_id?: string;
  brand_name?: string;
  category_id?: string;
  category_name?: string;
  primary_image?: string | null;
  images?: ProductImage[];
  created_at?: string;
}

export interface ProductFilters {
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'featured';
  page?: number;
  limit?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  const response = await api.get('/products', { params: filters });
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 },
  };
};

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await api.get(`/products/${slug}`);
  return response.data.data;
};

export const getRelatedProducts = async (categoryId?: string, excludeSlug?: string): Promise<Product[]> => {
  if (!categoryId) return [];
  const response = await api.get('/products', {
    params: { category_id: categoryId, limit: 4 },
  });
  const items: Product[] = response.data.data ?? [];
  return items.filter((p) => p.slug !== excludeSlug);
};
