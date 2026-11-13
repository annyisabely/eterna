import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Clock, CheckCircle2, XCircle, Truck, Package } from 'lucide-react';
import adminApi from '../api/adminClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Spinner } from '../../components/ui/Spinner';

interface OrderItem {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  fulfillment_type: string;
  total: string | number;
  created_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_contact: { label: 'Aguardando Contato', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  pending_confirmation: { label: 'Aguardando Confirmação', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  confirmed: { label: 'Confirmado', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  preparing: { label: 'Em Preparação', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  ready_pickup: { label: 'Pronto para Retirada', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  out_delivery: { label: 'Em Entrega', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  completed: { label: 'Concluído', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Cancelado', color: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/orders', {
        params: {
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setOrders(res.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Vendas & Pedidos
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Gestão de Pedidos
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Nº ou nome do cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-nude-400"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white font-medium focus:outline-none focus:ring-1 focus:ring-nude-400"
          >
            <option value="">Todos os Status</option>
            <option value="pending_contact">Aguardando Contato</option>
            <option value="pending_confirmation">Aguardando Confirmação</option>
            <option value="confirmed">Confirmado</option>
            <option value="preparing">Em Preparação</option>
            <option value="ready_pickup">Pronto para Retirada</option>
            <option value="out_delivery">Em Entrega</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-xs text-gray-400 mt-2">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            Nenhum pedido encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nº Pedido</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Recebimento</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {orders.map((o) => {
                  const statusInfo = statusLabels[o.status] || {
                    label: o.status,
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                  };
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-nude-900">
                        {o.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block">{o.customer_name}</span>
                        <span className="text-gray-400 text-[11px]">{o.customer_phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        {o.fulfillment_type === 'pickup' ? (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Package className="w-3.5 h-3.5" /> Retirada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Truck className="w-3.5 h-3.5" /> Entrega
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(o.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-gray-900">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/admin/pedidos/${o.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-nude-50 text-nude-700 hover:bg-nude-100 font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

