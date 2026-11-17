import { Order, OrderItem } from '../models/types';
import { env } from '../config/env';

interface WhatsAppOrder extends Partial<Order> {
  items: Array<Partial<OrderItem> & { product_name: string; quantity: number; unit_price: number; total_price: number }>;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: 'pickup' | 'delivery';
  delivery_address?: string | null;
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon_code?: string | null;
}

export function generateWhatsAppMessage(order: WhatsAppOrder): string {
  const lines: string[] = [];
  lines.push(`🌸 *Eterna Cosméticos e Acessórios*`);
  lines.push(`📋 *Pedido: ${order.order_number}*`);
  lines.push('');
  lines.push(`👤 Cliente: ${order.customer_name}`);
  lines.push(`📱 Telefone: ${order.customer_phone}`);
  lines.push('');
  lines.push('🛍️ *Itens do pedido:*');
  for (const item of order.items) {
    const price = Number(item.unit_price).toFixed(2).replace('.', ',');
    const total = Number(item.total_price).toFixed(2).replace('.', ',');
    lines.push(`• ${item.product_name} x${item.quantity} — R$ ${price} = R$ ${total}`);
  }
  lines.push('');
  lines.push(`💰 Subtotal: R$ ${Number(order.subtotal).toFixed(2).replace('.', ',')}`);
  if (order.discount_amount && order.discount_amount > 0) {
    lines.push(`🏷️ Desconto${order.coupon_code ? ` (${order.coupon_code})` : ''}: -R$ ${Number(order.discount_amount).toFixed(2).replace('.', ',')}`);
  }
  lines.push(`✅ *Total: R$ ${Number(order.total).toFixed(2).replace('.', ',')}*`);
  lines.push('');
  if (order.fulfillment_type === 'pickup') {
    lines.push('🏪 *Retirada na loja:*');
    lines.push('Av. Emílio Johnson, 782 - Almirante Tamandaré/PR');
  } else {
    lines.push('🚚 *Entrega:*');
    if (order.delivery_address) {
      lines.push(`📍 Endereço: ${order.delivery_address}`);
    }
  }
  lines.push('');
  lines.push('Aguardamos a confirmação do seu pedido! 😊');

  const message = lines.join('\n');
  const encoded = encodeURIComponent(message);
  const rawNum = String(env.WHATSAPP_NUMBER || '5541999949204').replace(/\D/g, '');
  const cleanNumber = rawNum.startsWith('55') ? rawNum : `55${rawNum}`;
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
