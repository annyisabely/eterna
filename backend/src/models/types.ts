export interface Admin {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: string;
  customer_id: string;
  street: string;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  is_default: boolean;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_id: string | null;
  category_id: string | null;
  price: number;
  promotional_price: number | null;
  sku: string | null;
  stock_quantity: number;
  min_stock_level: number;
  is_featured: boolean;
  is_active: boolean;
  is_archived: boolean;
  sold_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'cancellation';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string | null;
  reference_id: string | null;
  admin_id: string | null;
  created_at: Date;
}

export interface Cart {
  id: string;
  session_id: string | null;
  customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
}

export type OrderStatus =
  | 'pending_contact'
  | 'pending_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'ready_pickup'
  | 'out_delivery'
  | 'completed'
  | 'cancelled';

export type FulfillmentType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_id: string | null;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  delivery_address: string | null;
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_id: string | null;
  coupon_code: string | null;
  notes: string | null;
  admin_notes: string | null;
  whatsapp_sent_at: Date | null;
  confirmed_at: Date | null;
  completed_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: Date;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: Date;
  valid_until: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  order_id: string;
  customer_phone: string | null;
  discount_applied: number;
  created_at: Date;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface StoreSetting {
  key: string;
  value: string | null;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
}

// JWT Payload
export interface AdminJwtPayload {
  id: string;
  email: string;
  name: string;
}

// Request extensions
declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
      customerId?: string;
    }
  }
}
