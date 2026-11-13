import api from './client';

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  fulfillment_type: 'pickup' | 'delivery';
  delivery_address?: string;
  coupon_code?: string;
  cart_items: OrderItemInput[];
  notes?: string;
}

export interface CreateOrderResult {
  order_number: string;
  whatsapp_url: string;
  total: number;
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    status: string;
    fulfillment_type: string;
    subtotal: number;
    discount_amount: number;
    total: number;
  };
}

export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
  const response = await api.post('/orders', payload);
  return response.data.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data.data;
};
