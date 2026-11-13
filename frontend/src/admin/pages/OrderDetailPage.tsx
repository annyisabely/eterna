import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Package, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import adminApi from '../api/adminClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface OrderDetail {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: string;
  fulfillment_type: string;
  delivery_address?: string;
  subtotal: string | number;
  discount_amount: string | number;
  total: string | number;
  coupon_code?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    product_sku?: string;
    quantity: number;
    unit_price: string | number;
    total_price: string | number;
  }>;
  status_history: Array<{
    id: string;
    previous_status?: string;
    new_status: string;
    notes?: string;
    created_at: string;
  }>;
}

const statusOptions = [
  { value: 'pending_contact', label: 'Aguardando Contato / Envio WhatsApp' },
  { value: 'pending_confirmation', label: 'Aguardando Confirmação da Loja' },
  { value: 'confirmed', label: 'Confirmado pela Loja' },
  { value: 'preparing', label: 'Em Preparação / Separação' },
  { value: 'ready_pickup', label: 'Pronto para Retirada' },
  { value: 'out_delivery', label: 'Saiu para Entrega' },
  { value: 'completed', label: 'Concluído / Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get(`/orders/${id}`);
      setOrder(res.data.data);
      setSelectedStatus(res.data.data.status);
    } catch (err) {
      console.error('Falha ao carregar detalhe do pedido:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setUpdating(true);
      await adminApi.patch(`/orders/${order.id}/status`, {
        status: selectedStatus,
        notes: statusNotes.trim() || undefined,
      });
      toast.success('Status do pedido atualizado com sucesso!');
      setStatusNotes('');
      fetchOrder();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao atualizar status.';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-2 font-serif">Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-gray-500">
        Pedido não encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div>
        <Link
          to="/admin/pedidos"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-nude-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a lista de pedidos</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
              Detalhes do Pedido
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-0.5">
              {order.order_number}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Registrado em {new Date(order.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Customer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
              Produtos do Pedido
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">{item.product_name}</p>
                    {item.product_sku && (
                      <p className="text-[11px] text-gray-400 font-mono">SKU: {item.product_sku}</p>
                    )}
                    <p className="text-gray-500">
                      {item.quantity}x de {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-gray-900 text-sm">
                    {formatCurrency(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Desconto ({order.coupon_code || 'Cupom'}):</span>
                  <span>- {formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-lg font-serif text-nude-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Fulfillment Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
              Informações de Contato e Entrega
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block">Cliente</span>
                <p className="font-semibold text-gray-900 text-sm">{order.customer_name}</p>
                <p className="text-nude-800 font-mono">{order.customer_phone}</p>
                {order.customer_email && <p className="text-gray-500">{order.customer_email}</p>}
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 block">Tipo de Recebimento</span>
                <p className="font-semibold text-gray-900 uppercase">
                  {order.fulfillment_type === 'pickup' ? 'Retirada na Loja' : 'Entrega no Endereço'}
                </p>
                {order.delivery_address && (
                  <p className="text-gray-600 mt-1">{order.delivery_address}</p>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-400 block mb-1">Observações do Cliente:</span>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700 italic">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Actions & Timeline */}
        <div className="space-y-6">
          {/* Status Updater */}
          <form onSubmit={handleUpdateStatus} className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
              Atualizar Situação
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Status Atual</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-nude-400"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Observação Administrativa</label>
              <textarea
                rows={2}
                placeholder="Ex: Mensagem enviada pelo WhatsApp; entrega agendada..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-nude-400"
              />
            </div>

            <Button variant="primary" fullWidth size="md" type="submit" loading={updating}>
              Salvar Alteração
            </Button>
          </form>

          {/* Status Timeline */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100">
                Histórico de Alterações
              </h2>

              <div className="space-y-3">
                {order.status_history.map((h) => (
                  <div key={h.id} className="text-xs border-l-2 border-nude-400 pl-3 space-y-0.5">
                    <p className="font-bold text-gray-800 uppercase text-[10px]">
                      {h.new_status}
                    </p>
                    {h.notes && <p className="text-gray-600">{h.notes}</p>}
                    <p className="text-[10px] text-gray-400">
                      {new Date(h.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

