import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import adminApi from '../api/adminClient';
import { StatsCard } from '../components/StatsCard';
import { formatCurrency } from '../../utils/formatCurrency';
import { Spinner } from '../../components/ui/Spinner';

interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  orders_pending: number;
  orders_completed: number;
  total_products: number;
  total_customers: number;
  low_stock_count: number;
  out_of_stock_count: number;
  top_products: Array<{
    id: string;
    name: string;
    slug: string;
    sold_qty: string | number;
    revenue: string | number;
  }>;
  recent_orders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    status: string;
    total: string | number;
    created_at: string;
  }>;
}

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await adminApi.get('/dashboard');
        setMetrics(res.data.data);
      } catch (err) {
        console.error('Falha ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 mt-3 font-serif">Carregando métricas reais da loja...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Não foi possível carregar os dados do painel no momento.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
          Visão Geral
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1">
          Painel Comercial
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Indicadores atualizados em tempo real a partir dos dados do banco.
        </p>
      </div>

      {/* Row 1: Main Commercial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Faturamento Recebido"
          value={formatCurrency(metrics.total_revenue)}
          subtitle="Pedidos concluídos"
          icon={<DollarSign className="w-6 h-6" />}
          variant="success"
        />

        <StatsCard
          title="Pedidos Pendentes"
          value={metrics.orders_pending}
          subtitle="Aguardando confirmação/entrega"
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />

        <StatsCard
          title="Pedidos Concluídos"
          value={metrics.orders_completed}
          subtitle={`De ${metrics.total_orders} pedidos totais`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="default"
        />

        <StatsCard
          title="Produtos Ativos"
          value={metrics.total_products}
          subtitle={`${metrics.total_customers} clientes cadastrados`}
          icon={<Package className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Row 2: Inventory Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/estoque?filter=low" className="block">
          <StatsCard
            title="Estoque Baixo (Reposição)"
            value={metrics.low_stock_count}
            subtitle="Produtos abaixo da margem mínima"
            icon={<AlertTriangle className="w-6 h-6" />}
            variant={metrics.low_stock_count > 0 ? 'warning' : 'default'}
          />
        </Link>

        <Link to="/admin/estoque?filter=empty" className="block">
          <StatsCard
            title="Produtos Esgotados"
            value={metrics.out_of_stock_count}
            subtitle="Sem unidades disponíveis no catálogo"
            icon={<AlertTriangle className="w-6 h-6" />}
            variant={metrics.out_of_stock_count > 0 ? 'danger' : 'default'}
          />
        </Link>
      </div>

      {/* Row 3: Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-nude-700" />
              <span>Mais Vendidos</span>
            </h2>
            <Link to="/admin/relatorios" className="text-xs text-nude-700 hover:underline">
              Ver Relatório Completo
            </Link>
          </div>

          {metrics.top_products.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              Nenhuma venda registrada ainda.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {metrics.top_products.map((p, idx) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-nude-50 text-nude-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{p.sold_qty} un</span>
                    <span className="text-gray-400 block text-[10px]">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-nude-700" />
              <span>Últimos Pedidos</span>
            </h2>
            <Link to="/admin/pedidos" className="text-xs text-nude-700 hover:underline">
              Ver Todos os Pedidos
            </Link>
          </div>

          {metrics.recent_orders.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              Nenhum pedido recebido ainda.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {metrics.recent_orders.map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/pedidos/${o.id}`}
                  className="py-2.5 flex items-center justify-between text-xs hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div>
                    <span className="font-mono font-semibold text-nude-800">
                      {o.order_number}
                    </span>
                    <p className="text-gray-500 text-[11px]">{o.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{formatCurrency(o.total)}</span>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(o.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

